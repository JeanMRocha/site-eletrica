/**
 * loadTreeCalc.ts
 *
 * Staged electrical calculation engine (NBR 5410 / NBR 14039).
 *
 * Stages (bottom-up):
 *   1. Installed Power  → sum load.powerW × quantity for each node
 *   2. Demand Power     → apply demand factor hierarchy
 *   3. Current          → I = P / (V × cosφ)  [single-phase]
 *                       → I = P / (√3 × V × cosφ) [three-phase]
 *   4. Conductor Size   → select from CONDUCTOR_TABLE (I × 1.25 safety margin)
 *   5. Voltage Drop     → ΔV% = (2 × ρ × L × I) / (mm² × V) × 100
 *                         If > 4%, upsize conductor until ΔV ≤ 4%
 *   6. Breaker Rating   → nearest standard ≥ conductor ampacity (× 0.8)
 *   7. QDC Slots        → count circuits needing own breaker (isCritical + rooms)
 */

import type { LoadNode, LoadTree, ComputedElectrical } from './loadTreeModel';
import { CONDUCTOR_TABLE, STANDARD_BREAKERS_A } from './loadTreeModel';

const RHO_CU = 0.0172;   // Ω·mm²/m (copper)
const MAX_VOLTAGE_DROP = 4; // % (NBR 5410, residential circuits)

// ─── Stage helpers ────────────────────────────────────────────────────────────

/** Stage 1+2: Sum installed & demand power for a subtree. */
function sumPower(nodeId: string, nodes: LoadNode[]): { installed: number; demand: number } {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return { installed: 0, demand: 0 };

  const children = nodes.filter(n => n.parentId === nodeId);

  if (children.length === 0) {
    // Leaf node: use own powerW × quantity
    const installed = (node.powerW ?? 0) * (node.quantity ?? 1);
    const demand = installed * (node.demandFactor ?? 1);
    return { installed, demand };
  }

  // Branch node: sum children, then apply own demand factor
  let totalInstalled = 0;
  let totalDemand = 0;
  for (const child of children) {
    const sub = sumPower(child.id, nodes);
    totalInstalled += sub.installed;
    totalDemand += sub.demand;
  }

  const df = node.demandFactor ?? 1;
  return {
    installed: totalInstalled,
    demand: totalDemand * df,
  };
}

/** Stage 3: Calculate current from demand power. */
function calcCurrent(demandW: number, voltage: number, pf: number, phase: string): number {
  if (demandW <= 0) return 0;
  const V = voltage;
  const cosφ = pf;
  if (phase === '3F') return demandW / (Math.sqrt(3) * V * cosφ);
  if (phase === '2F') return demandW / (2 * V * cosφ);
  return demandW / (V * cosφ); // 1F
}

/** Stage 4: Select conductor from table (with 25% safety margin on current). */
function selectConductor(currentA: number): { mm2: number; label: string; maxA: number } | null {
  const required = currentA * 1.25;
  const match = CONDUCTOR_TABLE.find(c => c.maxA >= required);
  return match ?? CONDUCTOR_TABLE[CONDUCTOR_TABLE.length - 1] ?? null;
}

/** Stage 5: Calculate voltage drop (%). Returns corrected mm² if needed. */
function checkVoltageDrop(
  currentA: number,
  distanceM: number,
  mm2: number,
  voltageV: number
): { drop: number; finalMm2: number; finalLabel: string } {
  let finalMm2 = mm2;
  let finalLabel = CONDUCTOR_TABLE.find(c => c.mm2 === mm2)?.label ?? `${mm2}mm²`;

  const calcDrop = (mm2v: number) =>
    (2 * RHO_CU * distanceM * currentA) / (mm2v * voltageV) * 100;

  let drop = calcDrop(finalMm2);

  // Upsize until drop is acceptable or we run out of options
  if (drop > MAX_VOLTAGE_DROP) {
    for (const conductor of CONDUCTOR_TABLE) {
      if (conductor.mm2 >= finalMm2) {
        const d = calcDrop(conductor.mm2);
        if (d <= MAX_VOLTAGE_DROP) {
          finalMm2 = conductor.mm2;
          finalLabel = conductor.label;
          drop = d;
          break;
        }
      }
    }
  }

  return { drop: Math.round(drop * 100) / 100, finalMm2, finalLabel };
}

