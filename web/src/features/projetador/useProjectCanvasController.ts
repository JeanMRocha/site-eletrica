import { useEffect, useMemo, useState } from 'react';
import type { 
  CanvasItem, 
  CanvasTool, 
  CanvasNode, 
  CanvasLink, 
  ResidentialProject,
  CanvasSettings,
  ProjectCanvas
} from '../../domain/residential-projects';
import { projectsRepo } from '../../domain/residential-projects';
import { electricalCalculationService } from '../../services/ElectricalCalculationService';
import { electricalValidationEngine } from '../../services/ElectricalValidationEngine';
import {
  createCanvasObject as createCanvasObjectMutation,
  deleteCanvasSelection,
  resizeCanvasSelection,
  rotateCanvasSelection,
  selectTool,
  updateCanvasItem,
  updateCanvasNode,
  updateCanvasLink,
  createLinkBetween,
  updateCanvasSettings,
  convertSiteToPolygon,
  addVertexToSite,
} from './canvasMutations';
import { getAvailableTools, getDesignerStage, type ToolDefinition } from './canvasModel';
import type { CanvasSelection } from './canvasModel';

const emptyItems: CanvasItem[] = [];
const emptyNodes: CanvasNode[] = [];
const emptyLinks: CanvasLink[] = [];

type CanvasMutationResult<TResult> = {
  canvas: ProjectCanvas;
  result: TResult;
};

