import type { 
  CanvasItem, 
  CanvasTool, 
  CanvasNode, 
  CanvasLink, 
  ProjectCanvas 
} from '../../domain/residential-projects';
import { canvasLabels, gridSize, minimumEnvironmentSize, normalizeRotation } from './canvasModel';
import type { CanvasSelection } from './canvasModel';
import { notify } from '../../lib/events';

function isPointInsideSite(canvas: ProjectCanvas, x: number, y: number): boolean {
  const sites = canvas.items.filter(i => i.tool === 'site-area');
  if (sites.length === 0) return true; // If no site defined, allow placement (initial stage)
  
  return sites.some(site => {
    // 1. Check Rect-based site (Legacy)
    if (!site.points || site.points.length === 0) {
      const w = site.width ?? 0;
      const h = site.height ?? 0;
      return x >= site.x && x <= site.x + w && y >= site.y && y <= site.y + h;
    }

    // 2. Check Polygon-based site (New)
    let inside = false;
    const pts = (site.points || []).map(p => ({ x: (p.x || 0) + site.x, y: (p.y || 0) + site.y }));
    
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const pi = pts[i];
      const pj = pts[j];
      if (!pi || !pj) continue;

      const xi = pi.x, yi = pi.y;
      const xj = pj.x, yj = pj.y;

      const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  });
}

export function selectTool(canvas: ProjectCanvas, selectedTool: CanvasTool): ProjectCanvas {
  return { ...canvas, selectedTool };
}

export function createCanvasObject(canvas: ProjectCanvas, tool: CanvasTool, x: number, y: number) {
  // --- Wall (Graph) Chaining Logic ---
  if (tool === 'wall') {
    if (!isPointInsideSite(canvas, x, y)) {
      notify({ title: 'Aviso', message: 'Não é permitido adicionar paredes fora da área do terreno.', type: 'warning' });
      return { canvas, selection: null };
    }

    const existingNode = canvas.nodes.find(n => n.x === x && n.y === y);
    
    const targetNode: CanvasNode = existingNode || {
      id: crypto.randomUUID(),
      x,
      y
    };

    const nextNodes = existingNode ? canvas.nodes : [...canvas.nodes, targetNode];

    return {
      canvas: {
        ...canvas,
        selectedTool: tool,
        nodes: nextNodes,
      },
      selection: { kind: 'node', id: targetNode.id } as const,
    };
  }

  // --- Site (Terreno) / Item Logic ---
  const isSite = tool === 'site-area';
  
  // Containment check: prevent adding items outside the Terreno (unless adding the Terreno itself)
  if (!isSite && !isPointInsideSite(canvas, x, y)) {
    notify({ title: 'Aviso', message: 'Não é permitido adicionar objetos fora da área do terreno.', type: 'warning' });
    return { canvas, selection: null };
  }

  const item: CanvasItem = {
    id: crypto.randomUUID(),
    tool,
    x,
    y,
    label: isSite ? `Terreno ${canvas.items.filter((canvasItem) => canvasItem.tool === 'site-area').length + 1}` : canvasLabels[tool],
    width: isSite ? 192 : undefined,
    height: isSite ? 120 : undefined,
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

export function updateCanvasNode(canvas: ProjectCanvas, id: string, patch: Partial<CanvasNode>): ProjectCanvas {
  return {
    ...canvas,
    nodes: canvas.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
  };
}

export function updateCanvasLink(canvas: ProjectCanvas, id: string, patch: Partial<CanvasLink>): ProjectCanvas {
  return {
    ...canvas,
    links: canvas.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
  };
}

export function convertSiteToPolygon(canvas: ProjectCanvas, id: string): ProjectCanvas {
  return {
    ...canvas,
    items: canvas.items.map(item => {
      if (item.id !== id || item.tool !== 'site-area' || item.points) return item;
      const w = item.width || 192;
      const h = item.height || 120;
      return {
        ...item,
        width: undefined,
        height: undefined,
        points: [
          { x: 0, y: 0 },
          { x: w, y: 0 },
          { x: w, y: h },
          { x: 0, y: h }
        ]
      };
    })
  };
}

export function addVertexToSite(canvas: ProjectCanvas, id: string, segmentIndex: number, x: number, y: number): ProjectCanvas {
  return {
    ...canvas,
    items: canvas.items.map(item => {
      if (item.id !== id || !item.points) return item;
      const nextPoints = [...item.points];
      // Insert new point after segmentIndex
      // Point coordinates are relative to item.x, item.y
      nextPoints.splice(segmentIndex + 1, 0, { x: x - item.x, y: y - item.y });
      return { ...item, points: nextPoints };
    })
  };
}

export function createLinkBetween(canvas: ProjectCanvas, sourceId: string, targetId: string): ProjectCanvas {
  if (sourceId === targetId) return canvas;
  
  const exists = canvas.links.some(l => 
    (l.sourceNodeId === sourceId && l.targetNodeId === targetId) ||
    (l.sourceNodeId === targetId && l.targetNodeId === sourceId)
  );
  if (exists) return canvas;

  const link: CanvasLink = {
    id: crypto.randomUUID(),
    sourceNodeId: sourceId,
    targetNodeId: targetId,
    thickness: 8,
    type: 'wall'
  };

  return {
    ...canvas,
    links: [...canvas.links, link]
  };
}

export function deleteCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>): ProjectCanvas {
  if (selection.kind === 'item') {
    return {
      ...canvas,
      items: canvas.items.filter((item) => item.id !== selection.id),
    };
  }

  if (selection.kind === 'link') {
    return {
      ...canvas,
      links: canvas.links.filter((link) => link.id !== selection.id),
    };
  }

  if (selection.kind === 'node') {
    return {
      ...canvas,
      nodes: canvas.nodes.filter((node) => node.id !== selection.id),
      links: canvas.links.filter((link) => link.sourceNodeId !== selection.id && link.targetNodeId !== selection.id),
    };
  }

  return canvas;
}

export function rotateCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>, degrees: 90 | 180): ProjectCanvas {
  if (selection.kind !== 'item') return canvas;
  return {
    ...canvas,
    items: canvas.items.map((item) => (item.id === selection.id ? { ...item, rotation: normalizeRotation((item.rotation ?? 0) + degrees) } : item)),
  };
}

export function resizeCanvasSelection(canvas: ProjectCanvas, selection: Exclude<CanvasSelection, null>, action: 'wider' | 'narrower' | 'taller' | 'shorter'): ProjectCanvas {
  if (selection.kind !== 'item') return canvas;
  return {
    ...canvas,
    items: canvas.items.map((item) =>
      item.id === selection.id
        ? {
            ...item,
            width: action === 'wider' ? (item.width ?? 192) + gridSize : action === 'narrower' ? Math.max(minimumEnvironmentSize.width, (item.width ?? 192) - gridSize) : item.width,
            height: action === 'taller' ? (item.height ?? 120) + gridSize : action === 'shorter' ? Math.max(minimumEnvironmentSize.height, (item.height ?? 120) - gridSize) : item.height,
          }
        : item,
    ),
  };
}

export function updateCanvasSettings(canvas: ProjectCanvas, patch: Partial<CanvasSettings>): ProjectCanvas {
  return {
    ...canvas,
    settings: {
      ...(canvas.settings || { 
        visualGrid: true, 
        snapToGrid: true, 
        unit: 'm', 
        scale: 1,
        precision: 2,
        angleFormat: 'DD',
        layers: { terrain: true, walls: true, electrical: true }
      }),
      ...patch
    }
  };
}
