import type { CanvasItem, CanvasLink, CanvasNode } from '../../domain/residential-projects';

export type MaterialItem = {
  id: string;
  code: string;
  description: string;
  unit: 'un' | 'm' | 'cx' | 'rolo' | 'par';
  quantity: number;
  unitCost: number; // BRL
  origin: 'auto' | 'manual'; // auto = derived from canvas, manual = user-added
  category: 'instalação' | 'condutores' | 'proteção' | 'estrutura' | 'dispositivos';
};

export type MaterialsState = {
  items: MaterialItem[];
  notes: string;
};

// Default catalog: maps CanvasTool → list of materials per unit
const TOOL_CATALOG: Record<string, { code: string; description: string; unit: MaterialItem['unit']; unitCost: number; category: MaterialItem['category'] }[]> = {
  'socket': [
    { code: 'TOM-2P+T', description: 'Tomada 2P+T padrão NBR 14136 10A', unit: 'un', unitCost: 18.90, category: 'dispositivos' },
    { code: 'CAIXA-4x2', description: 'Caixa de embutir 4x2"', unit: 'un', unitCost: 3.50, category: 'estrutura' },
    { code: 'PLACA-1G', description: 'Placa 1 posto universal', unit: 'un', unitCost: 6.00, category: 'dispositivos' },
  ],
  'switch': [
    { code: 'INT-SIMPLES', description: 'Interruptor simples 10A', unit: 'un', unitCost: 12.00, category: 'dispositivos' },
    { code: 'CAIXA-4x2', description: 'Caixa de embutir 4x2"', unit: 'un', unitCost: 3.50, category: 'estrutura' },
    { code: 'PLACA-1G', description: 'Placa 1 posto universal', unit: 'un', unitCost: 6.00, category: 'dispositivos' },
  ],
  'luminaire': [
    { code: 'LUM-LED', description: 'Luminária LED de embutir 9W', unit: 'un', unitCost: 45.00, category: 'dispositivos' },
    { code: 'SUPORTE-LUM', description: 'Suporte/aro para luminária de embutir', unit: 'un', unitCost: 8.00, category: 'estrutura' },
  ],
  'shower': [
    { code: 'CHUV-7500W', description: 'Chuveiro elétrico 7500W 220V', unit: 'un', unitCost: 180.00, category: 'dispositivos' },
    { code: 'DISJ-40A', description: 'Disjuntor bipolar 40A curva C', unit: 'un', unitCost: 65.00, category: 'proteção' },
    { code: 'CAIXA-4x4', description: 'Caixa de embutir 4x4"', unit: 'un', unitCost: 5.50, category: 'estrutura' },
  ],
  'air-conditioner': [
    { code: 'TOM-20A', description: 'Tomada 2P+T 20A padrão NBR 14136', unit: 'un', unitCost: 35.00, category: 'dispositivos' },
    { code: 'DISJ-20A', description: 'Disjuntor bipolar 20A curva C', unit: 'un', unitCost: 48.00, category: 'proteção' },
  ],
  'qdc': [
    { code: 'QDC-12', description: 'Quadro de distribuição 12 disjuntores embutir', unit: 'un', unitCost: 95.00, category: 'proteção' },
    { code: 'DISJ-25A-GERAL', description: 'Disjuntor geral bipolar 25A', unit: 'un', unitCost: 68.00, category: 'proteção' },
    { code: 'BARR-NEUTRO', description: 'Barra de neutro 10 bornes', unit: 'un', unitCost: 28.00, category: 'proteção' },
    { code: 'BARR-TERRA', description: 'Barra de terra 10 bornes', unit: 'un', unitCost: 24.00, category: 'proteção' },
  ],
  'source-post': [
    { code: 'RAMAL-DISJUNTOR', description: 'Disjuntor bipolar 63A (ramal entrada)', unit: 'un', unitCost: 120.00, category: 'proteção' },
    { code: 'MEDIDOR', description: 'Caixa para medidor padrão concessionária', unit: 'un', unitCost: 210.00, category: 'estrutura' },
    { code: 'ATERRAMENTO', description: 'Kit aterramento (haste + conector)', unit: 'un', unitCost: 95.00, category: 'instalação' },
  ],
  'source-solar': [
    { code: 'INV-SOLAR', description: 'Inversor solar string (ver projeto específico)', unit: 'un', unitCost: 3200.00, category: 'dispositivos' },
    { code: 'PAINEL-400W', description: 'Painel solar fotovoltaico 400Wp', unit: 'un', unitCost: 850.00, category: 'dispositivos' },
    { code: 'DISJ-CC', description: 'Disjuntor CC bipolar para proteção string', unit: 'un', unitCost: 145.00, category: 'proteção' },
  ],
};

