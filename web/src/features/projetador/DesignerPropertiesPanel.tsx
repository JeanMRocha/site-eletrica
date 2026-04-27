import { useState } from 'react';
import { pixelsToMeters, metersToPixels, type CanvasSelection } from './canvasModel';
import type { CanvasItem, CanvasSettings, CanvasTool, CanvasNode, CanvasLink } from '../../domain/residential-projects';

type Props = {
  selectedTool: CanvasTool;
  items: CanvasItem[];
  nodes: CanvasNode[];
  links: CanvasLink[];
  selection: CanvasSelection | null;
  isCollapsed: boolean;
  validation: any[];
  calculation: any;
  onUpdateItem: (id: string, patch: Partial<CanvasItem>) => void;
  onUpdateNode: (id: string, patch: Partial<CanvasNode>) => void;
  onUpdateLink: (id: string, patch: Partial<CanvasLink>) => void;
  onUpdateSettings: (patch: Partial<CanvasSettings>) => void;
  onDelete: (selection: Exclude<CanvasSelection, null>) => void;
  onToggleCollapse: () => void;
  onSelect: (selection: CanvasSelection) => void;
  onConvertToPolygon?: (id: string) => void;
  onUpdateSitePoint?: (id: string, index: number, patch: { x?: number, y?: number, curvature?: number }) => void;
  onAddVertex?: (id: string, index: number, x: number, y: number) => void;
  canvasSettings: CanvasSettings;
};

