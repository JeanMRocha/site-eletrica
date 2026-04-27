/**
 * nbrCatalog.ts
 *
 * Complete normative reference catalog for NBR 5410:2004 compliant
 * electrical installation planning.
 *
 * Sources:
 *   - ABNT NBR 5410:2004 — Instalações elétricas de baixa tensão
 *   - ABNT NBR 5410:2004/Emenda 1:2008 — DPS obrigatório
 *   - ABNT NBR 14136:2012 — Plugues e tomadas
 *   - ABNT NBR 5444:1989 — Símbolos gráficos para instalações prediais
 *   - ABNT NBR IEC 60364 — Base normativa internacional
 *   - NR-10 — Segurança em instalações elétricas
 */

// ── Room functions (determines minimum outlet/lighting requirements) ───────────

export type RoomFunction =
  | 'bedroom'       // Quarto — §9.7.2: 1 por 4m² perimetro, mín 1 (até 6m²), 2 (6-10m²)
  | 'living'        // Sala/Estar — §9.7.2: 1 por 4m², mín 2 (até 10m²)
  | 'kitchen'       // Cozinha — min 3 TUG + TUE forno/micro; DR obrigatório
  | 'bathroom'      // Banheiro — 1 TUG cerca do lavatório h≥1.0m; DR obrigatório; IP44 mín
  | 'laundry'       // Lavanderia/Área serviço — DR; TUE máq. lavar; IP44
  | 'garage'        // Garagem — Externo; DR; IP44
  | 'office'        // Escritório — TUG cada 5m perimetro; pode ter aterramento separado
  | 'corridor'      // Corredor — iluminação
  | 'external'      // Área externa — DR obrigatório; IP55 mín
  | 'commercial'    // Sala comercial — laudo AVCB para acima de 200m²
  | 'technical'     // Sala técnica/barrilete — acesso restrito NR-10
  | 'other';        // Outro

// ── Moisture / environment classification (NBR 5410 §3.3 / IEC 60364-3) ─────

export type MoistureClass =
  | 'dry'           // Seco — condições normais de uso residencial
  | 'humid'         // Úmido — condensação possível, sem água direta
  | 'wet'           // Molhado — água em splashes, DR 30mA obrigatório
  | 'jetwater';     // Com jatos d'água — IP65+, DR 30mA, cuidados especiais

// ── Ambient temperature class ─────────────────────────────────────────────────

export type TempClass =
  | 'normal'        // 10–40°C — fator de correção 1.0
  | 'hot'           // 40–60°C — fator <1.0 (cozinha industrial, sala de máquinas)
  | 'cold';         // <0°C — isolação especial (câmara fria)

// ── Installation location ─────────────────────────────────────────────────────

export type LocationClass =
  | 'internal'      // Interno — sem exposição direta às intempéries
  | 'external_covered'    // Externo coberto — varanda, marquise
  | 'external_uncovered'; // Externo descoberto — área a céu aberto

// ── Fire / explosion risk ─────────────────────────────────────────────────────

export type FireRiskClass =
  | 'normal'        // Sem risco específico
  | 'flammable'     // Estrutura inflamável (madeira) — seção mínima 1.5mm²
  | 'explosive_gas' // Zona 0/1/2 — NBR 5418, equipamentos Ex
  | 'explosive_dust';// Zona 20/21/22 — NBR 5418, IP65+

// ── Conductor installation method (NBR 5410 Tabela 33) ───────────────────────

export type InstallationMethod =
  | 'A1'  // Unipolar em eletroduto embutido em parede isolante (menor capacidade)
  | 'A2'  // Multipolar em eletroduto embutido em parede isolante
  | 'B1'  // Unipolar em eletroduto embutido em alvenaria / sobre parede
  | 'B2'  // Multipolar em eletroduto em alvenaria / sobre parede
  | 'C'   // Cabo multipolar sobre parede sem eletroduto
  | 'E'   // Cabo multipolar ao ar livre
  | 'F';  // Condutores unipolares ao ar livre (maior capacidade)

// ── Grounding system (NBR 5410 §5.1 / IEC 60364-1) ──────────────────────────

export type GroundingSystem =
  | 'TN-S'    // Neutro e PE separados em toda instalação (recomendado)
  | 'TN-C-S'  // TN-C a montante, TN-S a jusante do QDC
  | 'TT'      // Aterramento independente da concessionária (muito comum residencial)
  | 'IT';     // Neutro isolado (hospitais, data centers)

// ── Supply type ───────────────────────────────────────────────────────────────

export type SupplyType =
  | 'mono_127'   // Monofásico 127V (2 fios: F+N)
  | 'mono_220'   // Monofásico 220V (2 fios: F+N)
  | 'bi_127_220' // Bifásico 127/220V (3 fios: F+F+N)
  | 'tri_127_220'// Trifásico 127/220V (4 fios: 3F+N — mais comum industrial)
  | 'tri_220_380';// Trifásico 220/380V (4 fios: 3F+N — comercial/industrial)

// ── DR (RCD) types ────────────────────────────────────────────────────────────

