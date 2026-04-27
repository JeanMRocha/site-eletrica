import { useEffect, useRef, useState } from 'react';
import type { 
  CanvasTool, 
  ResidentialProject,
  CanvasItem,
  CanvasNode,
  CanvasLink
} from '../../domain/residential-projects';
import { snap } from './canvasModel';
import type { CanvasSelection } from './canvasModel';
import { syncFabricObjects } from './fabricCanvasAdapter';
import { useCanvasInit } from './useCanvasInit';
import { useCanvasEvents } from './useCanvasEvents';

type ContextMenuState = {
  x: number;
  y: number;
  selection: CanvasSelection;
} | null;

type Props = {
  project: ResidentialProject;
  selectedTool: CanvasTool;
  selection: CanvasSelection;
  zoomLevel: number;
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void;
  onUpdateNode: (id: string, patch: Partial<CanvasNode>) => void;
  onUpdateLink: (id: string, patch: Partial<CanvasLink>) => void;
  onDelete: (selection: Exclude<CanvasSelection, null>) => void;
  onCreateObject: (tool: CanvasTool, x: number, y: number) => void;
  onSelect: (selection: CanvasSelection) => void;
  snapToGrid: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onUpdateSitePoint?: (id: string, index: number, patch: any) => void;
  onMouseMoveCoords?: (x: number, y: number) => void;
};

/**
 * FabricProjectCanvas - Orchestrator for the Fabric.js CAD environment.
 * Refactored using SRP: setup in useCanvasInit, interactions in useCanvasEvents.
 */
export function FabricProjectCanvas({
  project,
  selectedTool,
  selection,
  zoomLevel,
  onDelete,
  onCreateObject,
  onSelect,
  snapToGrid,
  onCopy,
  onPaste,
  onUpdateItem,
  onUpdateSitePoint,
  onMouseMoveCoords,
}: Props) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // 1. Initialize Canvas and handle lifecycle
  const canvasRef = useCanvasInit(
    canvasElementRef, 
    shellRef, 
    () => {}, // onReady
    () => {}  // onDestroy
  );

  // 2. Bind interactions and tools
  useCanvasEvents(canvasRef, selectedTool, selection, {
    onSelect,
    onCreateObject,
    onDelete,
    onCopy,
    onPaste,
    onUpdateItem,
    onUpdateSitePoint,
    onMouseMoveCoords,
    setContextMenu,
    snap: (val) => snap(val, snapToGrid)
  });

  // 3. Handle Zoom changes from props
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setZoom(zoomLevel);
  }, [zoomLevel]);

  // 4. Synchronize domain data with Fabric objects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    syncFabricObjects(
      canvas, 
      project.canvas.items, 
      project.canvas.nodes, 
      project.canvas.links, 
      selection,
      project.canvas.settings
    );
  }, [project.canvas.items, project.canvas.nodes, project.canvas.links, selection, project.canvas.settings]);

  return (
    <div 
      className={`fabric-canvas-shell ${project.canvas.settings?.visualGrid ? 'show-grid' : ''}`} 
      ref={shellRef}
    >
      <canvas ref={canvasElementRef} />
      
      {contextMenu && (
        <div 
          className="canvas-context-menu" 
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          {contextMenu.selection === null ? (
            <>
              <div className="ctx-menu-title">⚡ Posicionar Fonte:</div>
              <button 
                type="button" 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const pointer = canvas.getScenePoint({ clientX: contextMenu.x, clientY: contextMenu.y } as any);
                    onCreateObject('source-post', snap(pointer.x, snapToGrid), snap(pointer.y, snapToGrid));
                  }
                  setContextMenu(null);
                }}
              >
                🏗️ Poste Concessionária
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const pointer = canvas.getScenePoint({ clientX: contextMenu.x, clientY: contextMenu.y } as any);
                    onCreateObject('source-solar', snap(pointer.x, snapToGrid), snap(pointer.y, snapToGrid));
                  }
                  setContextMenu(null);
                }}
              >
                ☀️ Painel Solar
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const pointer = canvas.getScenePoint({ clientX: contextMenu.x, clientY: contextMenu.y } as any);
                    onCreateObject('source-generator', snap(pointer.x, snapToGrid), snap(pointer.y, snapToGrid));
                  }
                  setContextMenu(null);
                }}
              >
                🔋 Gerador
              </button>
            </>
          ) : (
            <button 
              className="danger-action" 
              type="button" 
              onClick={() => {
                onDelete(contextMenu.selection as any);
                setContextMenu(null);
              }}
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
