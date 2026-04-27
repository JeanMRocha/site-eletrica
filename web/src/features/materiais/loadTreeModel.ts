/**
 * loadTreeModel.ts
 * 
 * Data model for the hierarchical electrical load tree.
 * 
 * Design rationale (NBR 5410):
 *   - Tree is stored flat (parentId reference) for easy serialization
 *   - Computed properties are derived bottom-up (leaves → root)
 *   - Each node type carries sensible defaults for demand factors
 */

export type LoadNodeType =
  | 'terrain'    // Root: the lot / property
  | 'building'   // A building or sub-unit (e.g. "Sindicato")
  | 'room'       // A room within a building
  | 'circuit'    // A circuit (lighting, outlets, etc.)
  | 'load';      // Individual load (appliance or fixture group)

export type VoltageLevel = 127 | 220;
export type PhaseConfig = '1F' | '2F' | '3F';
export type ConductorMaterial = 'Cu' | 'Al';

// ── Computed properties derived from the engine ──────────────────────────────
export type ComputedElectrical = {
  installedPowerW: number;   // Sum of all loads (raw)
  demandPowerW: number;      // After demand factor
  currentA: number;          // I = P / (V × pf)
  conductorMm2: number;      // Recommended conductor cross-section
  conductorLabel: string;    // e.g. "2,5mm²"
  breakerA: number;          // Nearest standard breaker rating
  voltageDrop: number;       // % voltage drop (needs distanceM)
  qdcSlotsNeeded: number;    // Number of QDC slots required
};

// ── User-editable node definition ────────────────────────────────────────────
export type LoadNode = {
  id: string;
  parentId: string | null;
  type: LoadNodeType;
  name: string;
  expanded: boolean;
  order: number;

  // Terrain / Entry infrastructure (only meaningful at terrain/building nodes)
  distancePoleToMeterM?: number;   // Distance from utility pole to energy meter
  distanceMeterToQDCM?: number;    // Distance from meter to main QDC
  distanceToParentM?: number;      // Sub-circuit distance (room / circuit level)

  // Load inputs (leaf nodes)
  powerW?: number;            // Rated power of one unit (W)
  quantity?: number;          // Number of identical units
  demandFactor?: number;      // 0–1. Default depends on type/room
  powerFactor?: number;       // Default 0.92 (resistive/mixed)
  voltage?: VoltageLevel;     // 127 or 220V
  phase?: PhaseConfig;        // '1F', '2F', '3F'
  isCritical?: boolean;       // Flags dedicated circuit requirement

  // Infrastructure flags
  hasQDC?: boolean;           // Node has its own sub-panel
  hasEnergyMeter?: boolean;   // Node has its own meter (multi-unit buildings)

  // Computed (populated by calcTree(), read-only in UI)
  computed?: ComputedElectrical;
};

// ── Serializable project tree ─────────────────────────────────────────────────
export type LoadTree = {
  nodes: LoadNode[];
  voltage: VoltageLevel;  // Project-wide default voltage
  phase: PhaseConfig;     // Project-wide phase
};

// ── Standard breaker ratings (NBR IEC 60898) ─────────────────────────────────
export const STANDARD_BREAKERS_A = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

// ── Standard conductor cross-sections mm² and their max sustained current ────
export const CONDUCTOR_TABLE: { mm2: number; label: string; maxA: number }[] = [
  { mm2: 1.5,  label: '1,5mm²',  maxA: 15.5  },
  { mm2: 2.5,  label: '2,5mm²',  maxA: 21    },
  { mm2: 4,    label: '4mm²',    maxA: 28    },
  { mm2: 6,    label: '6mm²',    maxA: 36    },
  { mm2: 10,   label: '10mm²',   maxA: 50    },
  { mm2: 16,   label: '16mm²',   maxA: 66    },
  { mm2: 25,   label: '25mm²',   maxA: 84    },
  { mm2: 35,   label: '35mm²',   maxA: 103   },
  { mm2: 50,   label: '50mm²',   maxA: 125   },
  { mm2: 70,   label: '70mm²',   maxA: 160   },
];

// Resistivity of copper used in loadTreeCalc.ts (kept here for reference)
// const RHO_CU = 0.0172; // Ω·mm²/m at 20°C

// ── Default demand factors (NBR 5410 simplified) ─────────────────────────────
export const DEFAULT_DEMAND_FACTORS: Record<LoadNodeType, number> = {
  terrain:  1.0,
  building: 1.0,
  room:     0.8,   // Diversity factor across rooms
  circuit:  0.9,
  load:     1.0,   // Individual loads at 100%
};

// ── Factory helpers ───────────────────────────────────────────────────────────
let _seq = 1;
export function makeId() { return `n-${Date.now()}-${_seq++}`; }

export function makeNode(
  partial: Partial<LoadNode> & Pick<LoadNode, 'type' | 'name' | 'parentId'>
): LoadNode {
  return {
    id: makeId(),
    expanded: true,
    order: 0,
    demandFactor: DEFAULT_DEMAND_FACTORS[partial.type],
    powerFactor: 0.92,
    quantity: 1,
    ...partial,
  };
}

/** Build a minimal starter tree (Terrain → Building → Room → example loads). */
export function buildStarterTree(projectName: string): LoadTree {
  const terrainId = makeId();
  const buildingId = makeId();
  const salaId = makeId();
  const cozinhaId = makeId();

  return {
    voltage: 127,
    phase: '1F',
    nodes: [
      {
        id: terrainId, parentId: null, type: 'terrain',
        name: projectName, expanded: true, order: 0,
        distancePoleToMeterM: 5,
        distanceMeterToQDCM: 3,
        hasEnergyMeter: true, hasQDC: true,
      },
      {
        id: buildingId, parentId: terrainId, type: 'building',
        name: 'Edificação Principal', expanded: true, order: 0,
        hasQDC: false,
        distanceToParentM: 0,
      },
      {
        id: salaId, parentId: buildingId, type: 'room',
        name: 'Sala / Estar', expanded: true, order: 0,
        demandFactor: 0.8,
      },
      makeNode({ parentId: salaId, type: 'load', name: 'Tomadas Gerais (sala)', powerW: 1200, quantity: 3, voltage: 127 }),
      makeNode({ parentId: salaId, type: 'load', name: 'Iluminação LED', powerW: 60, quantity: 4, voltage: 127 }),
      makeNode({ parentId: salaId, type: 'load', name: 'TV / Home Theater', powerW: 300, quantity: 1, voltage: 127 }),
      {
        id: cozinhaId, parentId: buildingId, type: 'room',
        name: 'Cozinha', expanded: true, order: 1,
        demandFactor: 0.75,
      },
      makeNode({ parentId: cozinhaId, type: 'load', name: 'Micro-ondas', powerW: 1200, quantity: 1, voltage: 127, isCritical: true }),
      makeNode({ parentId: cozinhaId, type: 'load', name: 'Geladeira', powerW: 150, quantity: 1, voltage: 127 }),
      makeNode({ parentId: cozinhaId, type: 'load', name: 'Forno Elétrico', powerW: 2000, quantity: 1, voltage: 220, isCritical: true }),
    ],
  };
}
