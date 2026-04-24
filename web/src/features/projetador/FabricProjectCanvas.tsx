import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, Point, type FabricObject } from 'fabric';
import type { CanvasItem, CanvasTool, CanvasWall } from '../../domain/residential-projects';
import { snap } from './canvasModel';
import type { CanvasSelection } from './canvasModel';
import {
  fabricObjectToItemPatch,
  fabricObjectToWallPatch,
  getClientPoint,
  getEventButton,
  isAltPressed,
  isInTrash,
  preventContextMenu,
  readMeta,
  syncFabricObjects,
} from './fabricCanvasAdapter';

type ContextMenuState = {
  x: number;
  y: number;
  selection: Exclude<CanvasSelection, null>;
} | null;

type FabricCanvasEvent = {
  e: MouseEvent | PointerEvent | TouchEvent;
  target?: FabricObject;
};

type FabricWheelEvent = {
  e: WheelEvent;
};

type FabricSelectionEvent = {
  selected?: FabricObject[];
};

type Props = {
  items: CanvasItem[];
  walls: CanvasWall[];
  selectedTool: CanvasTool;
  selection: CanvasSelection;
  onCreateItem: (tool: CanvasTool, x: number, y: number) => void;
  onSelect: (selection: CanvasSelection) => void;
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void;
  onUpdateWall: (id: string, patch: Partial<CanvasWall>) => void;
  onRotate: (selection: Exclude<CanvasSelection, null>, degrees: 90 | 180) => void;
  onResize: (selection: Exclude<CanvasSelection, null>, action: 'wider' | 'narrower' | 'taller' | 'shorter') => void;
  onDelete: (selection: Exclude<CanvasSelection, null>) => void;
};