export function DesignerPropertiesPanel({
  items,
  nodes,
  links,
  selection,
  isCollapsed,
  validation,
  calculation,
  onUpdateItem,
  onUpdateNode,
  onUpdateLink,
  onUpdateSettings,
  onDelete,
  onToggleCollapse,
  onSelect,
  onConvertToPolygon,
  onUpdateSitePoint,
  onAddVertex,
  canvasSettings,
}: Props) {
  const [activeTab, setActiveTab] = useState<'object' | 'settings' | 'vertices' | 'technical'>('object');
  const [isVertexModalOpen, setIsVertexModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['TERRENO', 'ALVENARIA', 'ELÉTRICA']));

  const selectedItem = items.find(i => selection?.kind === 'item' && i.id === selection.id);

  if (isCollapsed) {
    return (
      <aside className="designer-props-modern collapsed-width">
         <button className="blender-btn mini" onClick={onToggleCollapse}>«</button>
      </aside>
    );
  }

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setExpandedGroups(next);
  };

  const renderOutlinerRow = (kind: 'item' | 'node' | 'link', id: string, label: string, icon: string, visible?: boolean, locked?: boolean, noPrint?: boolean) => {
    const isSelected = selection?.kind === kind && selection.id === id;
    const isVisible = visible !== false;
    const isLocked = locked === true;
    const isPrintable = noPrint !== true;

    const toggleVisible = (e: React.MouseEvent) => {
      e.stopPropagation();
      const patch = { visible: !isVisible };
      if (kind === 'item') onUpdateItem(id, patch);
      else if (kind === 'node') onUpdateNode(id, patch);
      else if (kind === 'link') onUpdateLink(id, patch);
    };

    const toggleLocked = (e: React.MouseEvent) => {
      e.stopPropagation();
      const patch = { locked: !isLocked };
      if (kind === 'item') onUpdateItem(id, patch);
      else if (kind === 'node') onUpdateNode(id, patch);
      else if (kind === 'link') onUpdateLink(id, patch);
    };

    const togglePrint = (e: React.MouseEvent) => {
      e.stopPropagation();
      const patch = { noPrint: !noPrint };
      if (kind === 'item') onUpdateItem(id, patch);
      else if (kind === 'node') onUpdateNode(id, patch);
      else if (kind === 'link') onUpdateLink(id, patch);
    };
    
    return (
      <div 
        key={id} 
        className={`outliner-row ${isSelected ? 'selected' : ''} ${!isVisible ? 'muted' : ''}`}
        onClick={() => onSelect({ kind, id })}
      >
        <div className="outliner-item-main">
          <span className="icon">{icon}</span>
          <span className="label">{label}</span>
        </div>
        <div className="outliner-controls">
          <button className={`outliner-btn ${!isVisible ? 'active' : ''}`} onClick={toggleVisible} title="Visibilidade">
            {isVisible ? '👁️' : '🙈'}
          </button>
          <button className={`outliner-btn ${isLocked ? 'active' : ''}`} onClick={toggleLocked} title="Bloquear">
            {isLocked ? '🔒' : '🔓'}
          </button>
          <button className={`outliner-btn ${!isPrintable ? 'active' : ''}`} onClick={togglePrint} title="Impressão">
            {isPrintable ? '🖨️' : '🚫'}
          </button>
          <button 
            className="outliner-btn" 
            title="Excluir"
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete({ kind, id } as any); 
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  const terrainItems = items.filter(i => i.tool === 'site-area');
  const electricalItems = items.filter(i => i.tool !== 'site-area');

  return (
    <aside className="designer-props-modern">
      {/* Outliner Section */}
      <div className="outliner-panel">
        <div className="panel-title-strip row spread middle">
          <span>Cena do Projeto</span>
          <div className="row gap-xs">
            <span className="tiny-label">V</span>
            <span className="tiny-label">L</span>
            <span className="tiny-label">P</span>
          </div>
        </div>
        <div className="outliner-content custom-scrollbar">
          {/* TERRENO GROUP */}
          <div className={`outliner-group ${expandedGroups.has('TERRENO') ? 'expanded' : ''}`}>
             <div className="group-header row middle" onClick={() => toggleGroup('TERRENO')}>
                <span className="arrow">{expandedGroups.has('TERRENO') ? '▼' : '▶'}</span>
                <span className="folder-icon">📁</span>
                <span className="label">TERRENO</span>
             </div>
             {expandedGroups.has('TERRENO') && (
                <div className="group-items">
                   {terrainItems.map(item => renderOutlinerRow('item', item.id, item.label || 'Terreno', '📐', item.visible, item.locked, item.noPrint))}
                </div>
             )}
          </div>

          {/* ALVENARIA GROUP */}
          <div className={`outliner-group ${expandedGroups.has('ALVENARIA') ? 'expanded' : ''}`}>
             <div className="group-header row middle" onClick={() => toggleGroup('ALVENARIA')}>
                <span className="arrow">{expandedGroups.has('ALVENARIA') ? '▼' : '▶'}</span>
                <span className="folder-icon">📁</span>
                <span className="label">ALVENARIA</span>
             </div>
             {expandedGroups.has('ALVENARIA') && (
                <div className="group-items">
                   {links.map(link => renderOutlinerRow('link', link.id, link.type === 'opening' ? 'Abertura' : 'Parede', '🧱', link.visible, link.locked, link.noPrint))}
                   {nodes.map(node => renderOutlinerRow('node', node.id, 'Junção', '📍', node.visible, node.locked, node.noPrint))}
                </div>
             )}
          </div>

          {/* ELÉTRICA GROUP */}
          <div className={`outliner-group ${expandedGroups.has('ELÉTRICA') ? 'expanded' : ''}`}>
             <div className="group-header row middle" onClick={() => toggleGroup('ELÉTRICA')}>
                <span className="arrow">{expandedGroups.has('ELÉTRICA') ? '▼' : '▶'}</span>
                <span className="folder-icon">📁</span>
                <span className="label">ELÉTRICA</span>
             </div>
             {expandedGroups.has('ELÉTRICA') && (
                <div className="group-items">
                   {electricalItems.map(item => renderOutlinerRow('item', item.id, item.label || item.tool, '⚡', item.visible, item.locked, item.noPrint))}
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="properties-panel">
        <div className="properties-tabs-v">
          <div 
            className={`v-tab-btn ${activeTab === 'object' ? 'active' : ''}`}
            onClick={() => setActiveTab('object')}
            title="Atributos"
          >
            📦
          </div>
          {selectedItem?.tool === 'site-area' && selectedItem.points && (
            <div 
              className={`v-tab-btn ${activeTab === 'vertices' ? 'active' : ''}`}
              onClick={() => setActiveTab('vertices')}
              title="Vértices"
            >
              📐
            </div>
          )}
          <div 
            className={`v-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveTab('technical')}
            title="Cálculos"
          >
            📊
          </div>
          <div 
            className={`v-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Configurações"
          >
            ⚙️
          </div>
        </div>

        <div className="properties-content custom-scrollbar">
          <div className="stack gap-sm" style={{ marginBottom: '12px' }}>
             <button className="collapse-btn-mini" onClick={onToggleCollapse}>Esconder Painel »</button>
          </div>

          {activeTab === 'object' && (
            <div className="stack gap-md">
              {!selectedItem ? (
                <div className="empty-selection-msg">Selecione um objeto no Outliner</div>
              ) : (
                <>
                  <div className="prop-field">
                    <span>Nome</span>
                    <input 
                      className="blender-input"
                      value={selectedItem.label || ''} 
                      onChange={(e) => onUpdateItem(selectedItem.id, { label: e.target.value })}
                    />
                  </div>

                  <div className="row gap-sm">
                    <div className="prop-field flex-1">
                      <span>Posição X</span>
                      <input 
                        className="blender-input"
                        type="number"
                        value={pixelsToMeters(selectedItem.x, canvasSettings.scale)}
                        onChange={(e) => onUpdateItem(selectedItem.id, { x: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                      />
                    </div>
                    <div className="prop-field flex-1">
                      <span>Posição Y</span>
                      <input 
                        className="blender-input"
                        type="number"
                        value={pixelsToMeters(selectedItem.y, canvasSettings.scale)}
                        onChange={(e) => onUpdateItem(selectedItem.id, { y: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                      />
                    </div>
                  </div>

                  {selectedItem.tool === 'site-area' && !selectedItem.points && (
                    <>
                      <div className="row gap-sm">
                        <div className="prop-field flex-1">
                          <span>Largura</span>
                          <input 
                            className="blender-input"
                            type="number"
                            value={pixelsToMeters(selectedItem.width || 0, canvasSettings.scale)}
                            onChange={(e) => onUpdateItem(selectedItem.id, { width: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                          />
                        </div>
                        <div className="prop-field flex-1">
                          <span>Altura</span>
                          <input 
                            className="blender-input"
                            type="number"
                            value={pixelsToMeters(selectedItem.height || 0, canvasSettings.scale)}
                            onChange={(e) => onUpdateItem(selectedItem.id, { height: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                          />
                        </div>
                      </div>
                      <button className="blender-btn primary" onClick={() => onConvertToPolygon?.(selectedItem.id)}>
                        📐 EDITAR FORMATO (POLÍGONO)
                      </button>
                    </>
                  )}

                  {selectedItem.tool === 'site-area' && selectedItem.points && (
                    <div className="stack gap-sm">
                       <p className="hint-text">Terreno em modo Polígono</p>
                       <button className="blender-btn accent" onClick={() => setIsVertexModalOpen(true)}>
                         📝 ABRIR LISTA DE VÉRTICES
                       </button>
                    </div>
                  )}

                  <div className="prop-field">
                    <span>Rotação</span>
                    <input 
                      className="blender-input"
                      type="number"
                      value={selectedItem.rotation || 0}
                      onChange={(e) => onUpdateItem(selectedItem.id, { rotation: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="stack gap-md">
               <div className="calc-card">
                  <span className="eyebrow">Demanda Estimada</span>
                  <strong className="accent">{calculation?.demand || 0} kVA</strong>
               </div>
               <div className="divider-h-blender mini">Alertas Técnicos</div>
               {validation.map((v, i) => (
                 <div key={i} className={`finding-card ${v.severity}`}>
                    <header className="row middle gap-xs">
                      <span className="dot"></span>
                      <strong>{v.severity.toUpperCase()}</strong>
                    </header>
                    <p>{v.message}</p>
                 </div>
               ))}
               {validation.length === 0 && <p className="hint-text">Nenhuma inconsistência detectada.</p>}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="stack gap-md">
              <div className="prop-field">
                <span>Precisão Decimal</span>
                <select 
                  className="blender-input"
                  value={canvasSettings.precision}
                  onChange={(e) => onUpdateSettings({ precision: parseInt(e.target.value) })}
                >
                  <option value={0}>0 (m)</option>
                  <option value={1}>0.1 (m)</option>
                  <option value={2}>0.01 (m)</option>
                  <option value={3}>0.001 (m)</option>
                </select>
              </div>
              <div className="prop-field">
                <span>Escala do Projeto</span>
                <input 
                  className="blender-input"
                  type="number"
                  value={canvasSettings.scale}
                  onChange={(e) => onUpdateSettings({ scale: parseFloat(e.target.value) || 1 })}
                />
              </div>
            </div>
          )}

          {activeTab === 'vertices' && selectedItem?.points && (
             <div className="stack gap-sm">
                <p className="eyebrow">Resumo de Geometria</p>
                <div className="vertex-summary-list custom-scrollbar">
                  {selectedItem.points.map((p, idx) => (
                    <div key={idx} className="vertex-mini-row row spread">
                      <span>V{idx+1}</span>
                      <span>{pixelsToMeters(p.x, canvasSettings.scale)}m, {pixelsToMeters(p.y, canvasSettings.scale)}m</span>
                    </div>
                  ))}
                </div>
                <button className="blender-btn primary" onClick={() => setIsVertexModalOpen(true)}>
                  EDITOR DE MALHA
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Vertex Editor Modal (Overlay) */}
      {isVertexModalOpen && selectedItem && selectedItem.points && (
        <div className="vertex-modal-overlay" onClick={() => setIsVertexModalOpen(false)}>
          <div className="vertex-modal-content blender-style" onClick={e => e.stopPropagation()}>
            <header className="row spread middle">
              <div className="row gap-sm middle">
                <span className="icon">📐</span>
                <h3>Vértices do Terreno</h3>
              </div>
              <button className="close-btn" onClick={() => setIsVertexModalOpen(false)}>×</button>
            </header>
            <div className="vertex-list custom-scrollbar">
              {selectedItem.points.map((p, idx) => {
                const points = selectedItem.points || [];
                const next = points[(idx + 1) % points.length];
                return (
                  <div key={idx} className="vertex-edit-item stack gap-xs">
                    <div className="row spread middle">
                      <strong>PONTO V{idx + 1}</strong>
                      {next && (
                        <button className="mini-plus" title="Dividir aresta" onClick={() => {
                          onAddVertex?.(selectedItem.id, idx, selectedItem.x + (p.x + next.x)/2, selectedItem.y + (p.y + next.y)/2);
                        }}>+</button>
                      )}
                    </div>
                    <div className="row gap-sm">
                      <div className="prop-field mini flex-1">
                        <span>Coordenada X (m)</span>
                        <input 
                          className="blender-input mini"
                          type="number" 
                          step={0.01}
                          value={pixelsToMeters(p.x, canvasSettings.scale)}
                          onChange={e => onUpdateSitePoint?.(selectedItem.id, idx, { x: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                        />
                      </div>
                      <div className="prop-field mini flex-1">
                        <span>Coordenada Y (m)</span>
                        <input 
                          className="blender-input mini"
                          type="number"
                          step={0.01}
                          value={pixelsToMeters(p.y, canvasSettings.scale)}
                          onChange={e => onUpdateSitePoint?.(selectedItem.id, idx, { y: metersToPixels(parseFloat(e.target.value) || 0, canvasSettings.scale) })}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <footer className="row end">
              <button className="blender-btn primary" onClick={() => setIsVertexModalOpen(false)}>SALVAR E FECHAR</button>
            </footer>
          </div>
        </div>
      )}
    </aside>
  );
}