export type DRType =
  | 'AC'  // Detecta CA senoidal — básico, suficiente para cargas lineares
  | 'A'   // Detecta CA + CC pulsante — recomendado (computadores, eletrodomésticos)
  | 'B';  // Detecta CA + CC liso — carregadores EV, inversores solares

// ── DPS class (ABNT NBR 5410/Emenda 1:2008 + NBR IEC 61643-11) ───────────────

export type DPSClass =
  | 'none'
  | 'CT1'    // Classe I — proteção primária, absorve corrente de raio (entrada)
  | 'CT2'    // Classe II — proteção secundária, QDC principal
  | 'CT1+2'; // Coordenado Classes I+II (combinado — mais prático)

// ── Load usage class ──────────────────────────────────────────────────────────

export type LoadUsageClass =
  | 'continuous'    // >3h contínuo — dimensionar para 125% (NBR análoga NEC 210.20)
  | 'intermittent'  // <3h — padrão
  | 'short_time';   // <30min — pode usar menor bitola com justificativa

// ── Ampacity tables (NBR 5410 Tabela 36 — Cobre, isolação PVC, 30°C) ─────────

/** Method → correction factor (relative to B1=1.0) */
export const METHOD_CORRECTION: Record<InstallationMethod, number> = {
  A1: 0.75,  // Pior dissipação
  A2: 0.73,
  B1: 1.00,  // Referência
  B2: 0.90,
  C:  1.08,
  E:  1.22,
  F:  1.25,  // Melhor dissipação
};

/** Temperature correction factors for PVC insulation (base 30°C) */
export const TEMP_CORRECTION: Record<TempClass, number> = {
  cold:   1.22, // <10°C
  normal: 1.00,
  hot:    0.71, // 50°C
};

/** Grouping factor: number of circuits in same conduit */
export const GROUPING_FACTOR: Record<number, number> = {
  1: 1.00,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
};

// ── Minimum lighting power per room (NBR 5410 §9.7.2) ────────────────────────

export function minLightingVA(areaM2: number): number {
  if (areaM2 <= 0) return 100;
  if (areaM2 <= 6) return 100;
  // 100VA for first 6m², + 60VA per 4m² after
  return 100 + Math.floor((areaM2 - 6) / 4) * 60;
}

// ── Minimum outlet count per room (NBR 5410 §9.7.2) ──────────────────────────

export type MinOutletResult = {
  tugMin: number;   // Tomadas de Uso Geral minimum
  tueMin: string[]; // Tomadas de Uso Específico required
  drRequired: boolean;
  ipMinRequired: string;
  notes: string[];
};

export function minOutlets(fn: RoomFunction, areaM2: number, perimeterM: number): MinOutletResult {
  const notes: string[] = [];

  switch (fn) {
    case 'bedroom': {
      let tug = 1;
      if (areaM2 > 6)  tug = 2;
      if (areaM2 > 10) tug = Math.max(tug, Math.ceil(perimeterM / 4));
      return { tugMin: tug, tueMin: [], drRequired: false, ipMinRequired: 'IP20', notes };
    }
    case 'living': {
      let tug = 2;
      if (areaM2 > 10) tug = Math.max(tug, Math.ceil(perimeterM / 4));
      return { tugMin: tug, tueMin: [], drRequired: false, ipMinRequired: 'IP20', notes };
    }
    case 'kitchen': {
      notes.push('Mínimo 3 TUG (h: 1.0-1.2m) + TUE para aparelhos ≥1200W');
      notes.push('DR 30mA obrigatório — NBR 5410 §9.4.2');
      return {
        tugMin: 3, tueMin: ['Forno/Microondas', 'Coifa/Exaustor'],
        drRequired: true, ipMinRequired: 'IP44', notes,
      };
    }
    case 'bathroom': {
      notes.push('TUG junto ao lavatório h≥1.0m — fora das zonas 0/1 (NBR 5410 §8.2)');
      notes.push('DR 30mA tipo A obrigatório');
      notes.push('Equipamentos nas zonas 0/1/2: IP44/IPX4 mínimo');
      return { tugMin: 1, tueMin: [], drRequired: true, ipMinRequired: 'IP44', notes };
    }
    case 'laundry': {
      notes.push('TUE para máq. lavar + secadora se houver');
      notes.push('DR 30mA obrigatório');
      return {
        tugMin: 2, tueMin: ['Máquina de Lavar', 'Aquecedor/Chuveiro'],
        drRequired: true, ipMinRequired: 'IP44', notes,
      };
    }
    case 'garage': {
      notes.push('Área externa: DR 30mA + IP44 mínimo');
      return { tugMin: 1, tueMin: [], drRequired: true, ipMinRequired: 'IP44', notes };
    }
    case 'office': {
      let tug = 2;
      if (areaM2 > 10) tug = Math.max(tug, Math.ceil(perimeterM / 5));
      notes.push('Recomendado circuito exclusivo para equipamentos informáticos');
      return { tugMin: tug, tueMin: [], drRequired: false, ipMinRequired: 'IP20', notes };
    }
    case 'external': {
      notes.push('Externo: DR 30mA obrigatório + IP55 mínimo');
      notes.push('Condutores com isolação UV ou em eletroduto rígido');
      return { tugMin: 1, tueMin: [], drRequired: true, ipMinRequired: 'IP55', notes };
    }
    default:
      return { tugMin: 1, tueMin: [], drRequired: false, ipMinRequired: 'IP20', notes };
  }
}

