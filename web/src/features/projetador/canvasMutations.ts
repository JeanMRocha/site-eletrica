import type { CanvasItem, CanvasTool, CanvasWall, ProjectCanvas } from '../../domain/residential-projects';
import { canvasLabels, gridSize, minimumEnvironmentSize, normalizeRotation } from './canvasModel';
import type { CanvasSelection } from './canvasModel';

export function selectTool(canvas: ProjectCanvas, selectedTool: CanvasTool): ProjectCanvas {
  return { ...canvas, selectedTool };
}

export function createCanvasObject(canvas: ProjectCanvas, tool: CanvasTool, x: number, y: number) {
  if (tool === 'wall') {
    const wall: CanvasWall = {
      id: crypto.randomUUID(),
      tool: 'wall',
      x,
      y,
      length: 6,
      rotation: 0,
    };

    return {
      canvas: {
        ...canvas,
        selectedTool: tool,
        walls: [...canvas.walls, wall],
      },
      selection: { kind: 'wall', id: wall.id } as const,
    };
  }

  const isEnvironment = tool === 'environment';
  const item: CanvasItem = {
    id: crypto.randomUUID(),
    tool,
    x,
    y,
    label: isEnvironment ? `Ambiente ${canvas.items.filter((canvasItem) => canvasItem.tool === 'environment').length + 1}` : canvasLabels[tool],
    width: isEnvironment ? 192 : undefined,
    height: isEnvironment ? 120 : undefined,
    rotation: 0,
  };

  return {
    canvas: {
      ...canvas,
      selectedTool: tool,
      items: [...canvas.items, item],
    },
    selection: { kind: 'item', id: item.id } as const,
  };
}

export function updateCanvasItem(canvas: ProjectCanvas, id: string, patch: Partial<CanvasItem>): ProjectCanvas {
  return {
    ...canvas,
    items: canvas.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  };
}

export function updateCanvasWall(canvas: ProjectCanvas, id: string, patch: Partial<CanvasWall>): ProjectCanvas {
  return {
    ...canvas,
    walls: canvas.walls.map((wall) => (wall.id === id ? { ...wall, ...patch } : wall)),
  };
}

export function deleteCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>): ProjectCanvas {
  return {
    ...canvas,
    items: selection.kind === 'item' ? canvas.items.filter((item) => item.id !== selection.id) : canvas.items,
    walls: selection.kind === 'wall' ? canvas.walls.filter((wall) => wall.id !== selection.id) : canvas.walls,
  };
}

export function rotateCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>, degrees: 90 | 180): ProjectCanvas {
  return {
    ...canvas,
    items:
      selection.kind === 'item'
        ? canvas.items.map((item) => (item.id === selection.id ? { ...item, rotation: normalizeRotation((item.rotation ?? 0) + degrees) } : item))
        : canvas.items,
    walls:
      selection.kind === 'wall'
        ? canvas.walls.map((wall) => (wall.id === selection.id ? { ...wall, rotation: normalizeRotation(wall.rotation + degrees) } : wall))
        : canvas.walls,
  };
}

export function resizeCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>, action: 'wider' | 'narrower' | 'taller' | 'shorter'): ProjectCanvas {
  return {
    ...canvas,
    items:
      selection.kind === 'item'
        ? canvas.items.map((item) =>
            item.id === selection.id
              ? {
                  ...item,
                  width: action === 'wider' ? (item.width ?? 192) + gridSize : action === 'narrower' ? Math.max(minimumEnvironmentSize.width, (item.width ?? 192) - gridSize) : item.width,
                  height: action === 'taller' ? (item.height ?? 120) + gridSize : action === 'shorter' ? Math.max(minimumEnvironmentSize.height, (item.height ?? 120) - gridSize) : item.height,
                }
              : item,
          )
        : canvas.items,
    walls:
      selection.kind === 'wall'
        ? canvas.walls.map((wall) =>
            wall.id === selection.id
              ? {
                  ...wall,
                  length: action === 'wider' || action === 'taller' ? wall.length + 1 : Math.max(3, wall.length - 1),
                }
              : wall,
          )
        : canvas.walls,
  };
}
