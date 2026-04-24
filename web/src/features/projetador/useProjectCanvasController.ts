import { useEffect, useMemo, useState } from 'react';
import type { CanvasItem, CanvasTool, CanvasWall, ProjectCanvas } from '../../domain/residential-projects';
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
import { localProjectCanvasRepository, type ProjectCanvasRepository } from './projectCanvasRepository';

const emptyItems: CanvasItem[] = [];
const emptyWalls: CanvasWall[] = [];

type CanvasMutationResult<TResult> = {
  canvas: ProjectCanvas;
  result: TResult;
};

export function useProjectCanvasController(projectId: string, repository: ProjectCanvasRepository = localProjectCanvasRepository) {
  const [project, setProject] = useState(() => (projectId ? repository.get(projectId) : null));
  const [selectedTool, setSelectedTool] = useState<CanvasTool>(() => project?.canvas.selectedTool ?? 'environment');
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
    const nextProject = projectId ? repository.get(projectId) : null;
    setProject(nextProject);
    setSelectedTool(nextProject?.canvas.selectedTool ?? 'environment');
    setSelection(null);
  }, [projectId, repository]);

  useEffect(() => {
    if (availableTools.some((tool) => tool.key === selectedTool)) return;
    setSelectedTool(availableTools[0]?.key ?? 'environment');
  }, [availableTools, selectedTool]);

  function syncCanvas(updater: (canvas: ProjectCanvas) => ProjectCanvas) {
    if (!project || !projectId) return;
    const next = repository.updateCanvas(projectId, updater);
    setProject(next);
  }

  function syncCanvasWithResult<TResult>(mutation: (canvas: ProjectCanvas) => CanvasMutationResult<TResult>) {
    let result: TResult | null = null;
    syncCanvas((canvas) => {
      const next = mutation(canvas);
      result = next.result;
      return next.canvas;
    });
    return result;
  }

  function chooseTool(tool: CanvasTool) {
    if (!availableTools.some((item) => item.key === tool)) return;
    setSelectedTool(tool);
    syncCanvas((canvas) => selectTool(canvas, tool));
  }

  function createCanvasObject(tool: CanvasTool, x: number, y: number) {
    if (!availableTools.some((item) => item.key === tool)) return;
    const nextSelection = syncCanvasWithResult((canvas) => {
      const next = createCanvasObjectMutation(canvas, tool, x, y);
      return { canvas: next.canvas, result: next.selection };
    });
    if (nextSelection) setSelection(nextSelection);
  }

  function updateItem(id: string, patch: Partial<CanvasItem>) {
    syncCanvas((canvas) => updateCanvasItem(canvas, id, patch));
  }

  function updateWall(id: string, patch: Partial<CanvasWall>) {
    syncCanvas((canvas) => updateCanvasWall(canvas, id, patch));
  }

  function rotateSelection(nextSelection: Exclude<CanvasSelection, null>, degrees: 90 | 180) {
    syncCanvas((canvas) => rotateCanvasSelection(canvas, nextSelection, degrees));
  }

  function resizeSelection(nextSelection: Exclude<CanvasSelection, null>, action: 'wider' | 'narrower' | 'taller' | 'shorter') {
    syncCanvas((canvas) => resizeCanvasSelection(canvas, nextSelection, action));
  }

  function deleteCanvasObject(nextSelection: Exclude<CanvasSelection, null>) {
    syncCanvas((canvas) => deleteCanvasSelection(canvas, nextSelection));
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
