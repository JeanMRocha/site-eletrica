import { useEffect, useMemo, useState } from 'react';
import type { CanvasItem, CanvasTool, CanvasWall, ProjectCanvas, ResidentialProject } from '../../domain/residential-projects';
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
  updateCanvasWall,
} from './canvasMutations';
import { getAvailableTools, getDesignerStage } from './canvasModel';
import type { CanvasSelection } from './canvasModel';

const emptyItems: CanvasItem[] = [];
const emptyWalls: CanvasWall[] = [];

type CanvasMutationResult<TResult> = {
  canvas: ProjectCanvas;
  result: TResult;
};

export function useProjectCanvasController(projectId: string) {
  const [project, setProject] = useState<ResidentialProject | null>(null);
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('environment');
  const [selection, setSelection] = useState<CanvasSelection>(null);

  const canvasItems = project?.canvas.items ?? emptyItems;
  const canvasWalls = project?.canvas.walls ?? emptyWalls;

  const availableTools = useMemo(() => (project ? getAvailableTools(canvasItems, canvasWalls) : []), [canvasItems, canvasWalls, project]);
  const designerStage = useMemo(() => (project ? getDesignerStage(canvasItems, canvasWalls) : 'Ambientes'), [canvasItems, canvasWalls, project]);
  const validation = useMemo(() => (project ? electricalValidationEngine.validate(project) : []), [project]);
  const calculation = useMemo(() => (project ? electricalCalculationService.calculate(project) : null), [project]);

  const selectedCanvasItem = useMemo(() => {
    if (!project || !selection || selection.kind !== 'item') return null;
    return canvasItems.find((item) => item.id === selection.id) ?? null;
  }, [canvasItems, project, selection]);

  const selectedCanvasWall = useMemo(() => {
    if (!project || !selection || selection.kind !== 'wall') return null;
    return canvasWalls.find((wall) => wall.id === selection.id) ?? null;
  }, [canvasWalls, project, selection]);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      const next = await projectsRepo.get(projectId);
      setProject(next);
      if (next) setSelectedTool((next.canvas.selectedTool as CanvasTool) || 'environment');
    }
    load();
  }, [projectId]);

  useEffect(() => {
    if (availableTools.some((tool) => tool.key === selectedTool)) return;
    setSelectedTool(availableTools[0]?.key ?? 'environment');
  }, [availableTools, selectedTool]);

  async function syncCanvas(updater: (canvas: ProjectCanvas) => ProjectCanvas) {
    if (!project || !projectId) return;
    const next = await projectsRepo.updateCanvas(projectId, updater);
    setProject(next);
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
    if (!availableTools.some((item) => item.key === tool)) return;
    setSelectedTool(tool);
    await syncCanvas((canvas) => selectTool(canvas, tool));
  }

  async function createCanvasObject(tool: CanvasTool, x: number, y: number) {
    if (!availableTools.some((item) => item.key === tool)) return;
    const nextSelection = await syncCanvasWithResult((canvas) => {
      const next = createCanvasObjectMutation(canvas, tool, x, y);
      return { canvas: next.canvas, result: next.selection };
    });
    if (nextSelection) setSelection(nextSelection);
  }

  async function updateItem(id: string, patch: Partial<CanvasItem>) {
    await syncCanvas((canvas) => updateCanvasItem(canvas, id, patch));
  }

  async function updateWall(id: string, patch: Partial<CanvasWall>) {
    await syncCanvas((canvas) => updateCanvasWall(canvas, id, patch));
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

  return {
    project,
    selectedTool,
    selection,
    availableTools,
    designerStage,
    validation,
    calculation,
    selectedCanvasItem,
    selectedCanvasWall,
    chooseTool,
    createCanvasObject,
    updateItem,
    updateWall,
    rotateSelection,
    resizeSelection,
    deleteCanvasObject,
    setSelection,
  };
}