// Wall/conductor materials based on wall length
const CONDUCTOR_PER_METER = [
  { code: 'COND-2-5', description: 'Condutor flexível 2,5mm² (fio fase)', unit: 'm' as const, unitCost: 4.80, category: 'condutores' as const },
  { code: 'COND-1-5', description: 'Condutor flexível 1,5mm² (neutro/terra)', unit: 'm' as const, unitCost: 3.20, category: 'condutores' as const },
  { code: 'ELETRODUTO-3-4', description: 'Eletroduto corrugado 3/4" (por metro)', unit: 'm' as const, unitCost: 2.10, category: 'condutores' as const },
];

// Shared items added once per project
const PROJECT_BASE_MATERIALS: MaterialItem[] = [
  {
    id: 'base-fita',
    code: 'FITA-ISO',
    description: 'Fita isolante 20m (rolo)',
    unit: 'rolo',
    quantity: 2,
    unitCost: 8.50,
    origin: 'auto',
    category: 'instalação',
  },
  {
    id: 'base-cabo-pp',
    code: 'CABO-PP-2X1-5',
    description: 'Cabo PP 2x1,5mm² multipolar (m)',
    unit: 'm',
    quantity: 10,
    unitCost: 5.90,
    origin: 'auto',
    category: 'condutores',
  },
];

/** 
 * Derives a bill of materials from canvas items and links.
 * Groups by material code to avoid duplicates and sums quantities.
 */
export function deriveMaterials(
  items: CanvasItem[],
  links: CanvasLink[],
  nodes: CanvasNode[]
): MaterialItem[] {
  const map = new Map<string, MaterialItem>();

  const addOrAccumulate = (mat: Omit<MaterialItem, 'id' | 'quantity' | 'origin'>, qty: number) => {
    const existing = map.get(mat.code);
    if (existing) {
      existing.quantity += qty;
    } else {
      map.set(mat.code, {
        id: `auto-${mat.code}`,
        ...mat,
        quantity: qty,
        origin: 'auto',
      });
    }
  };

  // Process canvas items
  for (const item of items) {
    const catalog = TOOL_CATALOG[item.tool];
    if (catalog) {
      for (const entry of catalog) {
        addOrAccumulate(entry, 1);
      }
    }
  }

  // Process walls (links) - estimate conductor length from geometry
  for (const link of links) {
    const n1 = nodes.find(n => n.id === link.sourceNodeId);
    const n2 = nodes.find(n => n.id === link.targetNodeId);
    if (n1 && n2) {
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const lengthPx = Math.sqrt(dx * dx + dy * dy);
      // Convert: assume 1px = 0.05m at default scale (20px/m)
      const lengthM = Math.max(1, Math.round((lengthPx / 20) * 10) / 10);

      for (const conductor of CONDUCTOR_PER_METER) {
        addOrAccumulate(conductor, lengthM);
      }
    }
  }

  // Add base project materials
  for (const base of PROJECT_BASE_MATERIALS) {
    if (!map.has(base.code)) {
      map.set(base.code, { ...base });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
}

export function calcTotal(materials: MaterialItem[]): number {
  return materials.reduce((sum, m) => sum + m.quantity * m.unitCost, 0);
}

export function groupByCategory(materials: MaterialItem[]): Record<string, MaterialItem[]> {
  return materials.reduce((acc, m) => {
    const cat = acc[m.category] ?? [];
    cat.push(m);
    acc[m.category] = cat;
    return acc;
  }, {} as Record<string, MaterialItem[]>);
}
