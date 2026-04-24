import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResidentialProject, updateResidentialProjectCanvas, type CanvasItem, type CanvasTool, type CanvasWall } from '../../domain/residential-projects';
import { electricalCalculationService } from '../../services/ElectricalCalculationService';
import { electricalValidationEngine } from '../../services/ElectricalValidationEngine';
import './projetador.css';

type Selection =
  | { kind: 'item'; id: string }
  | { kind: 'wall'; id: string }
  | null;

type DragState =
  | { mode: 'move-item'; id: string; offsetX: number; offsetY: number }
  | { mode: 'move-wall'; id: string; offsetX: number; offsetY: number }
  | { mode: 'resize-environment'; id: string }
  | { mode: 'resize-wall'; id: string; startX: number; startLength: number };

type ToolDefinition = {
  key: CanvasTool;
  label: string;
  group: 'Ambientes' | 'Estrutura' | 'Entrada' | 'Pontos' | 'Circuitos';
};

const gridSize = 24;
const minimumEnvironmentSize = { width: 120, height: 84 };

const tools: ToolDefinition[] = [
  { key: 'environment', label: 'Ambiente', group: 'Ambientes' },
  { key: 'wall', label: 'Parede', group: 'Estrutura' },
  { key: 'network-source', label: 'Origem', group: 'Entrada' },
  { key: 'qdc', label: 'QDC', group: 'Entrada' },
  { key: 'socket', label: 'Tomada', group: 'Pontos' },
  { key: 'switch', label: 'Interruptor', group: 'Pontos' },
  { key: 'luminaire', label: 'Luminária', group: 'Pontos' },
  { key: 'shower', label: 'Chuveiro', group: 'Pontos' },
  { key: 'air-conditioner', label: 'Ar-condicionado', group: 'Pontos' },
  { key: 'special-load', label: 'Carga especial', group: 'Pontos' },
  { key: 'circuit-line', label: 'Circuito', group: 'Circuitos' },
];

const canvasLabels: Record<CanvasTool, string> = {
  wall: 'Parede',
  environment: 'Ambiente',
  'network-source': 'Origem',
  qdc: 'QDC',
  socket: 'Tomada',
  switch: 'Interruptor',
  luminaire: 'Luminária',
  shower: 'Chuveiro',
  'air-conditioner': 'Ar-condicionado',
  'special-load': 'Carga especial',
  'circuit-line': 'Circuito',
};

const pointTools: CanvasTool[] = ['socket', 'switch', 'luminaire', 'shower', 'air-conditioner', 'special-load'];