export function useProjectCanvasController(projectId: string) {
  const [project, setProject] = useState<ResidentialProject | null>(null);
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('select');
  const [selection, setSelection] = useState<CanvasSelection>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [history, setHistory] = useState<ProjectCanvas[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectCanvas[]>([]);
  const [clipboard, setClipboard] = useState<CanvasItem | null>(null);

  const canvasItems = project?.canvas.items ?? emptyItems;
  const canvasNodes = project?.canvas.nodes ?? emptyNodes;
  const canvasLinks = project?.canvas.links ?? emptyLinks;
  const canvasSettings: CanvasSettings = project?.canvas.settings ?? { 
    visualGrid: true, 
    snapToGrid: true,
    unit: 'm',
    scale: 1,
    precision: 2,
    angleFormat: 'DD',
    layers: { terrain: true, walls: true, electrical: true }
  };

  const availableTools = useMemo(() => (project ? getAvailableTools(canvasItems, canvasNodes) : []), [canvasItems, canvasNodes, project]);
  const designerStage = useMemo(() => (project ? getDesignerStage(canvasItems, canvasNodes) : 'Paredes'), [canvasItems, canvasNodes, project]);
  const validation = useMemo(() => (project ? electricalValidationEngine.validate(project) : []), [project]);
  const calculation = useMemo(() => (project ? electricalCalculationService.calculate(project) : null), [project]);

  const selectedCanvasItem = useMemo(() => {
    if (!project || !selection || selection.kind !== 'item') return null;
    return canvasItems.find((item) => item.id === selection.id) ?? null;
  }, [canvasItems, project, selection]);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      const next = await projectsRepo.get(projectId);
      setProject(next);
      if (next) setSelectedTool((next.canvas.selectedTool as CanvasTool) || 'wall');
    }
    load();
  }, [projectId]);

  useEffect(() => {
    if (availableTools.some((tool: ToolDefinition) => tool.key === selectedTool)) return;
    setSelectedTool(availableTools[0]?.key ?? 'wall');
  }, [availableTools, selectedTool]);

  async function syncCanvas(updater: (canvas: ProjectCanvas) => ProjectCanvas) {
    if (!project || !projectId) return;
    
    // Save current state to history before mutation
    setHistory(prev => [project.canvas, ...prev.slice(0, 49)]); // Max 50 steps
    setRedoStack([]); // Clear redo on new action

    const next = await projectsRepo.updateCanvas(projectId, updater);
    setProject(next);
  }

  async function undo() {
    if (history.length === 0 || !project || !projectId) return;
    const [prev, ...rest] = history;
    setRedoStack(curr => [project.canvas, ...curr]);
    setHistory(rest);

    const nextProject = await projectsRepo.updateCanvas(projectId, () => prev!);
    setProject(nextProject);
  }

  async function redo() {
    if (redoStack.length === 0 || !project || !projectId) return;
    const [next, ...rest] = redoStack;
    setHistory(curr => [project.canvas, ...curr]);
    setRedoStack(rest);

    const nextProject = await projectsRepo.updateCanvas(projectId, () => next!);
    setProject(nextProject);
  }

  // Auto-save logic (local storage is handled by repo, but we can trigger a cloud sync here later)
  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      console.log('Background Auto-Save Triggered');
    }, 2000);
    return () => clearTimeout(timer);
  }, [project]);

  function copySelection() {
    if (selection?.kind === 'item') {
      const item = canvasItems.find(i => i.id === selection.id);
      if (item) setClipboard({ ...item });
    }
  }

  async function pasteSelection() {
    if (!clipboard) return;
    const offset = 24; // gridSize
    const pasted: CanvasItem = {
      ...clipboard,
      id: crypto.randomUUID(),
      x: clipboard.x + offset,
      y: clipboard.y + offset
    };
    
    await syncCanvas(canvas => ({
      ...canvas,
      items: [pasted, ...canvas.items]
    }));
    setSelection({ kind: 'item', id: pasted.id });
  }

  async function syncCanvasWithResult<TResult>(mutation: (canvas: ProjectCanvas) => CanvasMutationResult<TResult>) {
    if (!project || !projectId) return null;
    let result: TResult | null = null;
    const next = await projectsRepo.updateCanvas(projectId, (canvas) => {
      const mutationNext = mutation(canvas);
      result = mutationNext.result;
      return mutationNext.canvas;
    });
    setProject(next);
    return result;
  }

  async function chooseTool(tool: CanvasTool) {
    if (!availableTools.some((item: ToolDefinition) => item.key === tool)) return;
    setSelectedTool(tool);
    await syncCanvas((canvas) => selectTool(canvas, tool));
  }

  async function createCanvasObject(tool: CanvasTool, x: number, y: number) {
    if (tool === 'select') {
      setSelection(null);
      return;
    }

    const nextSelection = await syncCanvasWithResult((canvas) => {
      const prevSelection = selection; // Capture current selection
      const next = createCanvasObjectMutation(canvas, tool, x, y);
      
      // Chaining logic: if we just created/found a node and had one selected, link them
      if (tool === 'wall' && prevSelection?.kind === 'node' && next.selection?.kind === 'node') {
        const linkedCanvas = createLinkBetween(next.canvas, prevSelection.id, next.selection.id);
        return { canvas: linkedCanvas, result: next.selection };
      }

      return { canvas: next.canvas, result: next.selection };
    });
    if (nextSelection) setSelection(nextSelection);

    // After creation, if not drawing walls, go back to selection mode
    if (tool !== 'wall') {
      setSelectedTool('select');
    }
  }

  async function updateItem(id: string, patch: Partial<CanvasItem>) {
    await syncCanvas((canvas) => updateCanvasItem(canvas, id, patch));
  }

  async function updateNode(id: string, patch: Partial<CanvasNode>) {
    await syncCanvas((canvas) => updateCanvasNode(canvas, id, patch));
  }

  async function updateLink(id: string, patch: Partial<CanvasLink>) {
    await syncCanvas((canvas) => updateCanvasLink(canvas, id, patch));
  }

  async function rotateSelection(nextSelection: Exclude<CanvasSelection, null>, degrees: 90 | 180) {
    await syncCanvas((canvas) => rotateCanvasSelection(canvas, nextSelection, degrees));
  }

  async function resizeSelection(nextSelection: Exclude<CanvasSelection, null>, action: 'wider' | 'narrower' | 'taller' | 'shorter') {
    await syncCanvas((canvas) => resizeCanvasSelection(canvas, nextSelection, action));
  }

  async function deleteCanvasObject(nextSelection: Exclude<CanvasSelection, null>) {
    await syncCanvas((canvas) => deleteCanvasSelection(canvas, nextSelection));
    setSelection(null);
  }

  async function updateSettings(patch: any) {
    if (!project || !projectId) return;
    const nextProject = await projectsRepo.updateCanvas(projectId, (canvas) => 
      updateCanvasSettings(canvas, patch)
    );
    setProject(nextProject);
  }

  function adjustZoom(delta: number) {
    setZoomLevel(prev => Math.min(2.4, Math.max(0.45, prev + delta)));
  }

  async function convertToPolygon(id: string) {
    if (!project || !projectId) return;
    const nextProject = await projectsRepo.updateCanvas(projectId, (canvas) => 
      convertSiteToPolygon(canvas, id)
    );
    setProject(nextProject);
  }

  async function addVertex(id: string, segmentIndex: number, x: number, y: number) {
    if (!project || !projectId) return;
    const nextProject = await projectsRepo.updateCanvas(projectId, (canvas) => 
      addVertexToSite(canvas, id, segmentIndex, x, y)
    );
    setProject(nextProject);
  }

  async function updateSitePoint(id: string, index: number, patch: { x?: number, y?: number, curvature?: number }) {
    if (!project || !projectId) return;
    const nextProject = await projectsRepo.updateCanvas(projectId, (canvas) => {
      return {
        ...canvas,
        items: canvas.items.map(item => {
          if (item.id !== id || !item.points) return item;
          const nextPoints = [...item.points];
          const newX = patch.x !== undefined && item.x !== undefined ? patch.x - item.x : nextPoints[index]?.x || 0;
          const newY = patch.y !== undefined && item.y !== undefined ? patch.y - item.y : nextPoints[index]?.y || 0;
          nextPoints[index] = { ...nextPoints[index], ...patch, x: newX, y: newY };
          return { ...item, points: nextPoints };
        })
      };
    });
    setProject(nextProject);
  }

  return {
    project,
    selectedTool,
    selection,
    availableTools,
    designerStage,
    validation,
    calculation,
    canvasSettings,
    zoomLevel,
    selectedCanvasItem,
    canvasNodes,
    canvasLinks,
    canvasItems,
    chooseTool,
    createCanvasObject,
    updateItem,
    updateNode,
    updateLink,
    rotateSelection,
    resizeSelection,
    deleteCanvasObject,
    updateSettings,
    convertToPolygon,
    addVertex,
    updateSitePoint,
    adjustZoom,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    copySelection,
    pasteSelection,
    setSelection,
    setZoomLevel,
  };
}