/** Stage 6: Select nearest standard breaker (≥ current, ≤ conductor ampacity). */
function selectBreaker(currentA: number): number {
  const required = currentA * 1.25;
  const breaker = STANDARD_BREAKERS_A.find(b => b >= required);
  return breaker ?? STANDARD_BREAKERS_A[STANDARD_BREAKERS_A.length - 1] ?? 125;
}

/** Stage 7: Count QDC slots needed (2 per critical load + 1 per room circuit). */
function countQdcSlots(nodeId: string, nodes: LoadNode[]): number {
  const children = nodes.filter(n => n.parentId === nodeId);
  let slots = 0;
  for (const child of children) {
    if (child.type === 'load' && child.isCritical) slots += 2; // dedicated bipolar
    else if (child.type === 'room') slots += 2;                // lighting + outlets
    else if (child.type === 'circuit') slots += 1;
    slots += countQdcSlots(child.id, nodes);
  }
  return slots;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs all 7 stages for every node in the tree.
 * Returns a NEW nodes array with `computed` populated.
 * Original array is NOT mutated.
 */
export function calcTree(tree: LoadTree): LoadNode[] {
  const { nodes, voltage, phase } = tree;

  return nodes.map(node => {
    const { installed, demand } = sumPower(node.id, nodes);
    const v = node.voltage ?? voltage;
    const ph = node.phase ?? phase;
    const pf = node.powerFactor ?? 0.92;
    const distM = node.distanceToParentM
      ?? node.distanceMeterToQDCM
      ?? node.distancePoleToMeterM
      ?? 0;

    const currentA = calcCurrent(demand, v, pf, ph);
    const conductor = selectConductor(currentA);
    const mm2 = conductor?.mm2 ?? 2.5;

    const { drop, finalMm2, finalLabel } = distM > 0
      ? checkVoltageDrop(currentA, distM, mm2, v)
      : { drop: 0, finalMm2: mm2, finalLabel: conductor?.label ?? '2,5mm²' };

    const breakerA = selectBreaker(currentA);
    const qdcSlots = node.hasQDC ? countQdcSlots(node.id, nodes) : 0;

    const computed: ComputedElectrical = {
      installedPowerW: installed,
      demandPowerW: Math.round(demand),
      currentA: Math.round(currentA * 10) / 10,
      conductorMm2: finalMm2,
      conductorLabel: finalLabel,
      breakerA,
      voltageDrop: drop,
      qdcSlotsNeeded: qdcSlots,
    };

    return { ...node, computed };
  });
}

/** Returns children of a given node, sorted by order. */
export function getChildren(nodeId: string | null, nodes: LoadNode[]): LoadNode[] {
  return nodes
    .filter(n => n.parentId === nodeId)
    .sort((a, b) => a.order - b.order);
}

/** Returns ancestor chain from root → given node. */
export function getAncestors(nodeId: string, nodes: LoadNode[]): LoadNode[] {
  const result: LoadNode[] = [];
  let current = nodes.find(n => n.id === nodeId);
  while (current?.parentId) {
    const parent = nodes.find(n => n.id === current!.parentId);
    if (!parent) break;
    result.unshift(parent);
    current = parent;
  }
  return result;
}

/** Validates a node and returns a list of warnings. */
export function validateNode(node: LoadNode): string[] {
  const warnings: string[] = [];
  const c = node.computed;
  if (!c) return warnings;

  if (c.voltageDrop > MAX_VOLTAGE_DROP) {
    warnings.push(`Queda de tensão ${c.voltageDrop}% acima de ${MAX_VOLTAGE_DROP}% (NBR 5410)`);
  }
  if (c.currentA > 100 && !node.hasQDC) {
    warnings.push('Corrente elevada — considere instalar sub-QDC neste ponto');
  }
  if (c.qdcSlotsNeeded > 24) {
    warnings.push(`QDC precisa de ${c.qdcSlotsNeeded} disjuntores — usar QDC modular 36 ou mais`);
  }
  return warnings;
}
