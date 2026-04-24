import { Canvas, Circle, Group, Line, Rect, Textbox, type FabricObject } from 'fabric';
import type { CanvasItem, CanvasWall } from '../../domain/residential-projects';
import { gridSize, minimumEnvironmentSize, normalizeRotation, shortLabel, snap } from './canvasModel';
import type { CanvasSelection } from './canvasModel';

export type FabricMeta = {
  kind: 'item' | 'wall';
  id: string;
};

type FabricEntity = FabricObject & {
  data?: FabricMeta;
};

export function syncFabricObjects(canvas: Canvas, items: CanvasItem[], walls: CanvasWall[], selection: CanvasSelection) {
  const existing = new Map<string, FabricObject>();
  for (const object of canvas.getObjects()) {
    const meta = readMeta(object);
    if (meta) {
      existing.set(objectKey(meta), object);
    }
  }

  const desired = new Set<string>();

  for (const item of items.filter((canvasItem) => canvasItem.tool === 'environment')) {
    desired.add(syncItem(canvas, existing, item));
  }

  for (const wall of walls) {
    desired.add(syncWall(canvas, existing, wall));
  }

  for (const item of items.filter((canvasItem) => canvasItem.tool !== 'environment')) {
    desired.add(syncItem(canvas, existing, item));
  }

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

export function fabricObjectToItemPatch(object: FabricObject): Partial<CanvasItem> {
  const base = {
    x: snap(object.left ?? 0),
    y: snap(object.top ?? 0),
    rotation: normalizeRotation(object.angle ?? 0),
  };

  if (object.type === 'rect') {
    return {
      ...base,
      width: Math.max(minimumEnvironmentSize.width, snap((object.width ?? 0) * (object.scaleX ?? 1))),
      height: Math.max(minimumEnvironmentSize.height, snap((object.height ?? 0) * (object.scaleY ?? 1))),
    };
  }

  return base;
}

export function fabricObjectToWallPatch(object: FabricObject): Partial<CanvasWall> {
  return {
    x: snap(object.left ?? 0),
    y: snap(object.top ?? 0),
    rotation: normalizeRotation(object.angle ?? 0),
    length: Math.max(3, Math.round(((object.width ?? gridSize * 3) * (object.scaleX ?? 1)) / gridSize)),
  };
}

export function isInTrash(object: FabricObject, canvas: Canvas) {
  const x = object.left ?? 0;
  const y = object.top ?? 0;
  return x > canvas.getWidth() - 150 && y > canvas.getHeight() - 96;
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

function syncItem(canvas: Canvas, existing: Map<string, FabricObject>, item: CanvasItem) {
  const key = objectKey({ kind: 'item', id: item.id });
  const object = existing.get(key);
  if (object && isCompatibleItemObject(object, item)) {
    applyFabricItem(object, item);
    return key;
  }

  if (object) {
    canvas.remove(object);
  }

  canvas.add(createFabricItem(item));
  return key;
}

function syncWall(canvas: Canvas, existing: Map<string, FabricObject>, wall: CanvasWall) {
  const key = objectKey({ kind: 'wall', id: wall.id });
  const object = existing.get(key);
  if (object && object.type === 'line') {
    applyFabricWall(object, wall);
    return key;
  }

  if (object) {
    canvas.remove(object);
  }

  canvas.add(createFabricWall(wall));
  return key;
}

function createFabricItem(item: CanvasItem) {
  const object =
    item.tool === 'environment'
      ? new Rect({
          fill: 'rgba(127, 226, 255, 0.06)',
          stroke: 'rgba(127, 226, 255, 0.55)',
          strokeDashArray: [8, 6],
          rx: 4,
          ry: 4,
        })
      : createPointGroup(item);

  decorateFabricObject(object, { kind: 'item', id: item.id });
  applyFabricItem(object, item);
  return object;
}

function createPointGroup(item: CanvasItem) {
  const marker = new Circle({
    radius: 14,
    fill: 'rgba(12, 18, 31, 0.95)',
    stroke: 'rgba(127, 226, 255, 0.65)',
    strokeWidth: 1.5,
    originX: 'center',
    originY: 'center',
  });
  const label = new Textbox(shortLabel(item.label), {
    width: 44,
    fontSize: 10,
    fill: '#f7fbff',
    fontWeight: 'bold',
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    top: -5,
  });
  return new Group([marker, label]);
}

function createFabricWall(wall: CanvasWall) {
  const line = new Line([0, 0, Math.max(3, wall.length) * gridSize, 0], {
    stroke: 'rgba(127, 226, 255, 0.82)',
    strokeWidth: 8,
    strokeLineCap: 'round',
  });
  decorateFabricObject(line, { kind: 'wall', id: wall.id });
  applyFabricWall(line, wall);
  return line;
}

function applyFabricItem(object: FabricObject, item: CanvasItem) {
  if (item.tool === 'environment') {
    object.set({
      left: item.x,
      top: item.y,
      width: item.width ?? 192,
      height: item.height ?? 120,
      scaleX: 1,
      scaleY: 1,
      angle: item.rotation ?? 0,
    });
    object.setCoords();
    return;
  }

  object.set({
    left: item.x,
    top: item.y,
    scaleX: 1,
    scaleY: 1,
    angle: item.rotation ?? 0,
  });
  object.setCoords();
}

function applyFabricWall(object: FabricObject, wall: CanvasWall) {
  object.set({
    left: wall.x,
    top: wall.y,
    width: Math.max(3, wall.length) * gridSize,
    scaleX: 1,
    scaleY: 1,
    angle: wall.rotation,
  });

  if (object.type === 'line') {
    object.set({ x1: 0, y1: 0, x2: Math.max(3, wall.length) * gridSize, y2: 0 });
  }

  object.setCoords();
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
  return item.tool === 'environment' ? object.type === 'rect' : object.type === 'group';
}

function objectKey(meta: FabricMeta) {
  return `${meta.kind}:${meta.id}`;
}