export function FabricProjectCanvas({
  items,
  walls,
  selectedTool,
  selection,
  onCreateItem,
  onSelect,
  onUpdateItem,
  onUpdateWall,
  onRotate,
  onResize,
  onDelete,
}: Props) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const callbacksRef = useRef({
    onCreateItem,
    onDelete,
    onSelect,
    onUpdateItem,
    onUpdateWall,
    onRotate,
    onResize,
    selectedTool,
  });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [zoom, setZoom] = useState(1);

  const contextSelection = contextMenu?.selection ?? null;
  const contextItem = useMemo(() => (contextSelection?.kind === 'item' ? items.find((item) => item.id === contextSelection.id) ?? null : null), [items, contextSelection]);
  const contextWall = useMemo(() => (contextSelection?.kind === 'wall' ? walls.find((wall) => wall.id === contextSelection.id) ?? null : null), [walls, contextSelection]);

  useEffect(() => {
    callbacksRef.current = {
      onCreateItem,
      onDelete,
      onSelect,
      onUpdateItem,
      onUpdateWall,
      onRotate,
      onResize,
      selectedTool,
    };
  }, [onCreateItem, onDelete, onSelect, onUpdateItem, onUpdateWall, onRotate, onResize, selectedTool]);

  useEffect(() => {
    if (!canvasElementRef.current || !shellRef.current) return;

    const canvas = new Canvas(canvasElementRef.current, {
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    const resize = () => {
      const rect = shellRef.current?.getBoundingClientRect();
      if (!rect) return;
      canvas.setDimensions({ width: Math.max(320, rect.width), height: Math.max(420, rect.height) });
      canvas.requestRenderAll();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shellRef.current);
    resize();

    canvas.upperCanvasEl.addEventListener('contextmenu', preventContextMenu);

    return () => {
      canvas.upperCanvasEl.removeEventListener('contextmenu', preventContextMenu);
      resizeObserver.disconnect();
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fabricCanvas = canvasRef.current;
    if (!fabricCanvas) return;
    const currentCanvas: Canvas = fabricCanvas;

    function handleMouseWheel(event: FabricWheelEvent) {
      const delta = event.e.deltaY;
      const nextZoom = Math.min(2.4, Math.max(0.45, currentCanvas.getZoom() * Math.pow(0.999, delta)));
      currentCanvas.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), nextZoom);
      setZoom(nextZoom);
      event.e.preventDefault();
      event.e.stopPropagation();
    }

    function handleMouseDown(event: FabricCanvasEvent) {
      const button = getEventButton(event.e);
      if (button === 2 && event.target) {
        const meta = readMeta(event.target);
        if (meta) {
          const nextSelection = { kind: meta.kind, id: meta.id };
          callbacksRef.current.onSelect(nextSelection);
          const point = getClientPoint(event.e);
          setContextMenu({ x: point.x, y: point.y, selection: nextSelection });
        }
        return;
      }

      setContextMenu(null);

      if (isAltPressed(event.e) || button === 1) {
        const point = getClientPoint(event.e);
        isPanningRef.current = true;
        lastPanPointRef.current = point;
        currentCanvas.selection = false;
        return;
      }

      if (!event.target && button === 0) {
        const pointer = currentCanvas.getScenePoint(event.e);
        callbacksRef.current.onCreateItem(callbacksRef.current.selectedTool, snap(pointer.x), snap(pointer.y));
      }
    }

    function handleMouseMove(event: FabricCanvasEvent) {
      if (!isPanningRef.current || !lastPanPointRef.current) return;
      const point = getClientPoint(event.e);
      const dx = point.x - lastPanPointRef.current.x;
      const dy = point.y - lastPanPointRef.current.y;
      currentCanvas.relativePan(new Point(dx, dy));
      lastPanPointRef.current = point;
    }

    function handleMouseUp() {
      isPanningRef.current = false;
      lastPanPointRef.current = null;
      currentCanvas.selection = true;
    }

    function handleSelection(event: FabricSelectionEvent) {
      const meta = event.selected?.[0] ? readMeta(event.selected[0]) : null;
      callbacksRef.current.onSelect(meta ? { kind: meta.kind, id: meta.id } : null);
    }

    function handleSelectionCleared() {
      callbacksRef.current.onSelect(null);
    }

    function handleModified(event: { target?: FabricObject }) {
      const target = event.target;
      const meta = target ? readMeta(target) : null;
      if (!target || !meta) return;

      if (isInTrash(target, currentCanvas)) {
        callbacksRef.current.onDelete({ kind: meta.kind, id: meta.id });
        setContextMenu(null);
        return;
      }

      if (meta.kind === 'item') {
        callbacksRef.current.onUpdateItem(meta.id, fabricObjectToItemPatch(target));
      } else {
        callbacksRef.current.onUpdateWall(meta.id, fabricObjectToWallPatch(target));
      }
    }

    currentCanvas.on('mouse:wheel', handleMouseWheel);
    currentCanvas.on('mouse:down', handleMouseDown);
    currentCanvas.on('mouse:move', handleMouseMove);
    currentCanvas.on('mouse:up', handleMouseUp);
    currentCanvas.on('selection:created', handleSelection);
    currentCanvas.on('selection:updated', handleSelection);
    currentCanvas.on('selection:cleared', handleSelectionCleared);
    currentCanvas.on('object:modified', handleModified);

    return () => {
      currentCanvas.off('mouse:wheel', handleMouseWheel);
      currentCanvas.off('mouse:down', handleMouseDown);
      currentCanvas.off('mouse:move', handleMouseMove);
      currentCanvas.off('mouse:up', handleMouseUp);
      currentCanvas.off('selection:created', handleSelection);
      currentCanvas.off('selection:updated', handleSelection);
      currentCanvas.off('selection:cleared', handleSelectionCleared);
      currentCanvas.off('object:modified', handleModified);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    syncFabricObjects(canvas, items, walls, selection);
  }, [items, selection, walls]);

  function handleZoom(delta: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nextZoom = Math.min(2.4, Math.max(0.45, canvas.getZoom() + delta));
    canvas.setZoom(nextZoom);
    setZoom(nextZoom);
  }

  function rotateSelection(degrees: 90 | 180) {
    if (!contextMenu) return;
    onRotate(contextMenu.selection, degrees);
    setContextMenu(null);
  }

  function resizeSelection(action: 'wider' | 'narrower' | 'taller' | 'shorter') {
    if (!contextMenu) return;
    onResize(contextMenu.selection, action);
    setContextMenu(null);
  }

  return (
    <div className="fabric-canvas-shell" ref={shellRef}>
      <canvas ref={canvasElementRef} />
      <div className="canvas-zoom-controls">
        <button type="button" onClick={() => handleZoom(0.1)} title="Aproximar">
          +
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => handleZoom(-0.1)} title="Afastar">
          -
        </button>
      </div>
      <div className="canvas-trash">
        <strong>Lixeira</strong>
        <span>Arraste aqui</span>
      </div>
      {contextMenu ? (
        <div className="canvas-context-menu" style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}>
          <button type="button" onClick={() => rotateSelection(90)}>
            Girar 90
          </button>
          <button type="button" onClick={() => rotateSelection(180)}>
            Girar 180
          </button>
          {contextMenu.selection.kind === 'item' && contextItem?.tool === 'environment' ? (
            <>
              <span>Redimensionar</span>
              <button type="button" onClick={() => resizeSelection('wider')}>
                + largura
              </button>
              <button type="button" onClick={() => resizeSelection('narrower')}>
                - largura
              </button>
              <button type="button" onClick={() => resizeSelection('taller')}>
                + altura
              </button>
              <button type="button" onClick={() => resizeSelection('shorter')}>
                - altura
              </button>
            </>
          ) : null}
          {contextMenu.selection.kind === 'wall' && contextWall ? (
            <>
              <span>Comprimento</span>
              <button type="button" onClick={() => resizeSelection('wider')}>
                + 1m
              </button>
              <button type="button" onClick={() => resizeSelection('narrower')}>
                - 1m
              </button>
            </>
          ) : null}
          <button className="danger-action" type="button" onClick={() => onDelete(contextMenu.selection)}>
            Excluir
          </button>
        </div>
      ) : null}
    </div>
  );
}
