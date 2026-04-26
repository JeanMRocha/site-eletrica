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
    <aside className="designer-props-modern glass-panel">
      <header className="props-header">
        <p className="eyebrow">Propriedades</p>
        <div className="row spread">
           <strong>{selectedItem ? selectedItem.label : selectedWall ? 'Parede' : canvasLabels[selectedTool]}</strong>
           {selection && (
             <button className="text-btn danger size-xs" onClick={() => onDelete(selection)}>Remover</button>
           )}
        </div>
      </header>

      <div className="props-body scroll-thin">
        {selectedItem && (
          <section className="prop-group">
            <span className="group-label">Atributos</span>
            <div className="stack tight">
              <label className="prop-field">
                <span>Rótulo / Nome</span>
                <input 
                  value={selectedItem.label} 
                  onChange={(e) => onUpdateItem(selectedItem.id, { label: e.target.value })} 
                />
              </label>
              
              <div className="form-grid two compact">
                <label className="prop-field">
                  <span>Posição X</span>
                  <input type="number" value={selectedItem.x} onChange={(e) => onUpdateItem(selectedItem.id, { x: Number(e.target.value) })} />
                </label>
                <label className="prop-field">
                  <span>Posição Y</span>
                  <input type="number" value={selectedItem.y} onChange={(e) => onUpdateItem(selectedItem.id, { y: Number(e.target.value) })} />
                </label>
              </div>

              {selectedItem.tool === 'environment' && (
                <div className="form-grid two compact">
                  <label className="prop-field">
                    <span>Largura (m)</span>
                    <input
                      type="number"
                      min={pixelsToMeters(minimumEnvironmentSize.width)}
                      step="0.01"
                      value={formatMeters(selectedItem.width ?? 192)}
                      onChange={(e) => onUpdateItem(selectedItem.id, { width: metersToPixels(e.target.value, minimumEnvironmentSize.width) })}
                    />
                  </label>
                  <label className="prop-field">
                    <span>Altura (m)</span>
                    <input
                      type="number"
                      min={pixelsToMeters(minimumEnvironmentSize.height)}
                      step="0.01"
                      value={formatMeters(selectedItem.height ?? 120)}
                      onChange={(e) => onUpdateItem(selectedItem.id, { height: metersToPixels(e.target.value, minimumEnvironmentSize.height) })}
                    />
                  </label>
                </div>
              )}
            </div>
          </section>
        )}

        {selectedWall && (
          <section className="prop-group">
            <span className="group-label">Geometria da Parede</span>
            <div className="stack tight">
               <div className="form-grid two compact">
                 <label className="prop-field"><span>Início X</span><input type="number" value={selectedWall.x} onChange={(e) => onUpdateWall(selectedWall.id, { x: Number(e.target.value) })} /></label>
                 <label className="prop-field"><span>Início Y</span><input type="number" value={selectedWall.y} onChange={(e) => onUpdateWall(selectedWall.id, { y: Number(e.target.value) })} /></label>
               </div>
               <div className="form-grid two compact">
                 <label className="prop-field"><span>Comprimento</span><input type="number" value={selectedWall.length} onChange={(e) => onUpdateWall(selectedWall.id, { length: Number(e.target.value) })} /></label>
                 <label className="prop-field"><span>Rotação</span><input type="number" value={selectedWall.rotation} onChange={(e) => onUpdateWall(selectedWall.id, { rotation: Number(e.target.value) })} /></label>
               </div>
            </div>
          </section>
        )}

        <section className="prop-group">
          <span className="group-label">Dimensionamento</span>
          {calculation ? (
            <div className="calc-card glass-panel">
               <div className="calc-value">
                 <strong>{calculation.totalPowerW}</strong>
                 <span>Watts (Potência)</span>
               </div>
               <div className="calc-meta size-xs muted">
                 <span>{calculation.circuitCount} Circuitos</span>
                 <span>Disp. {calculation.breakerSuggestion}</span>
                 <span>Cond. {calculation.cableSuggestion}</span>
               </div>
            </div>
          ) : (
            <p className="muted size-xs center">Selecione um ponto para calcular.</p>
          )}
        </section>

        <section className="prop-group">
          <span className="group-label">Audit / Conformidade</span>
          <div className="validation-list stack tight">
            {validation.length === 0 ? (
              <p className="muted size-xs center">Audit limpo. Nenhuma inconformidade.</p>
            ) : (
              validation.map((finding, i) => (
                <article key={i} className={`finding-card ${finding.level}`}>
                  <header>
                    <span className="dot"></span>
                    <strong>{finding.message}</strong>
                  </header>
                  {finding.suggestion && <p className="size-xs">{finding.suggestion}</p>}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