export function ProjetadorFeature() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id ?? '';
  const [project, setProject] = useState(() => (projectId ? getResidentialProject(projectId) : null));
  const [selectedTool, setSelectedTool] = useState<CanvasTool>(() => project?.canvas.selectedTool ?? 'environment');
  const [selection, setSelection] = useState<Selection>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const availableTools = useMemo(() => (project ? getAvailableTools(project.canvas.items, project.canvas.walls) : tools.slice(0, 1)), [project]);
  const groupedTools = useMemo(() => groupTools(availableTools), [availableTools]);
  const designerStage = useMemo(() => (project ? getDesignerStage(project.canvas.items, project.canvas.walls) : 'Ambientes'), [project]);
  const validation = useMemo(() => (project ? electricalValidationEngine.validate(project) : []), [project]);
  const calculation = useMemo(() => (project ? electricalCalculationService.calculate(project) : null), [project]);
  const selectedCanvasItem = useMemo(() => {
    if (!project || !selection || selection.kind !== 'item') return null;
    return project.canvas.items.find((item) => item.id === selection.id) ?? null;
  }, [project, selection]);
  const selectedCanvasWall = useMemo(() => {
    if (!project || !selection || selection.kind !== 'wall') return null;
    return project.canvas.walls.find((wall) => wall.id === selection.id) ?? null;
  }, [project, selection]);

  useEffect(() => {
    if (availableTools.some((tool) => tool.key === selectedTool)) return;
    setSelectedTool(availableTools[0]?.key ?? 'environment');
  }, [availableTools, selectedTool]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || !project) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const next = updateResidentialProjectCanvas(project.id, (canvas) => {
        if (drag.mode === 'move-item') {
          return {
            ...canvas,
            items: canvas.items.map((item) =>
              item.id === drag.id
                ? {
                    ...item,
                    x: clamp(snap(event.clientX - rect.left - drag.offsetX), 8, rect.width - (item.width ?? 96)),
                    y: clamp(snap(event.clientY - rect.top - drag.offsetY), 8, rect.height - (item.height ?? 48)),
                  }
                : item,
            ),
          };
        }

        if (drag.mode === 'move-wall') {
          return {
            ...canvas,
            walls: canvas.walls.map((wall) =>
              wall.id === drag.id
                ? {
                    ...wall,
                    x: clamp(snap(event.clientX - rect.left - drag.offsetX), 8, rect.width - Math.max(96, wall.length * gridSize)),
                    y: clamp(snap(event.clientY - rect.top - drag.offsetY), 8, rect.height - 24),
                  }
                : wall,
            ),
          };
        }

        if (drag.mode === 'resize-environment') {
          return {
            ...canvas,
            items: canvas.items.map((item) =>
              item.id === drag.id
                ? {
                    ...item,
                    width: Math.max(minimumEnvironmentSize.width, snap(event.clientX - rect.left - item.x)),
                    height: Math.max(minimumEnvironmentSize.height, snap(event.clientY - rect.top - item.y)),
                  }
                : item,
            ),
          };
        }

        return {
          ...canvas,
          walls: canvas.walls.map((wall) =>
            wall.id === drag.id
              ? {
                  ...wall,
                  length: Math.max(3, Math.round((drag.startLength * gridSize + event.clientX - drag.startX) / gridSize)),
                }
              : wall,
          ),
        };
      });

      setProject(next);
    }

    function handlePointerUp() {
      dragRef.current = null;
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [project]);

  if (!project) {
    return (
      <section className="designer-page">
        <article className="panel designer-shell">
          <div className="canvas-empty">
            <strong>Projeto não encontrado.</strong>
          </div>
        </article>
      </section>
    );
  }

  function chooseTool(tool: CanvasTool) {
    const currentProject = project;
    if (!currentProject || !availableTools.some((item) => item.key === tool)) return;
    setSelectedTool(tool);
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({ ...canvas, selectedTool: tool }));
    setProject(next);
  }

  function placeTool(clientX?: number, clientY?: number) {
    const currentProject = project;
    if (!currentProject || !availableTools.some((tool) => tool.key === selectedTool)) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = rect ? clamp(snap((clientX ?? rect.left + rect.width / 2) - rect.left), 8, rect.width - 120) : 240;
    const y = rect ? clamp(snap((clientY ?? rect.top + rect.height / 2) - rect.top), 8, rect.height - 84) : 180;

    if (selectedTool === 'wall') {
      const wallId = crypto.randomUUID();
      const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
        ...canvas,
        selectedTool,
        walls: [
          ...canvas.walls,
          {
            id: wallId,
            tool: 'wall',
            x,
            y,
            length: 6,
            rotation: 0,
          } satisfies CanvasWall,
        ],
      }));
      setProject(next);
      setSelection({ kind: 'wall', id: wallId });
      return;
    }

    const itemId = crypto.randomUUID();
    const isEnvironment = selectedTool === 'environment';
    const item: CanvasItem = {
      id: itemId,
      tool: selectedTool,
      x,
      y,
      label: isEnvironment ? `Ambiente ${currentProject.canvas.items.filter((canvasItem) => canvasItem.tool === 'environment').length + 1}` : canvasLabels[selectedTool],
      width: isEnvironment ? 192 : undefined,
      height: isEnvironment ? 120 : undefined,
    };
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
      ...canvas,
      selectedTool,
      items: [...canvas.items, item],
    }));
    setProject(next);
    setSelection({ kind: 'item', id: itemId });
  }

  function startItemDrag(event: React.PointerEvent<HTMLButtonElement>, item: CanvasItem) {
    event.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelection({ kind: 'item', id: item.id });
    dragRef.current = {
      mode: 'move-item',
      id: item.id,
      offsetX: event.clientX - rect.left - item.x,
      offsetY: event.clientY - rect.top - item.y,
    };
  }

  function startWallDrag(event: React.PointerEvent<HTMLButtonElement>, wall: CanvasWall) {
    event.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelection({ kind: 'wall', id: wall.id });
    dragRef.current = {
      mode: 'move-wall',
      id: wall.id,
      offsetX: event.clientX - rect.left - wall.x,
      offsetY: event.clientY - rect.top - wall.y,
    };
  }

  function updateSelectedItem(patch: Partial<CanvasItem>) {
    if (!selectedCanvasItem) return;
    const currentProject = project;
    if (!currentProject) return;
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
      ...canvas,
      items: canvas.items.map((item) => (item.id === selectedCanvasItem.id ? { ...item, ...patch } : item)),
    }));
    setProject(next);
  }

  function updateSelectedWall(patch: Partial<Pick<CanvasWall, 'x' | 'y' | 'length' | 'rotation'>>) {
    if (!selectedCanvasWall) return;
    const currentProject = project;
    if (!currentProject) return;
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
      ...canvas,
      walls: canvas.walls.map((wall) => (wall.id === selectedCanvasWall.id ? { ...wall, ...patch } : wall)),
    }));
    setProject(next);
  }

  function removeSelection() {
    const currentProject = project;
    if (!currentProject || !selection) return;
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
      ...canvas,
      items: selection.kind === 'item' ? canvas.items.filter((item) => item.id !== selection.id) : canvas.items,
      walls: selection.kind === 'wall' ? canvas.walls.filter((wall) => wall.id !== selection.id) : canvas.walls,
    }));
    setSelection(null);
    setProject(next);
  }

  return (
    <section className="designer-page">
      <article className="panel designer-shell">
        <div className="panel-head designer-head">
          <div>
            <p className="eyebrow">Projetador</p>
            <h1>{project.name}</h1>
          </div>
          <div className="row-actions">
            <button className="ghost" type="button" onClick={() => navigate(`/projetos/${project.id}`)}>
              Voltar
            </button>
            <button className="button" type="button" onClick={() => placeTool()}>
              Inserir
            </button>
          </div>
        </div>

        <div className="designer-grid">
          <aside className="designer-tools">
            <div className="tool-stage">
              <span>Etapa</span>
              <strong>{designerStage}</strong>
            </div>
            {groupedTools.map((group) => (
              <div className="tool-group" key={group.name}>
                <span>{group.name}</span>
                <div className="tool-grid">
                  {group.items.map((tool) => (
                    <button key={tool.key} className={`tool-chip ${selectedTool === tool.key ? 'active' : ''}`} type="button" onClick={() => chooseTool(tool.key)} title={tool.label}>
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="designer-canvas" ref={canvasRef}>
            <div className="canvas-empty">
              <strong>{designerStage}</strong>
            </div>
            {project.canvas.walls.map((wall) => (
              <button
                key={wall.id}
                className={`canvas-wall ${selection?.kind === 'wall' && selection.id === wall.id ? 'selected' : ''}`}
                type="button"
                onPointerDown={(event) => startWallDrag(event, wall)}
                style={{
                  left: `${wall.x}px`,
                  top: `${wall.y}px`,
                  width: `${Math.max(96, wall.length * gridSize)}px`,
                  transform: `rotate(${wall.rotation}deg)`,
                }}
              >
                Parede
                {selection?.kind === 'wall' && selection.id === wall.id ? (
                  <span
                    className="resize-handle wall-handle"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      dragRef.current = { mode: 'resize-wall', id: wall.id, startX: event.clientX, startLength: wall.length };
                    }}
                  />
                ) : null}
              </button>
            ))}
            {project.canvas.items.map((item) => {
              const isEnvironment = item.tool === 'environment';
              return (
                <button
                  key={item.id}
                  className={`canvas-item tool-${item.tool} ${isEnvironment ? 'environment-item' : ''} ${selection?.kind === 'item' && selection.id === item.id ? 'selected' : ''}`}
                  type="button"
                  onPointerDown={(event) => startItemDrag(event, item)}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: isEnvironment ? `${item.width ?? 192}px` : undefined,
                    height: isEnvironment ? `${item.height ?? 120}px` : undefined,
                  }}
                >
                  <strong>{shortLabel(item.label)}</strong>
                  <span>{canvasLabels[item.tool]}</span>
                  {isEnvironment && selection?.kind === 'item' && selection.id === item.id ? (
                    <span
                      className="resize-handle environment-handle"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        dragRef.current = { mode: 'resize-environment', id: item.id };
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
            <button
              className="canvas-hit-area"
              type="button"
              onClick={(event) => placeTool(event.clientX, event.clientY)}
              aria-label="Inserir ferramenta no canvas"
            />
          </div>

          <aside className="designer-props">
            <div className="prop-card">
              <span>Ferramenta</span>
              <strong>{canvasLabels[selectedTool]}</strong>
            </div>
            <div className="prop-card">
              <span>Seleção</span>
              {selectedCanvasItem ? <strong>{selectedCanvasItem.label}</strong> : selectedCanvasWall ? <strong>Parede</strong> : <p className="muted">Nenhum item selecionado.</p>}
              {selectedCanvasItem ? (
                <div className="prop-form">
                  <label>
                    <span>Rótulo</span>
                    <input value={selectedCanvasItem.label} onChange={(event) => updateSelectedItem({ label: event.target.value })} />
                  </label>
                  <div className="form-grid two compact">
                    <label>
                      <span>X</span>
                      <input type="number" value={selectedCanvasItem.x} onChange={(event) => updateSelectedItem({ x: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Y</span>
                      <input type="number" value={selectedCanvasItem.y} onChange={(event) => updateSelectedItem({ y: Number(event.target.value) })} />
                    </label>
                  </div>
                  {selectedCanvasItem.tool === 'environment' ? (
                    <div className="form-grid two compact">
                      <label>
                        <span>Largura</span>
                        <input type="number" value={selectedCanvasItem.width ?? 192} onChange={(event) => updateSelectedItem({ width: Number(event.target.value) })} />
                      </label>
                      <label>
                        <span>Altura</span>
                        <input type="number" value={selectedCanvasItem.height ?? 120} onChange={(event) => updateSelectedItem({ height: Number(event.target.value) })} />
                      </label>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {selectedCanvasWall ? (
                <div className="prop-form">
                  <div className="form-grid two compact">
                    <label>
                      <span>X</span>
                      <input type="number" value={selectedCanvasWall.x} onChange={(event) => updateSelectedWall({ x: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Y</span>
                      <input type="number" value={selectedCanvasWall.y} onChange={(event) => updateSelectedWall({ y: Number(event.target.value) })} />
                    </label>
                  </div>
                  <div className="form-grid two compact">
                    <label>
                      <span>Comprimento</span>
                      <input type="number" value={selectedCanvasWall.length} onChange={(event) => updateSelectedWall({ length: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Rotação</span>
                      <input type="number" value={selectedCanvasWall.rotation} onChange={(event) => updateSelectedWall({ rotation: Number(event.target.value) })} />
                    </label>
                  </div>
                </div>
              ) : null}
              {selection ? (
                <button className="ghost danger compact-action" type="button" onClick={removeSelection}>
                  Remover
                </button>
              ) : null}
            </div>
            <div className="prop-card">
              <span>Validação</span>
              {validation.length === 0 ? (
                <p className="muted">Sem alertas no momento.</p>
              ) : (
                <div className="stack">
                  {validation.map((finding) => (
                    <article key={`${finding.type}-${finding.message}`} className={`finding ${finding.level}`}>
                      <strong>{finding.message}</strong>
                      <p>{finding.suggestion}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="prop-card">
              <span>Dimensionamento</span>
              {calculation ? (
                <div className="stack tight">
                  <strong>{calculation.totalPowerW} W</strong>
                  <p className="muted">
                    {calculation.circuitCount} circuitos · {calculation.breakerSuggestion} · {calculation.cableSuggestion}
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
}

function getAvailableTools(items: CanvasItem[], walls: CanvasWall[]) {
  const hasEnvironment = items.some((item) => item.tool === 'environment');
  const hasWall = walls.length > 0;
  const hasOrigin = items.some((item) => item.tool === 'network-source');
  const hasQdc = items.some((item) => item.tool === 'qdc');
  const hasPoint = items.some((item) => pointTools.includes(item.tool));

  if (!hasEnvironment) return tools.filter((tool) => tool.key === 'environment');
  if (!hasWall) return tools.filter((tool) => tool.key === 'environment' || tool.key === 'wall');
  if (!hasOrigin || !hasQdc) return tools.filter((tool) => ['environment', 'wall', 'network-source', 'qdc'].includes(tool.key));
  if (!hasPoint) return tools.filter((tool) => tool.key !== 'circuit-line');
  return tools;
}

function getDesignerStage(items: CanvasItem[], walls: CanvasWall[]) {
  const hasEnvironment = items.some((item) => item.tool === 'environment');
  const hasWall = walls.length > 0;
  const hasOrigin = items.some((item) => item.tool === 'network-source');
  const hasQdc = items.some((item) => item.tool === 'qdc');
  const hasPoint = items.some((item) => pointTools.includes(item.tool));

  if (!hasEnvironment) return 'Ambientes';
  if (!hasWall) return 'Paredes';
  if (!hasOrigin || !hasQdc) return 'Entrada';
  if (!hasPoint) return 'Pontos';
  return 'Circuitos';
}

function groupTools(items: ToolDefinition[]) {
  const groups = new Map<ToolDefinition['group'], ToolDefinition[]>();
  for (const item of items) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  return Array.from(groups, ([name, groupItems]) => ({ name, items: groupItems }));
}

function snap(value: number) {
  return Math.round(value / gridSize) * gridSize;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function shortLabel(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 4) return normalized;
  return normalized.slice(0, 4).toUpperCase();
}
