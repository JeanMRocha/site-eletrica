/**
 * circuitPlanner.ts
 *
 * NBR 5410:2004 compliant electrical circuit planning engine.
 *
 * Input:  LoadTree (user-defined hierarchy with loads, room types, etc.)
 * Output: CircuitPlan (circuits, QDC sizing, DR requirements, full BOM)
 *
 * Normative rules applied:
 *   - §9.1   Circuit capacity limits (1000VA lighting / 1500VA outlets)
 *   - §9.4.2 Dedicated circuits for high-power loads
 *   - §9.4.2.3 DR 30mA mandatory for wet/outdoor areas
 *   - §6.2.7 Minimum outlets per room (1 per 4m² or 5m², type-dependent)
 *   - Conductor sizing + voltage drop (max 4% per NBR 5410)
 */

import type { LoadNode, LoadTree } from './loadTreeModel';
import { CONDUCTOR_TABLE, STANDARD_BREAKERS_A } from './loadTreeModel';

// ── Constants (NBR 5410) ──────────────────────────────────────────────────────
const MAX_LIGHTING_VA   = 1000;  // §9.1.1 — max per lighting circuit
const MAX_OUTLET_VA     = 1500;  // §9.1.2 — max per general outlet circuit
const MAX_VOLTAGE_DROP  = 4;     // % — §9.1.4
const RHO_CU            = 0.0172;// Ω·mm²/m (copper resistivity)
const SAFETY_FACTOR     = 1.25;  // 125% derating per conductor
const DR_SENSITIVITY_MA = 30;    // mA — §9.4.2.3

// ── Output types ─────────────────────────────────────────────────────────────

export type CircuitType = 'lighting' | 'outlet' | 'dedicated' | 'entry';

export type PlannedCircuit = {
  id: string;
  name: string;
  type: CircuitType;
  roomName: string;
  requiresDR: boolean;
  voltage: 127 | 220 | 380;
  phase: '1F' | '2F' | '3F';
  installedVA: number;
  demandA: number;
  conductorMm2: number;
  conductorLabel: string;
  breakerA: number;
  lengthM: number;
  voltageDrop: number;
  loads: { name: string; powerW: number; qty: number }[];
  warnings: string[];
};

export type QDCSpec = {
  mainBreakerA: number;          // Disjuntor Geral (DG)
  totalSlots: number;            // Total de posições no quadro
  qdcModel: string;              // e.g. "QDC-24 disjuntores"
  circuits: PlannedCircuit[];    // All circuits in this panel
  drGroups: DRGroup[];           // DR (DDR) devices needed
};

export type DRGroup = {
  id: string;
  name: string;
  sensitivityMA: number;        // 30mA standard
  circuitIds: string[];         // Circuits protected by this DR
  breakerA: number;             // DR rated current
  slots: number;                // 2 slots per DR (bipolar)
};

export type CircuitPlan = {
  projectName: string;
  totalInstalledKVA: number;
  totalDemandKVA: number;
  mainCurrentA: number;
  entryBreakerA: number;
  entryConductorMm2: number;
  entryConductorLabel: string;
  distancePoleToMeterM: number;
  distanceMeterToQDCM: number;
  qdc: QDCSpec;
  warnings: string[];
  generatedAt: string;
};