// ── DR requirement resolver ────────────────────────────────────────────────────

export function requiresDR(
  fn: RoomFunction,
  moisture: MoistureClass,
  location: LocationClass
): { required: boolean; reason: string; drType: DRType } {
  if (fn === 'bathroom' || fn === 'laundry' || fn === 'kitchen')
    return { required: true, reason: 'Ambiente molhado — NBR 5410 §9.4.2.3', drType: 'A' };
  if (fn === 'external' || fn === 'garage')
    return { required: true, reason: 'Área externa — NBR 5410 §9.4.2.3', drType: 'A' };
  if (moisture === 'wet' || moisture === 'jetwater')
    return { required: true, reason: 'Classificação de umidade molhada', drType: 'A' };
  if (location !== 'internal')
    return { required: true, reason: 'Local não-interno — DR obrigatório', drType: 'A' };
  return { required: false, reason: '', drType: 'AC' };
}

// ── IP minimum by environment ─────────────────────────────────────────────────

export function minIP(moisture: MoistureClass, location: LocationClass): string {
  if (moisture === 'jetwater') return 'IP65';
  if (location === 'external_uncovered') return 'IP55';
  if (location === 'external_covered' || moisture === 'wet') return 'IP44';
  if (moisture === 'humid') return 'IP31';
  return 'IP20';
}

// ── Human readable labels ─────────────────────────────────────────────────────

export const ROOM_FUNCTION_LABELS: Record<RoomFunction, string> = {
  bedroom:    'Quarto / Dormitório',
  living:     'Sala / Estar / Jantar',
  kitchen:    'Cozinha',
  bathroom:   'Banheiro / WC',
  laundry:    'Lavanderia / Área de Serviço',
  garage:     'Garagem / Cobertura',
  office:     'Escritório / Home Office',
  corridor:   'Corredor / Hall / Circulação',
  external:   'Área Externa / Jardim',
  commercial: 'Sala Comercial',
  technical:  'Sala Técnica / Copa Funcionários',
  other:      'Outro',
};

export const MOISTURE_CLASS_LABELS: Record<MoistureClass, string> = {
  dry:      '☀️ Seco — condições normais',
  humid:    '💧 Úmido — condensação possível',
  wet:      '🚿 Molhado — água em splashes (DR obrigatório)',
  jetwater: '🌊 Com jatos d\'água — IP65+ exigido',
};

export const LOCATION_LABELS: Record<LocationClass, string> = {
  internal:           '🏠 Interno',
  external_covered:   '🏚️ Externo coberto (varanda, marquise)',
  external_uncovered: '☁️ Externo descoberto (jardim, área a céu aberto)',
};

export const INSTALLATION_METHOD_LABELS: Record<InstallationMethod, string> = {
  A1: 'A1 — Eletroduto embutido em parede isolante (unipolar)',
  A2: 'A2 — Eletroduto embutido em parede isolante (multipolar)',
  B1: 'B1 — Eletroduto em alvenaria / sobre parede (unipolar) ★ padrão',
  B2: 'B2 — Eletroduto em alvenaria / sobre parede (multipolar)',
  C:  'C  — Cabo sobre parede (sem eletroduto)',
  E:  'E  — Cabo multipolar ao ar livre',
  F:  'F  — Condutores unipolares ao ar livre',
};

export const SUPPLY_TYPE_LABELS: Record<SupplyType, string> = {
  mono_127:    'Monofásico 127V (F+N)',
  mono_220:    'Monofásico 220V (F+N)',
  bi_127_220:  'Bifásico 127/220V (F+F+N)',
  tri_127_220: 'Trifásico 127/220V (3F+N) — industrial',
  tri_220_380: 'Trifásico 220/380V (3F+N) — comercial',
};

export const GROUNDING_LABELS: Record<GroundingSystem, string> = {
  'TN-S':   'TN-S — Neutro e PE separados (recomendado)',
  'TN-C-S': 'TN-C-S — Misto (PE separado após QDC)',
  'TT':     'TT — Aterramento independente (residencial comum)',
  'IT':     'IT — Neutro isolado (hospitais, data centers)',
};

export const FIRE_RISK_LABELS: Record<FireRiskClass, string> = {
  normal:         '🟢 Normal',
  flammable:      '🟡 Estrutura inflamável (madeira)',
  explosive_gas:  '🔴 Atmosfera explosiva — gás (NBR 5418)',
  explosive_dust: '🔴 Atmosfera explosiva — pó (NBR 5418)',
};

export const LOAD_USAGE_LABELS: Record<LoadUsageClass, string> = {
  continuous:   'Contínuo (>3h) — fator 125%',
  intermittent: 'Intermitente (<3h) — padrão',
  short_time:   'Tempo curto (<30min)',
};
