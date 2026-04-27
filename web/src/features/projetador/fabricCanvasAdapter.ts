import { Canvas, Circle, Group, Line, Rect, Path, Textbox, type FabricObject } from 'fabric';
import type { CanvasItem, CanvasNode, CanvasLink } from '../../domain/residential-projects';
import { minimumEnvironmentSize, normalizeRotation, shortLabel, snap, formatMeters, pointsToPath } from './canvasModel';
import type { CanvasSelection } from './canvasModel';

export type FabricMeta = {
  kind: 'item' | 'node' | 'link' | 'vertex-handle';
  id: string;
  index?: number; // For vertex handle
};

type FabricEntity = FabricObject & {
  data?: FabricMeta;
};

export function syncFabricObjects(
  canvas: Canvas, 
  items: CanvasItem[], 
  nodes: CanvasNode[], 
  links: CanvasLink[], 
  selection: CanvasSelection,
  settings: any
) {
  const existing = new Map<string, FabricObject>();
  for (const object of canvas.getObjects()) {
    const meta = readMeta(object);
    if (meta) {
      existing.set(objectKey(meta), object);
    }
  }

  const desired = new Set<string>();

  // 1. Sync Environments (Terrain Layer)
  if (settings?.layers?.terrain !== false) {
    for (const item of items.filter((canvasItem) => canvasItem.tool === 'site-area')) {
      desired.add(syncItem(canvas, existing, item));
    }
  }

  // 2. Sync Links (Walls Layer)
  if (settings?.layers?.walls !== false) {
    for (const link of links) {
      desired.add(syncLink(canvas, existing, link, nodes, settings));
    }
  }

  // 3. Sync Nodes (Junctions - usually part of Walls layer)
  if (settings?.layers?.walls !== false) {
    for (const node of nodes) {
      desired.add(syncNode(canvas, existing, node));
    }
  }

  // 4. Sync Items (Points - Electrical Layer)
  if (settings?.layers?.electrical !== false) {
    for (const item of items.filter((canvasItem) => canvasItem.tool !== 'site-area')) {
      desired.add(syncItem(canvas, existing, item));
    }
  }

  // 5. Sync Vertex Handles for selected polygonal site
  if (selection?.kind === 'item') {
    const selectedItem = items.find(i => i.id === selection.id);
    if (selectedItem?.tool === 'site-area' && selectedItem.points) {
      syncVertexHandles(canvas, existing, desired, selectedItem);
    }
  }

  // Remove orphans
  for (const [key, object] of existing) {
    if (!desired.has(key)) {
      canvas.remove(object);
    }
  }

  const nextActive = selection ? findFabricObject(canvas, selection) : null;
  if (nextActive) {
    canvas.setActiveObject(nextActive);
  } else {
    canvas.discardActiveObject();
  }

  canvas.requestRenderAll();
}

export function readMeta(object?: FabricObject | null) {
  return (object as FabricEntity | undefined)?.data ?? null;
}

export function fabricObjectToItemPatch(object: FabricObject, shouldSnap: boolean = true): Partial<CanvasItem> {
  const base = {
    x: snap(object.left ?? 0, shouldSnap),
    y: snap(object.top ?? 0, shouldSnap),
    rotation: normalizeRotation(object.angle ?? 0),
  };

  if (object.type === 'rect') {
    return {
      ...base,
      width: Math.max(minimumEnvironmentSize.width, snap((object.width ?? 0) * (object.scaleX ?? 1), shouldSnap)),
      height: Math.max(minimumEnvironmentSize.height, snap((object.height ?? 0) * (object.scaleY ?? 1), shouldSnap)),
    };
  }

  return base;
}

export function fabricObjectToNodePatch(object: FabricObject, shouldSnap: boolean = true): Partial<CanvasNode> {
  return {
    x: snap(object.left ?? 0, shouldSnap),
    y: snap(object.top ?? 0, shouldSnap),
  };
}


export function getEventButton(event: MouseEvent | PointerEvent | TouchEvent) {
  return 'button' in event ? event.button : 0;
}