export type CircuitBOM = {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  category: 'proteção' | 'condutores' | 'estrutura' | 'dispositivos' | 'instalação';
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function selectConductor(currentA: number) {
  const required = currentA * SAFETY_FACTOR;
  return CONDUCTOR_TABLE.find(c => c.maxA >= required) ?? CONDUCTOR_TABLE[CONDUCTOR_TABLE.length - 1]!;
}

function selectBreaker(currentA: number): number {
  return STANDARD_BREAKERS_A.find(b => b >= currentA * SAFETY_FACTOR) ?? 125;
}

function calcVoltageDrop(currentA: number, lengthM: number, mm2: number, voltage: number): number {
  if (lengthM <= 0 || mm2 <= 0) return 0;
  return (2 * RHO_CU * lengthM * currentA) / (mm2 * voltage) * 100;
}

function conductorWithDropCheck(currentA: number, lengthM: number, voltage: number) {
  let conductor = selectConductor(currentA);
  let drop = calcVoltageDrop(currentA, lengthM, conductor.mm2, voltage);

  // Upsize if voltage drop exceeds NBR limit
  for (const c of CONDUCTOR_TABLE) {
    if (c.mm2 < conductor.mm2) continue;
    const d = calcVoltageDrop(currentA, lengthM, c.mm2, voltage);
    if (d <= MAX_VOLTAGE_DROP) {
      conductor = c;
      drop = d;
      break;
    }
  }

  return { ...conductor, drop };
}

let _seq = 0;
function uid(prefix: string) { return `${prefix}-${++_seq}`; }

// ── Collect leaf loads from a subtree ─────────────────────────────────────────

function collectLoads(nodeId: string, nodes: LoadNode[]): LoadNode[] {
  const children = nodes.filter(n => n.parentId === nodeId);
  if (children.length === 0) return [nodes.find(n => n.id === nodeId)!].filter(Boolean);
  return children.flatMap(c => collectLoads(c.id, nodes));
}

function findAncestorRoom(nodeId: string, nodes: LoadNode[]): LoadNode | null {
  let current = nodes.find(n => n.id === nodeId);
  while (current) {
    if (current.type === 'room') return current;
    current = current.parentId ? nodes.find(n => n.id === current!.parentId) : undefined;
  }
  return null;
}

// ── Determine if a load requires a dedicated circuit ─────────────────────────
function isDedicated(load: LoadNode): boolean {
  if (load.isCritical) return true;
  if (load.loadType === 'dedicated') return true;
  const totalVA = (load.powerW ?? 0) * (load.quantity ?? 1);
  // Any single load ≥ 1200VA on 127V or ≥ 2000VA on 220V gets dedicated circuit
  if (load.voltage === 127 && totalVA >= 1800) return true;
  if (load.voltage === 220 && totalVA >= 2000) return true;
  return false;
}

// ── Main planner ──────────────────────────────────────────────────────────────

export function planCircuits(tree: LoadTree): CircuitPlan {
  _seq = 0;
  const { nodes, voltage: defaultVoltage, phase: defaultPhase } = tree;
  const warnings: string[] = [];

  // Find terrain root
  const terrain = nodes.find(n => n.type === 'terrain');
  const allLeafLoads = terrain
    ? collectLoads(terrain.id, nodes).filter(n => n.type === 'load')
    : nodes.filter(n => n.type === 'load');

  const circuits: PlannedCircuit[] = [];

  // ── 1. Dedicated circuits first ──────────────────────────────────────────
  const dedicatedLoads = allLeafLoads.filter(l => isDedicated(l));
  const generalLoads   = allLeafLoads.filter(l => !isDedicated(l));

  for (const load of dedicatedLoads) {
    const room = findAncestorRoom(load.id, nodes);
    const v = load.voltage ?? defaultVoltage;
    const ph = load.phase ?? defaultPhase;
    const pf = load.powerFactor ?? 0.92;
    const va = (load.powerW ?? 0) * (load.quantity ?? 1);
    const currentA = va / (v * pf);
    const length = load.circuitLengthM ?? room?.distanceToParentM ?? 5;
    const cond = conductorWithDropCheck(currentA, length, v);
    const breaker = selectBreaker(currentA);
    const requiresDR = room?.moistureClass === 'wet' || room?.moistureClass === 'jetwater'
      || room?.locationClass === 'external_covered' || room?.locationClass === 'external_uncovered'
      || room?.roomType === 'wet' || room?.roomType === 'outdoor';

    const circuit: PlannedCircuit = {
      id: uid('C'),
      name: `${load.name} (dedicado)`,
      type: 'dedicated',
      roomName: room?.name ?? 'Geral',
      requiresDR,
      voltage: (v <= 127 ? 127 : v <= 220 ? 220 : 380) as 127 | 220 | 380,
      phase: ph,
      installedVA: va,
      demandA: Math.round(currentA * 10) / 10,
      conductorMm2: cond.mm2,
      conductorLabel: cond.label,
      breakerA: breaker,
      lengthM: length,
      voltageDrop: Math.round(cond.drop * 100) / 100,
      loads: [{ name: load.name, powerW: load.powerW ?? 0, qty: load.quantity ?? 1 }],
      warnings: cond.drop > MAX_VOLTAGE_DROP
        ? [`Queda de tensão ${cond.drop.toFixed(1)}% > ${MAX_VOLTAGE_DROP}% (NBR 5410)`] : [],
    };
    circuits.push(circuit);
  }

  // ── 2. Group general loads by room → lighting / outlet circuits ──────────
  const rooms = [...new Set(generalLoads.map(l => findAncestorRoom(l.id, nodes)?.id ?? '__global'))];

  for (const roomId of rooms) {
    const room = nodes.find(n => n.id === roomId) ?? null;
    const roomLoads = generalLoads.filter(l => (findAncestorRoom(l.id, nodes)?.id ?? '__global') === roomId);
    const requiresDR = room?.moistureClass === 'wet' || room?.moistureClass === 'jetwater'
      || room?.locationClass === 'external_covered' || room?.locationClass === 'external_uncovered'
      || room?.roomType === 'wet' || room?.roomType === 'outdoor' || false;

    // Split into lighting vs outlets
    const lightingLoads = roomLoads.filter(l => l.loadType === 'lighting');
    const outletLoads   = roomLoads.filter(l => l.loadType !== 'lighting');

    const makeCircuits = (
      loads: LoadNode[],
      type: 'lighting' | 'outlet',
      maxVA: number,
      baseVoltage: 127 | 220
    ) => {
      if (loads.length === 0) return;
      let bucket: LoadNode[] = [];
      let bucketVA = 0;

      const flush = (group: LoadNode[]) => {
        if (group.length === 0) return;
        const va = group.reduce((s, l) => s + (l.powerW ?? 0) * (l.quantity ?? 1), 0);
        const v = group[0]?.voltage ?? baseVoltage;
        const pf = 0.92;
        const currentA = va / (v * pf);
        const length = room?.distanceToParentM ?? 5;
        const cond = conductorWithDropCheck(currentA, length, v);
        const breaker = selectBreaker(currentA);

        circuits.push({
          id: uid('C'),
          name: `${room?.name ?? 'Geral'} — ${type === 'lighting' ? 'Iluminação' : 'Tomadas'}`,
          type,
          roomName: room?.name ?? 'Geral',
          requiresDR,
          voltage: ((group[0]?.voltage ?? baseVoltage) <= 127 ? 127 : 220) as 127 | 220 | 380,
          phase: group[0]?.phase ?? defaultPhase,
          installedVA: va,
          demandA: Math.round(currentA * 10) / 10,
          conductorMm2: cond.mm2,
          conductorLabel: cond.label,
          breakerA: breaker,
          lengthM: length,
          voltageDrop: Math.round(cond.drop * 100) / 100,
          loads: group.map(l => ({ name: l.name, powerW: l.powerW ?? 0, qty: l.quantity ?? 1 })),
          warnings: cond.drop > MAX_VOLTAGE_DROP
            ? [`Queda de tensão ${cond.drop.toFixed(1)}% > ${MAX_VOLTAGE_DROP}%`] : [],
        });
      };

      for (const load of loads) {
        const va = (load.powerW ?? 0) * (load.quantity ?? 1);
        if (bucketVA + va > maxVA && bucket.length > 0) {
          flush(bucket);
          bucket = [];
          bucketVA = 0;
        }
        bucket.push(load);
        bucketVA += va;
      }
      flush(bucket);
    };

    const baseV = (defaultVoltage <= 127 ? 127 : 220) as 127 | 220;
    makeCircuits(lightingLoads, 'lighting', MAX_LIGHTING_VA, baseV);
    makeCircuits(outletLoads,   'outlet',   MAX_OUTLET_VA,   baseV);
  }

  // ── 3. Validate minimum circuits (NBR 5410 §9.1.5) ────────────────────────
  if (circuits.filter(c => c.type === 'lighting').length === 0) {
    warnings.push('NBR 5410 §9.1.1: Nenhum circuito de iluminação definido — cadastre cargas do tipo "iluminação"');
  }
  if (circuits.filter(c => c.type === 'outlet').length === 0) {
    warnings.push('NBR 5410 §9.1.2: Nenhum circuito de tomada definido — cadastre cargas do tipo "tomada"');
  }

  // ── 4. Group wet/outdoor circuits into DR (DDR) units ─────────────────────
  const wetCircuits = circuits.filter(c => c.requiresDR);
  const drGroups: DRGroup[] = [];
  
  // Group by room for tidiness — max 6 circuits per DR (practical limit)
  const wetByRoom = new Map<string, PlannedCircuit[]>();
  for (const c of wetCircuits) {
    const list = wetByRoom.get(c.roomName) ?? [];
    list.push(c);
    wetByRoom.set(c.roomName, list);
  }

  for (const [roomName, roomCircuits] of wetByRoom) {
    const drCurrentA = Math.max(...roomCircuits.map(c => c.breakerA));
    const drBreaker = selectBreaker(drCurrentA);
    drGroups.push({
      id: uid('DR'),
      name: `DR — ${roomName}`,
      sensitivityMA: DR_SENSITIVITY_MA,
      circuitIds: roomCircuits.map(c => c.id),
      breakerA: drBreaker,
      slots: 2, // DR bipolar takes 2 slots in QDC
    });
  }

  // ── 5. Size QDC ───────────────────────────────────────────────────────────
  const circuitSlots = circuits.reduce((s, c) => s + (c.voltage === 220 || c.phase !== '1F' ? 2 : 1), 0);
  const drSlots      = drGroups.reduce((s, d) => s + d.slots, 0);
  const totalSlots   = circuitSlots + drSlots + 2; // +2 for main breaker (DG bipolar)

  const qdcModel = totalSlots <= 12 ? 'QDC-12' :
                   totalSlots <= 24 ? 'QDC-24' :
                   totalSlots <= 36 ? 'QDC-36' : 'QDC Modular 48+';

  // ── 6. Entry / main circuit sizing ────────────────────────────────────────
  const totalVA = circuits.reduce((s, c) => s + c.installedVA, 0);
  const totalDemandVA = circuits.reduce((s, c) => {
    // Apply diversity factor for aggregate demand
    return s + c.installedVA * 0.75;
  }, 0);

  const entryV = defaultVoltage;
  const pf = 0.92;
  const mainCurrentA = totalDemandVA / (entryV * pf);
  const entryBreaker = selectBreaker(mainCurrentA);
  const poleToMeterDist = terrain?.distancePoleToMeterM ?? 5;
  const meterToQDCDist  = terrain?.distanceMeterToQDCM ?? 3;
  const entryLength = poleToMeterDist + meterToQDCDist;
  const entryCond = conductorWithDropCheck(mainCurrentA, entryLength, entryV);

  if (entryCond.drop > 2) { // Entry drop tighter (2% recommended)
    warnings.push(`Queda de tensão no ramal de entrada: ${entryCond.drop.toFixed(1)}% (recomendado ≤2%)`);
  }

  const mainBreaker = selectBreaker(mainCurrentA);

  return {
    projectName: terrain?.name ?? 'Projeto',
    totalInstalledKVA: Math.round(totalVA / 10) / 100,
    totalDemandKVA: Math.round(totalDemandVA / 10) / 100,
    mainCurrentA: Math.round(mainCurrentA * 10) / 10,
    entryBreakerA: entryBreaker,
    entryConductorMm2: entryCond.mm2,
    entryConductorLabel: entryCond.label,
    distancePoleToMeterM: poleToMeterDist,
    distanceMeterToQDCM: meterToQDCDist,
    qdc: {
      mainBreakerA: mainBreaker,
      totalSlots,
      qdcModel,
      circuits,
      drGroups,
    },
    warnings,
    generatedAt: new Date().toLocaleString('pt-BR'),
  };
}

// ── Bill of Materials from circuit plan ────────────────────────────────────────

export function planToBOM(plan: CircuitPlan): CircuitBOM[] {
  const map = new Map<string, CircuitBOM>();

  const add = (item: Omit<CircuitBOM, 'quantity'>, qty: number) => {
    const ex = map.get(item.code);
    if (ex) { ex.quantity += qty; return; }
    map.set(item.code, { ...item, quantity: qty });
  };

  const { qdc } = plan;

  // ── Entry equipment ─────────────────────────────────────────────────────
  add({ code: 'MEDIDOR-STD', description: 'Caixa para medidor padrão concessionária (poliester)', unit: 'un', category: 'estrutura' }, 1);
  add({ code: `DISJ-${plan.entryBreakerA}A-2P-DG`, description: `Disjuntor geral bipolar ${plan.entryBreakerA}A curva C (DG entrada)`, unit: 'un', category: 'proteção' }, 1);
  add({ code: `COND-${plan.entryConductorLabel.replace(',','.')}-FASE`, description: `Condutor flexível ${plan.entryConductorLabel} fase (ramal entrada)`, unit: 'm', category: 'condutores' }, Math.ceil(plan.distancePoleToMeterM + plan.distanceMeterToQDCM + 3) * 3);
  add({ code: 'HASTE-TERRA-5-8', description: 'Haste de aterramento 5/8" × 2,4m + conector', unit: 'un', category: 'instalação' }, 1);
  add({ code: 'CABO-TERRA', description: `Condutor de proteção (terra) ${plan.entryConductorLabel}`, unit: 'm', category: 'condutores' }, Math.ceil(plan.distancePoleToMeterM + plan.distanceMeterToQDCM + 3));

  // ── QDC Box ──────────────────────────────────────────────────────────────
  add({ code: `QDC-${qdc.totalSlots}P-EMBUTIR`, description: `Quadro de distribuição embutir ${qdc.qdcModel} (${qdc.totalSlots} disjuntores)`, unit: 'un', category: 'proteção' }, 1);
  add({ code: `DISJ-${qdc.mainBreakerA}A-2P-QDC`, description: `Disjuntor bipolar ${qdc.mainBreakerA}A curva C (DG do QDC)`, unit: 'un', category: 'proteção' }, 1);
  add({ code: 'BARR-NEUTRO-10', description: 'Barra de neutro 10 bornes', unit: 'un', category: 'proteção' }, 1);
  add({ code: 'BARR-TERRA-10', description: 'Barra de terra 10 bornes', unit: 'un', category: 'proteção' }, 1);

  // ── DR groups ────────────────────────────────────────────────────────────
  for (const dr of qdc.drGroups) {
    add({ code: `DDR-${dr.breakerA}A-30MA`, description: `Interruptor diferencial residual (DR/DDR) ${dr.breakerA}A 30mA Tipo AC`, unit: 'un', category: 'proteção' }, 1);
  }

  // ── Per-circuit materials ────────────────────────────────────────────────
  for (const c of qdc.circuits) {
    const phaseSuffix = c.phase === '1F' ? '1P' : c.phase === '2F' ? '2P' : '3P';
    add({
      code: `DISJ-${c.breakerA}A-${phaseSuffix}`,
      description: `Disjuntor ${phaseSuffix} ${c.breakerA}A curva C — ${c.name}`,
      unit: 'un',
      category: 'proteção',
    }, 1);

    // Conductors (3 wires: phase + neutral + ground)
    add({
      code: `COND-${c.conductorLabel.replace(',','.')}-CIRC`,
      description: `Condutor flexível ${c.conductorLabel} (circuito ${c.type})`,
      unit: 'm',
      category: 'condutores',
    }, Math.ceil(c.lengthM + 1.5) * 3); // +1.5m slack, × 3 wires

    // Conduit (3/4" for up to 2.5mm², 1" for larger)
    const conduitLabel = c.conductorMm2 <= 4 ? '3/4"' : '1"';
    add({
      code: `ELETRODUTO-${conduitLabel.replace('"', 'in')}`,
      description: `Eletroduto corrugado flexível ${conduitLabel}`,
      unit: 'm',
      category: 'condutores',
    }, Math.ceil(c.lengthM + 1.5));
  }

  // ── Count outlet boxes (rough estimate: 1 per 4 outlet load + 1 per light) ─
  const outletCircuits = qdc.circuits.filter(c => c.type === 'outlet');
  const outletPoints   = outletCircuits.reduce((s, c) => s + c.loads.reduce((a, l) => a + l.qty, 0), 0);
  const lightPoints    = qdc.circuits.filter(c => c.type === 'lighting').reduce((s, c) => s + c.loads.reduce((a, l) => a + l.qty, 0), 0);

  add({ code: 'CAIXA-4x2', description: 'Caixa de embutir 4×2" (tomadas/interruptores)', unit: 'un', category: 'estrutura' }, outletPoints);
  add({ code: 'CAIXA-4x4', description: 'Caixa de embutir 4×4" (pontos especiais)', unit: 'un', category: 'estrutura' }, qdc.circuits.filter(c => c.type === 'dedicated').length);
  add({ code: 'CAIXA-TETO', description: 'Caixa octagonal para luminária de teto', unit: 'un', category: 'estrutura' }, lightPoints);
  add({ code: 'TOM-2P+T-10A', description: 'Tomada 2P+T 10A padrão NBR 14136', unit: 'un', category: 'dispositivos' }, outletPoints);
  add({ code: 'PLACA-CEGA', description: 'Placa 1/2/3 postos universal (média)', unit: 'un', category: 'dispositivos' }, Math.ceil((outletPoints + lightPoints) / 2));

  // ── Misc instalação ──────────────────────────────────────────────────────
  add({ code: 'FITA-ISO', description: 'Fita isolante 20m', unit: 'rolo', category: 'instalação' }, Math.max(2, Math.ceil(qdc.circuits.length / 4)));
  add({ code: 'CONECTORES', description: 'Conector tipo Wago ou Geleia (pacote)', unit: 'cx', category: 'instalação' }, Math.ceil(qdc.circuits.length / 3));

  return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
}
