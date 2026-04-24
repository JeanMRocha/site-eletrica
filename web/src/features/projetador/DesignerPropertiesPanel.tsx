import type { CanvasItem, CanvasTool, CanvasWall } from '../../domain/residential-projects';
import { canvasLabels, formatMeters, metersToPixels, minimumEnvironmentSize, pixelsToMeters, type CanvasSelection } from './canvasModel';

type Props = {
  selectedTool: CanvasTool;
  selectedItem: CanvasItem | null;
  selectedWall: CanvasWall | null;
  selection: CanvasSelection;
  validation: Array<{ type: string; message: string; suggestion?: string; level: string }>;
  calculation: { totalPowerW: number; circuitCount: number; breakerSuggestion: string; cableSuggestion: string } | null;
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void;
  onUpdateWall: (id: string, patch: Partial<CanvasWall>) => void;
  onDelete: (selection: Exclude<CanvasSelection, null>) => void;
};

export function DesignerPropertiesPanel({
  selectedTool,
  selectedItem,
  selectedWall,
  selection,
  validation,
  calculation,
  onUpdateItem,
  onUpdateWall,
  onDelete,
}: Props) {
  return (
    <aside className="designer-props">
      <div className="prop-card">
        <span>Ferramenta</span>
        <strong>{canvasLabels[selectedTool]}</strong>
      </div>
      <div className="prop-card">
        <span>Seleção</span>
        {selectedItem ? <strong>{selectedItem.label}</strong> : selectedWall ? <strong>Parede</strong> : <p className="muted">Nenhum item selecionado.</p>}
        {selectedItem ? (
          <div className="prop-form">
            <label>
              <span>Rótulo</span>
              <input value={selectedItem.label} onChange={(event) => onUpdateItem(selectedItem.id, { label: event.target.value })} />
            </label>
            <div className="form-grid two compact">
              <label>
                <span>X</span>
                <input type="number" value={selectedItem.x} onChange={(event) => onUpdateItem(selectedItem.id, { x: Number(event.target.value) })} />
              </label>
              <label>
                <span>Y</span>
                <input type="number" value={selectedItem.y} onChange={(event) => onUpdateItem(selectedItem.id, { y: Number(event.target.value) })} />
              </label>
            </div>
            {selectedItem.tool === 'environment' ? (
              <div className="form-grid two compact">
                <label>
                  <span>Largura (m)</span>
                  <input
                    type="number"
                    min={pixelsToMeters(minimumEnvironmentSize.width)}
                    step="0.01"
                    value={formatMeters(selectedItem.width ?? 192)}
                    onChange={(event) => onUpdateItem(selectedItem.id, { width: metersToPixels(event.target.value, minimumEnvironmentSize.width) })}
                  />
                </label>
                <label>
                  <span>Altura (m)</span>
                  <input
                    type="number"
                    min={pixelsToMeters(minimumEnvironmentSize.height)}
                    step="0.01"
                    value={formatMeters(selectedItem.height ?? 120)}
                    onChange={(event) => onUpdateItem(selectedItem.id, { height: metersToPixels(event.target.value, minimumEnvironmentSize.height) })}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
        {selectedWall ? (
          <div className="prop-form">
            <div className="form-grid two compact">
              <label>
                <span>X</span>
                <input type="number" value={selectedWall.x} onChange={(event) => onUpdateWall(selectedWall.id, { x: Number(event.target.value) })} />
              </label>
              <label>
                <span>Y</span>
                <input type="number" value={selectedWall.y} onChange={(event) => onUpdateWall(selectedWall.id, { y: Number(event.target.value) })} />
              </label>
            </div>
            <div className="form-grid two compact">
              <label>
                <span>Comprimento</span>
                <input type="number" value={selectedWall.length} onChange={(event) => onUpdateWall(selectedWall.id, { length: Number(event.target.value) })} />
              </label>
              <label>
                <span>Rotação</span>
                <input type="number" value={selectedWall.rotation} onChange={(event) => onUpdateWall(selectedWall.id, { rotation: Number(event.target.value) })} />
              </label>
            </div>
          </div>
        ) : null}
        {selection ? (
          <button className="ghost danger compact-action" type="button" onClick={() => onDelete(selection)}>
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
  );
}