export function getClientPoint(event: MouseEvent | PointerEvent | TouchEvent) {
  if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  const touch = event.touches[0] ?? event.changedTouches[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}

export function isAltPressed(event: MouseEvent | PointerEvent | TouchEvent) {
  return 'altKey' in event ? event.altKey : false;
}

export function preventContextMenu(event: MouseEvent) {
  event.preventDefault();
}

// --- Sync Helpers ---

function syncItem(canvas: Canvas, existing: Map<string, FabricObject>, item: CanvasItem) {
  const key = objectKey({ kind: 'item', id: item.id });
  const object = existing.get(key);
  if (object && isCompatibleItemObject(object, item)) {
    applyFabricItem(object, item);
    return key;
  }
  if (object) canvas.remove(object);
  canvas.add(createFabricItem(item));
  return key;
}

function syncNode(canvas: Canvas, existing: Map<string, FabricObject>, node: CanvasNode) {
  const key = objectKey({ kind: 'node', id: node.id });
  const object = existing.get(key);
  if (object && object.type === 'circle') {
    applyFabricNode(object, node);
    return key;
  }
  if (object) canvas.remove(object);
  canvas.add(createFabricNode(node));
  return key;
}

function syncLink(canvas: Canvas, existing: Map<string, FabricObject>, link: CanvasLink, nodes: CanvasNode[], settings: any) {
  const key = objectKey({ kind: 'link', id: link.id });
  const object = existing.get(key);
  const n1 = nodes.find(n => n.id === link.sourceNodeId);
  const n2 = nodes.find(n => n.id === link.targetNodeId);
  if (!n1 || !n2) return key;

  if (object && object.type === 'group') {
    applyFabricLink(object as Group, link, n1, n2, settings);
    return key;
  }
  if (object) canvas.remove(object);
  canvas.add(createFabricLink(link, n1, n2, settings));
  return key;
}

// --- Creation Helpers ---

function createFabricItem(item: CanvasItem): FabricObject {
  let object: FabricObject;
  
  if (item.tool === 'site-area') {
    if (item.points && item.points.length > 0) {
      object = new Path(pointsToPath(item.points), {
        fill: 'rgba(127, 226, 255, 0.04)',
        stroke: 'rgba(127, 226, 255, 0.3)',
        strokeDashArray: [8, 6],
        originX: 'left',
        originY: 'top',
        centeredScaling: false,
        centeredRotation: false,
      });
    } else {
      object = new Rect({
        fill: 'rgba(127, 226, 255, 0.04)',
        stroke: 'rgba(127, 226, 255, 0.3)',
        strokeDashArray: [8, 6],
        rx: 4, ry: 4,
      });
    }
  } else {
    object = createPointGroup(item);
  }

  decorateFabricObject(object, { kind: 'item', id: item.id });
  applyFabricItem(object, item);
  return object;
}

function createFabricNode(node: CanvasNode) {
  const circle = new Circle({
    radius: 6,
    fill: '#7fe2ff',
    stroke: '#06101d',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
    hasControls: false,
    hasBorders: false,
  });
  decorateFabricObject(circle, { kind: 'node', id: node.id });
  applyFabricNode(circle, node);
  return circle;
}

function createFabricLink(link: CanvasLink, n1: CanvasNode, n2: CanvasNode, settings: any) {
  const line = new Line([n1.x, n1.y, n2.x, n2.y], {
    stroke: link.type === 'wall' ? 'rgba(127, 226, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)',
    strokeWidth: link.thickness,
    strokeLineCap: 'round',
    selectable: true,
    hasControls: false,
    hasBorders: false,
  });
  
  const label = new Textbox('', {
    fontSize: 10,
    fill: '#7fe2ff',
    backgroundColor: '#06101d',
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    padding: 2,
    visible: settings?.showDimensions !== false
  });

  const group = new Group([line, label], { selectable: true, hasControls: false });
  decorateFabricObject(group, { kind: 'link', id: link.id });
  applyFabricLink(group, link, n1, n2, settings);
  return group;
}

function createPointGroup(item: CanvasItem) {
  const marker = new Circle({
    radius: 14,
    fill: 'rgba(12, 18, 31, 0.95)',
    stroke: 'rgba(127, 226, 255, 0.65)',
    strokeWidth: 1.5,
    originX: 'center', originY: 'center',
  });
  const label = new Textbox(shortLabel(item.label), {
    width: 44, fontSize: 10, fill: '#f7fbff', fontWeight: 'bold',
    textAlign: 'center', originX: 'center', originY: 'center', top: -5,
  });
  return new Group([marker, label]);
}

// --- Application Helpers ---

function applyFabricItem(object: FabricObject, item: CanvasItem) {
  object.set({
    left: item.x,
    top: item.y,
    angle: item.rotation ?? 0,
    visible: item.visible !== false,
    selectable: !item.locked,
    evented: !item.locked,
    opacity: item.locked ? 0.6 : 1,
    strokeDashArray: item.noPrint ? [4, 4] : undefined,
  });
  if (item.tool === 'site-area') {
    if (object.type === 'rect') {
      object.set({ width: item.width ?? 192, height: item.height ?? 120, scaleX: 1, scaleY: 1 });
    } else if (object.type === 'path' && item.points) {
      // For paths, we might need to recreate if points changed significantly, 
      // but for now we set the source path
      (object as any).set({ path: item.points }); 
    }
  }
  object.setCoords();
}

function applyFabricNode(object: FabricObject, node: CanvasNode) {
  object.set({ 
    left: node.x, 
    top: node.y,
    visible: node.visible !== false,
    selectable: !node.locked,
    evented: !node.locked,
    opacity: node.locked ? 0.4 : 1,
  });
  object.setCoords();
}

function applyFabricLink(group: Group, link: CanvasLink, n1: CanvasNode, n2: CanvasNode, settings: any) {
  const line = group.item(0) as Line;
  const label = group.item(1) as Textbox;
  
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  line.set({ 
    x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
    strokeWidth: link.thickness,
    stroke: link.type === 'wall' ? 'rgba(127, 226, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)'
  });
  
  label.set({
    text: formatMeters(length, settings?.unit || 'm', settings?.scale || 1),
    left: n1.x + dx / 2,
    top: n1.y + dy / 2,
    angle: Math.abs(angle) > 90 ? angle + 180 : angle,
    visible: (settings?.showDimensions !== false) && (link.visible !== false)
  });

  group.set({
    visible: link.visible !== false,
    selectable: !link.locked,
    evented: !link.locked,
    opacity: link.locked ? 0.6 : 1,
  });

  group.setCoords();
}

function decorateFabricObject(object: FabricObject, data: FabricMeta) {
  const entity = object as FabricEntity;
  entity.data = data;
  entity.set({
    cornerColor: '#7fe2ff',
    cornerStrokeColor: '#06101d',
    borderColor: '#7fe2ff',
    transparentCorners: false,
  });
}

function findFabricObject(canvas: Canvas, selection: Exclude<CanvasSelection, null>) {
  return canvas.getObjects().find((object) => {
    const meta = readMeta(object);
    return meta?.kind === selection.kind && meta.id === selection.id;
  });
}

function isCompatibleItemObject(object: FabricObject, item: CanvasItem) {
  if (item.tool === 'site-area') {
    return item.points ? object.type === 'path' : object.type === 'rect';
  }
  return object.type === 'group';
}

function syncVertexHandles(canvas: Canvas, existing: Map<string, FabricObject>, desired: Set<string>, item: CanvasItem) {
  if (!item.points) return;
  
  item.points.forEach((p, idx) => {
    const key = `vertex-handle:${item.id}:${idx}`;
    desired.add(key);
    const object = existing.get(key);
    
    const handleX = item.x + p.x;
    const handleY = item.y + p.y;
    
    if (object && object.type === 'circle') {
      object.set({ left: handleX, top: handleY });
      object.setCoords();
      return;
    }
    
    if (object) canvas.remove(object);
    
    const handle = new Circle({
      radius: 5,
      fill: '#ffab00',
      stroke: '#06101d',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      selectable: true,
    });
    
    decorateFabricObject(handle, { kind: 'vertex-handle', id: item.id, index: idx });
    handle.set({ left: handleX, top: handleY });
    canvas.add(handle);
  });
}

function objectKey(meta: FabricMeta) {
  if (meta.kind === 'vertex-handle') return `vertex-handle:${meta.id}:${meta.index}`;
  return `${meta.kind}:${meta.id}`;
}
