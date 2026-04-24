import type { CanvasItem, CanvasTool, CanvasWall } from '../../domain/residential-projects';

export type CanvasSelection =
  | { kind: 'item'; id: string }
  | { kind: 'wall'; id: string }
  | null;

export type ToolDefinition = {
  key: CanvasTool;
  label: string;
  group: 'Ambientes' | 'Estrutura' | 'Entrada' | 'Pontos' | 'Circuitos';
};

export const gridSize = 24;
export const minimumEnvironmentSize = { width: 120, height: 84 };

export const tools: ToolDefinition[] = [
  { key: 'environment', label: 'Ambiente', group: 'Ambientes' },
  { key: 'wall', label: 'Parede', group: 'Estrutura' },
  { key: 'network-source', label: 'Origem', group: 'Entrada' },
  { key: 'qdc', label: 'QDC', group: 'Entrada' },
  { key: 'socket', label: 'Tomada', group: 'Pontos' },
  { key: 'switch', label: 'Interruptor', group: 'Pontos' },
  { key: 'luminaire', label: 'Luminária', group: 'Pontos' },
  { key: 'shower', label: 'Chuveiro', group: 'Pontos' },
  { key: 'air-conditioner', label: 'Ar-condicionado', group: 'Pontos' },
  { key: 'special-load', label: 'Carga especial', group: 'Pontos' },
  { key: 'circuit-line', label: 'Circuito', group: 'Circuitos' },
];

export const canvasLabels: Record<CanvasTool, string> = {
  wall: 'Parede',
  environment: 'Ambiente',
  'network-source': 'Origem',
  qdc: 'QDC',
  socket: 'Tomada',
  switch: 'Interruptor',
  luminaire: 'Luminária',
  shower: 'Chuveiro',
  'air-conditioner': 'Ar-condicionado',
  'special-load': 'Carga especial',
  'circuit-line': 'Circuito',
};

const pointTools: CanvasTool[] = ['socket', 'switch', 'luminaire', 'shower', 'air-conditioner', 'special-load'];

export function getAvailableTools(items: CanvasItem[], walls: CanvasWall[]) {
  const hasEnvironment = items.some((item) => item.tool === 'environment');
  const hasWall = walls.length > 0;
  const hasOrigin = items.some((item) => item.tool === 'network-source');
  const hasQdc = items.some((item) => item.tool === 'qdc');
  const hasPoint = items.some((item) => pointTools.includes(item.tool));

  if (!hasEnvironment) return tools.filter((tool) => tool.key === 'environment');
  if (!hasWall) return tools.filter((tool) => tool.key === 'environment' || tool.key === 'wall');
  if (!hasOrigin || !hasQdc) return tools.filter((tool) => ['environment', 'wall', 'network-source', 'qdc'].includes(tool.key));
  if (!hasPoint) return tools.filter((tool) => tool.key !== 'circuit-line');
  return tools;
}

export function getDesignerStage(items: CanvasItem[], walls: CanvasWall[]) {
  const hasEnvironment = items.some((item) => item.tool === 'environment');
  const hasWall = walls.length > 0;
  const hasOrigin = items.some((item) => item.tool === 'network-source');
  const hasQdc = items.some((item) => item.tool === 'qdc');
  const hasPoint = items.some((item) => pointTools.includes(item.tool));

  if (!hasEnvironment) return 'Ambientes';
  if (!hasWall) return 'Paredes';
  if (!hasOrigin || !hasQdc) return 'Entrada';
  if (!hasPoint) return 'Pontos';
  return 'Circuitos';
}

export function groupTools(items: ToolDefinition[]) {
  const groups = new Map<ToolDefinition['group'], ToolDefinition[]>();
  for (const item of items) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  return Array.from(groups, ([name, groupItems]) => ({ name, items: groupItems }));
}

export function snap(value: number) {
  return Math.round(value / gridSize) * gridSize;
}

export function pixelsToMeters(value: number) {
  return value / gridSize;
}

export function formatMeters(value: number) {
  return pixelsToMeters(value).toFixed(2);
}

export function metersToPixels(value: string, minimum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.max(minimum, parsed * gridSize);
}

export function normalizeRotation(value: number) {
  return ((value % 360) + 360) % 360;
}

export function shortLabel(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 4) return normalized;
  return normalized.slice(0, 4).toUpperCase();
}
