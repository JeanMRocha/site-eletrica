import type { CanvasItem, CanvasTool, CanvasNode } from '../../domain/residential-projects';
export type { CanvasTool };

export type CanvasSelection =
  | { kind: 'item'; id: string }
  | { kind: 'node'; id: string }
  | { kind: 'link'; id: string }
  | null;

export type ToolDefinition = {
  key: CanvasTool;
  label: string;
  icon: string;
  group: 'Sistema' | 'Ambientes' | 'Estrutura' | 'Entrada' | 'Pontos' | 'Circuitos';
};

export type DesignerStage = 'FLOOR' | 'WALL' | 'ELECTRICAL';
export const gridSize = 24;
export const minimumEnvironmentSize = { width: 120, height: 84 };

export const tools: ToolDefinition[] = [
  { key: 'select', label: 'Seleção', icon: '↗', group: 'Sistema' },
  { key: 'pan', label: 'Panorâmica', icon: '✋', group: 'Sistema' },
  { key: 'site-area', label: 'Terreno', icon: '▦', group: 'Ambientes' },
  { key: 'wall', label: 'Parede', icon: '│', group: 'Estrutura' },
  { key: 'source-post', label: 'Poste Concessionária', icon: '🏗️', group: 'Entrada' },
  { key: 'source-solar', label: 'Painel Solar', icon: '☀️', group: 'Entrada' },
  { key: 'source-generator', label: 'Gerador', icon: '🔋', group: 'Entrada' },
  { key: 'qdc', label: 'QDC', icon: '▣', group: 'Circuitos' },
  { key: 'socket', label: 'Tomada', icon: '◬', group: 'Pontos' },
  { key: 'switch', label: 'Interruptor', icon: '◓', group: 'Pontos' },
  { key: 'luminaire', label: 'Luminária', icon: '☼', group: 'Pontos' },
  { key: 'shower', label: 'Chuveiro', icon: '🚿', group: 'Pontos' },
  { key: 'air-conditioner', label: 'Ar-condicionado', icon: '❅', group: 'Pontos' },
  { key: 'special-load', label: 'Carga especial', icon: '◈', group: 'Pontos' },
  { key: 'circuit-line', label: 'Circuito', icon: '〜', group: 'Circuitos' },
];

export const canvasLabels: Record<CanvasTool, string> = {
  select: 'Seleção',
  pan: 'Panorâmica',
  wall: 'Parede',
  'site-area': 'Terreno',
  'source-post': 'Poste',
  'source-solar': 'Solar',
  'source-generator': 'Gerador',
  qdc: 'QDC',
  socket: 'Tomada',
  switch: 'Interruptor',
  luminaire: 'Luminária',
  shower: 'Chuveiro',
  'air-conditioner': 'Ar-condicionado',
  'special-load': 'Carga especial',
  'circuit-line': 'Circuito',
};

export function getAvailableTools(_items: CanvasItem[], _nodes: CanvasNode[]) {
  return tools;
}

export function getDesignerStage(items: CanvasItem[], _nodes: CanvasNode[]) {
  const hasSite = items.some((item) => item.tool === 'site-area');
  if (!hasSite) return 'FLOOR';
  return 'ELECTRICAL';
}

export function getAvailableToolsForStage(stage: DesignerStage) {
  switch (stage) {
    case 'FLOOR':
      return tools.filter(t => t.key === 'site-area' || t.group === 'Entrada');
    case 'WALL':
      return tools.filter(t => t.key === 'wall');
    case 'ELECTRICAL':
      return tools.filter(t => t.group === 'Pontos' || t.group === 'Circuitos' || t.key === 'qdc');
    default:
      return [];
  }
}

export type StageReadiness = {
  ready: boolean;
  message?: string;
};

export function checkStageReadiness(stage: DesignerStage, items: CanvasItem[], links: any[]): StageReadiness {
  const hasSite = items.some(i => i.tool === 'site-area');
  const hasWalls = links.length > 0;

  if (stage === 'WALL') {
    if (!hasSite) return { ready: false, message: 'Defina a área do TERRENO antes de iniciar as paredes.' };
  }
  
  if (stage === 'ELECTRICAL') {
    if (!hasSite) return { ready: false, message: 'Defina a área do TERRENO antes de iniciar a elétrica.' };
    if (!hasWalls) return { ready: false, message: 'Desenhe ao menos uma PAREDE para posicionar os pontos elétricos.' };
  }

  return { ready: true };
}

export function groupTools(items: ToolDefinition[]) {
  const groups = new Map<ToolDefinition['group'], ToolDefinition[]>();
  for (const item of items) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  return Array.from(groups, ([name, groupItems]) => ({ name, items: groupItems }));
}

export function snap(value: number, shouldSnap: boolean = true) {
  if (!shouldSnap) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function pixelsToMeters(value: number, scale: number = 1, precision: number = 2): number {
  const meters = value / gridSize;
  return Number((meters * scale).toFixed(precision));
}

export function metersToPixels(value: string | number, scale: number = 1, unit: string = 'm'): number {
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return 0;

  let meters = num;
  if (unit === 'cm') meters = num / 100;
  if (unit === 'mm') meters = num / 1000;

  return (meters / scale) * gridSize;
}

export function formatMeters(value: number, unit: string = 'm', scale: number = 1) {
  const meters = (value / gridSize) * scale;
  if (unit === 'cm') return `${(meters * 100).toFixed(1)}cm`;
  if (unit === 'mm') return `${(meters * 1000).toFixed(0)}mm`;
  return `${meters.toFixed(2)}m`;
}

export function decimalToDMS(decimal: number): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  return `${decimal < 0 ? '-' : ''}${degrees}° ${minutes}' ${seconds}"`;
}

export function dmsToDecimal(dms: string): number {
  if (!dms) return 0;
  const regex = /(-?\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*/;
  const match = dms.match(regex);
  if (!match) return parseFloat(dms) || 0;

  const degrees = parseFloat(match[1] || '0');
  const minutes = parseFloat(match[2] || '0');
  const seconds = parseFloat(match[3] || '0');

  const decimal = Math.abs(degrees) + (minutes / 60) + (seconds / 3600);
  return degrees < 0 ? -decimal : decimal;
}

export function normalizeRotation(value: number) {
  return ((value % 360) + 360) % 360;
}

export function pointsToPath(points: { x: number; y: number; curvature?: number }[]): string {
  if (!points || points.length === 0 || !points[0]) return '';
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    
    if (!p1 || !p2) continue;

    if (p1.curvature) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const offsetX = (-dy / dist) * p1.curvature * (dist / 2);
      const offsetY = (dx / dist) * p1.curvature * (dist / 2);
      
      const cx = midX + offsetX;
      const cy = midY + offsetY;
      
      path += ` Q ${cx} ${cy}, ${p2.x} ${p2.y}`;
    } else {
      path += ` L ${p2.x} ${p2.y}`;
    }
  }
  
  return path + ' Z';
}

export function shortLabel(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 4) return normalized;
  return normalized.slice(0, 4).toUpperCase();
}

export function formatZoom(zoom: number) {
  return `${Math.round(zoom * 100)}%`;
}
