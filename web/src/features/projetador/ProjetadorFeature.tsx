import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { electricalCalculationService } from '../../services/ElectricalCalculationService';
import { electricalValidationEngine } from '../../services/ElectricalValidationEngine';
import { getResidentialProject, updateResidentialProjectCanvas, type CanvasItem, type CanvasTool, type CanvasWall } from '../../domain/residential-projects';
import './projetador.css';

const tools: Array<{ key: CanvasTool; label: string }> = [
  { key: 'wall', label: 'Parede' },
  { key: 'environment', label: 'Ambiente' },
  { key: 'network-source', label: 'Origem' },
  { key: 'qdc', label: 'QDC' },
  { key: 'socket', label: 'Tomada' },
  { key: 'switch', label: 'Interruptor' },
  { key: 'luminaire', label: 'Luminária' },
  { key: 'shower', label: 'Chuveiro' },
  { key: 'air-conditioner', label: 'Ar-condicionado' },
  { key: 'special-load', label: 'Carga especial' },
  { key: 'circuit-line', label: 'Linha de circuito' },
];

type Selection =
  | { kind: 'item'; id: string }
  | { kind: 'wall'; id: string }
  | null;

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

export function ProjetadorFeature() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id ?? '';
  const [project, setProject] = useState(() => (projectId ? getResidentialProject(projectId) : null));
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('wall');
  const [selection, setSelection] = useState<Selection>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

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

  if (!project) {
    return (
      <section className="designer-page">
        <article className="panel designer-shell">
          <div className="canvas-empty">
            <strong>Projeto não encontrado.</strong>
            <p>Abra um projeto válido para começar a desenhar a planta 2D.</p>
          </div>
        </article>
      </section>
    );
  }

  function placeTool(clientX?: number, clientY?: number) {
    const currentProject = project;
    if (!currentProject) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = rect
      ? Math.max(20, Math.round((((clientX ?? rect.left + rect.width / 2) - rect.left) / 24) * 24))
      : 240;
    const y = rect
      ? Math.max(20, Math.round((((clientY ?? rect.top + rect.height / 2) - rect.top) / 24) * 24))
      : 180;

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
            length: 7,
            rotation: 0,
          } satisfies CanvasWall,
        ],
      }));
      setProject(next);
      setSelection({ kind: 'wall', id: wallId });
      return;
    }

    const itemId = crypto.randomUUID();
    const item: CanvasItem = {
      id: itemId,
      tool: selectedTool,
      x,
      y,
      label: canvasLabels[selectedTool],
    };
    const next = updateResidentialProjectCanvas(currentProject.id, (canvas) => ({
      ...canvas,
      selectedTool,
      items: [...canvas.items, item],
    }));
    setProject(next);
    setSelection({ kind: 'item', id: itemId });
  }

  function selectItem(item: CanvasItem) {
    setSelection({ kind: 'item', id: item.id });
  }

  function selectWall(wall: CanvasWall) {
    setSelection({ kind: 'wall', id: wall.id });
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
        <div className="panel-head">
          <div>
            <p className="eyebrow">Projetador</p>
            <h1>{project.name}</h1>
          </div>
          <div className="row-actions">
            <button className="ghost" type="button" onClick={() => navigate(`/projetos/${project.id}`)}>
              Voltar
            </button>
            <button className="button" type="button" onClick={() => placeTool()}>
              Inserir item
            </button>
          </div>
        </div>

        <div className="designer-grid">
          <aside className="designer-tools">
            <div className="stack tight">
              {tools.map((tool) => (
                <button key={tool.key} className={`tool-chip ${selectedTool === tool.key ? 'active' : ''}`} type="button" onClick={() => setSelectedTool(tool.key)}>
                  {tool.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="designer-canvas" ref={canvasRef}>
            <div className="canvas-empty">
              <strong>Canvas 2D base</strong>
              <p>Clique para inserir a ferramenta ativa. Clique em um item para selecionar e editar.</p>
            </div>
            <button className="canvas-origin" type="button" onClick={() => setSelection(null)}>
              Rede
            </button>
            {project.canvas.walls.map((wall) => (
              <button
                key={wall.id}
                className={`canvas-wall ${selection?.kind === 'wall' && selection.id === wall.id ? 'selected' : ''}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  selectWall(wall);
                }}
                style={{
                  left: `${wall.x}px`,
                  top: `${wall.y}px`,
                  width: `${Math.max(96, wall.length * 24)}px`,
                  transform: `rotate(${wall.rotation}deg)`,
                }}
              >
                Parede
              </button>
            ))}
            {project.canvas.items.map((item) => (
              <button
                key={item.id}
                className={`canvas-item tool-${item.tool} ${selection?.kind === 'item' && selection.id === item.id ? 'selected' : ''}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  selectItem(item);
                }}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                }}
              >
                <strong>{shortLabel(item.label)}</strong>
                <span>{canvasLabels[item.tool]}</span>
              </button>
            ))}
            <button
              className="canvas-hit-area"
              type="button"
              onClick={(event) => placeTool(event.clientX, event.clientY)}
              aria-label="Inserir ferramenta no canvas"
            />
          </div>

          <aside className="designer-props">
            <div className="prop-card">
              <span>Ferramenta ativa</span>
              <strong>{selectedTool}</strong>
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
                  <div className="form-grid three compact">
                    <label>
                      <span>X</span>
                      <input type="number" value={selectedCanvasItem.x} onChange={(event) => updateSelectedItem({ x: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Y</span>
                      <input type="number" value={selectedCanvasItem.y} onChange={(event) => updateSelectedItem({ y: Number(event.target.value) })} />
                    </label>
                  </div>
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
                  Remover item
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

function shortLabel(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 4) return normalized;
  return normalized.slice(0, 4).toUpperCase();
}
