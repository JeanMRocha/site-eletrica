import { useEffect, useRef } from 'react';
import { Canvas, Point, type FabricObject } from 'fabric';
import { 
  getClientPoint, 
  getEventButton, 
  isAltPressed, 
  readMeta 
} from './fabricCanvasAdapter';
import { normalizeRotation, type CanvasSelection } from './canvasModel';
import type { CanvasTool, CanvasItem } from '../../domain/residential-projects';

type FabricCanvasEvent = {
  e: MouseEvent | PointerEvent | TouchEvent;
  target?: FabricObject;
};

type FabricWheelEvent = {
  e: WheelEvent;
};

type Callbacks = {
  onSelect: (selection: CanvasSelection) => void;
  onCreateObject: (tool: CanvasTool, x: number, y: number) => void;
  onDelete: (selection: Exclude<CanvasSelection, null>) => void;
  onCopy: () => void;
  onPaste: () => void;
  onMouseMoveCoords?: (x: number, y: number) => void;
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void;
  onUpdateSitePoint?: (id: string, index: number, patch: any) => void;
  onAddVertex?: (id: string, index: number, x: number, y: number) => void;
  setContextMenu: (state: any) => void;
  snap: (val: number) => number;
};

export function useCanvasEvents(
  canvasRef: React.MutableRefObject<Canvas | null>,
  selectedTool: CanvasTool,
  selection: CanvasSelection,
  callbacks: Callbacks
) {
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleMouseWheel(event: FabricWheelEvent) {
      const delta = event.e.deltaY;
      const nextZoom = Math.min(2.4, Math.max(0.45, canvas!.getZoom() * Math.pow(0.999, delta)));
      canvas!.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), nextZoom);
      event.e.preventDefault();
      event.e.stopPropagation();
    }

    function handleMouseDown(event: FabricCanvasEvent) {
      const button = getEventButton(event.e);
      const point = getClientPoint(event.e);

      if (button === 2) {
        if (event.target) {
          const meta = readMeta(event.target);
          if (meta) {
            const nextSelection = { kind: meta.kind, id: meta.id } as any;
            callbacksRef.current.onSelect(nextSelection);
            callbacksRef.current.setContextMenu({ x: point.x, y: point.y, selection: nextSelection });
          }
        } else {
          callbacksRef.current.setContextMenu({ x: point.x, y: point.y, selection: null });
        }
        return;
      }

      callbacksRef.current.setContextMenu(null);

      if (isAltPressed(event.e) || button === 1) {
        isPanningRef.current = true;
        lastPanPointRef.current = point;
        canvas!.selection = false;
        return;
      }

      if (event.target) {
        const meta = readMeta(event.target);
        if (meta?.kind === 'vertex-midpoint') {
          const point = canvas!.getScenePoint(event.e);
          callbacksRef.current.onAddVertex?.(meta.id, meta.index!, point.x, point.y);
          return;
        }
      }

      if (!event.target && button === 0) {
        const pointer = canvas!.getScenePoint(event.e);
        callbacksRef.current.onCreateObject(
          selectedTool, 
          callbacksRef.current.snap(pointer.x), 
          callbacksRef.current.snap(pointer.y)
        );
      }
    }

    function handleMouseMove(event: FabricCanvasEvent) {
      const point = getClientPoint(event.e);
      const pointer = canvas!.getScenePoint(event.e);
      
      callbacksRef.current.onMouseMoveCoords?.(pointer.x, pointer.y);

      if (isPanningRef.current && lastPanPointRef.current) {
        const deltaX = point.x - lastPanPointRef.current.x;
        const deltaY = point.y - lastPanPointRef.current.y;
        canvas!.relativePan(new Point(deltaX, deltaY));
        lastPanPointRef.current = point;
      }
    }

    function handleMouseUp() {
      isPanningRef.current = false;
      lastPanPointRef.current = null;
      canvas!.selection = true;
    }

    function handleSelection(e: { selected?: FabricObject[] }) {
      if (isPanningRef.current) return;
      const target = e.selected?.[0];
      if (target) {
        const meta = readMeta(target);
        if (meta && meta.kind !== 'vertex-handle') {
          callbacksRef.current.onSelect({ kind: meta.kind, id: meta.id } as any);
        }
      }
    }

    function handleSelectionCleared() {
      if (isPanningRef.current) return;
      callbacksRef.current.onSelect(null);
    }

    function handleObjectModified(e: { target?: FabricObject }) {
      const target = e.target;
      if (!target) return;
      
      const meta = readMeta(target);
      if (!meta) return;

      if (meta.kind === 'vertex-handle') {
        const index = meta.index!;
        const itemId = meta.id;
        
        callbacksRef.current.onUpdateSitePoint?.(itemId, index, {
          x: callbacksRef.current.snap(target.left || 0),
          y: callbacksRef.current.snap(target.top || 0)
        });
      } else if (meta.kind === 'item') {
        callbacksRef.current.onUpdateItem(meta.id, {
          x: callbacksRef.current.snap(target.left || 0),
          y: callbacksRef.current.snap(target.top || 0),
          rotation: normalizeRotation(target.angle || 0)
        });
      }
    }

    canvas.on('mouse:wheel', handleMouseWheel);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('mouse:wheel', handleMouseWheel);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvasRef.current, selectedTool]); // Re-bind if tool changes if needed, or use refs

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const currentSelection = selection;
        if (currentSelection) {
          callbacksRef.current.onDelete(currentSelection);
        }
      }

      if (isCtrl && e.key === 'c') {
        e.preventDefault();
        callbacksRef.current.onCopy();
      }
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        callbacksRef.current.onPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection]);
}
