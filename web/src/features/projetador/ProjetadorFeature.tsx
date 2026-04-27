import { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DesignerPropertiesPanel } from './DesignerPropertiesPanel';
import { DesignerToolbar } from './DesignerToolbar';
import { useProjectCanvasController } from './useProjectCanvasController';
import { formatZoom, formatMeters, type DesignerStage, checkStageReadiness } from './canvasModel';
import './projetador.css';

const FabricProjectCanvas = lazy(() => import('./FabricProjectCanvas').then((module) => ({ default: module.FabricProjectCanvas })));

export function ProjetadorFeature({ hideHeader: _hideHeader = false }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id ?? '';
  const controller = useProjectCanvasController(projectId);
  const { project } = controller;
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(false);
  const [activeStage, setActiveStage] = useState<DesignerStage>('FLOOR');

  useEffect(() => {
    if (showGuide) {
      const timer = setTimeout(() => setShowGuide(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showGuide]);

  // Global Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        controller.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        controller.redo();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [controller]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => setIsResizing(false);

  const resize = (e: React.MouseEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 150 && newWidth < 800) {
      setRightPanelWidth(newWidth);
    }
  };

  if (!project) {
    return (
      <section className="designer-page page-transition">
        <div className="panel center">
          <strong>Projeto não encontrado para edição.</strong>
          <button className="button" onClick={() => navigate('/projetos')}>Voltar</button>
        </div>
      </section>
    );
  }

  const readiness = checkStageReadiness(activeStage, project.canvas.items, project.canvas.links);

  const gridColumns = rightCollapsed 
    ? '1fr 0 0'
    : `1fr 4px ${rightPanelWidth}px`;

  return (
    <section className="designer-page page-transition" onMouseMove={resize} onMouseUp={stopResizing}>
      <div className="designer-layout-container">
        {/* Unified Industrial Header */}
        <header className="designer-header-unified">
          <div className="header-left">
            <div className="project-title-box">
              <span className="label">PROJETO:</span>
              <span className="value">{project.name}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="voltage-badge">{project.voltage}</div>
          </div>
        </header>

        {/* Guided Workflow Bar */}
        <nav className="designer-workflow-bar">
          <div className="flow-stages">
            <button 
              className={`flow-btn ${activeStage === 'FLOOR' ? 'active' : ''}`}
              onClick={() => setActiveStage('FLOOR')}
            >
              1. TERRENO E PISO
            </button>
            <div className="flow-arrow">→</div>
            <button 
              className={`flow-btn ${activeStage === 'WALL' ? 'active' : ''}`}
              onClick={() => setActiveStage('WALL')}
            >
              2. PAREDE
            </button>
            <div className="flow-arrow">→</div>
            <button 
              className={`flow-btn ${activeStage === 'ELECTRICAL' ? 'active' : ''}`}
              onClick={() => setActiveStage('ELECTRICAL')}
            >
              3. ELÉTRICA
            </button>
          </div>

          <div style={{ flex: 1 }}></div>

          <div className="global-nav-tools">
            <button 
              className={`nav-tool-btn ${controller.selectedTool === 'select' ? 'active' : ''}`}
              onClick={() => controller.chooseTool('select')}
              title="Seleção (V)"
            >
              ↗
            </button>
            <button 
              className={`nav-tool-btn ${controller.selectedTool === 'pan' ? 'active' : ''}`}
              onClick={() => controller.chooseTool('pan')}
              title="Panorâmica (H)"
            >
              ✋
            </button>
            <div className="nav-divider"></div>
            <button className="nav-tool-btn" onClick={() => controller.adjustZoom(0.1)} title="Zoom In">+</button>
            <div className="zoom-display">{formatZoom(controller.zoomLevel)}</div>
            <button className="nav-tool-btn" onClick={() => controller.adjustZoom(-0.1)} title="Zoom Out">-</button>
            <div className="nav-divider"></div>
            <button className="nav-tool-btn" onClick={() => console.log('Zoom Extend')} title="Zoom Extent">⤧</button>
            <button className="nav-tool-btn" onClick={() => console.log('Zoom to Selection')} title="Zoom Selected">🔍</button>
          </div>
        </nav>

        <main 
          className={`designer-workspace ${rightCollapsed ? 'right-collapsed' : ''}`}
          style={{ gridTemplateColumns: gridColumns }}
        >
          <section className="canvas-wrapper-modern">
            <DesignerToolbar
              activeStage={activeStage}
              selectedTool={controller.selectedTool}
              onChooseTool={controller.chooseTool}
              isReady={readiness.ready}
              readinessMessage={readiness.message}
            />

            <Suspense fallback={<div className="canvas-loading">Carregando Ambiente...</div>}>
              <FabricProjectCanvas
                project={project}
                selectedTool={controller.selectedTool}
                selection={controller.selection}
                zoomLevel={controller.zoomLevel}
                onUpdateItem={controller.updateItem}
                onUpdateNode={controller.updateNode}
                onUpdateLink={controller.updateLink}
                onUpdateSitePoint={controller.updateSitePoint}
                onDelete={controller.deleteCanvasObject}
                onCreateObject={controller.createCanvasObject}
                onSelect={controller.setSelection}
                snapToGrid={controller.canvasSettings.snapToGrid}
                onCopy={controller.copySelection}
                onPaste={controller.pasteSelection}
                onMouseMoveCoords={(x, y) => setMouseCoords({ x, y })}
              />
            </Suspense>

            {showGuide && (
              <div className="canvas-controls-guide glass-panel size-xs show-animation">
                <p><strong>Comandos:</strong></p>
                <ul>
                  <li><span>Click</span> Inserir / Selecionar</li>
                  <li><span>Click + Click</span> Encadear Paredes</li>
                  <li><span>Right Click</span> Propriedades</li>
                  <li><span>Alt + Drag</span> Panorâmica (Pan)</li>
                  <li><span>Wheel</span> Zoom</li>
                </ul>
              </div>
            )}
          </section>

          {!rightCollapsed && (
            <div className={`resize-handle-v ${isResizing ? 'active' : ''}`} onMouseDown={startResizing}></div>
          )}

          <DesignerPropertiesPanel
            selectedTool={controller.selectedTool}
            selection={controller.selection}
            isCollapsed={rightCollapsed}
            validation={controller.validation}
            calculation={controller.calculation}
            items={project.canvas.items}
            nodes={project.canvas.nodes}
            links={project.canvas.links}
            onUpdateItem={controller.updateItem}
            onUpdateNode={controller.updateNode}
            onUpdateLink={controller.updateLink}
            onUpdateSettings={controller.updateSettings}
            onDelete={controller.deleteCanvasObject}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
            onSelect={controller.setSelection}
            onConvertToPolygon={controller.convertToPolygon}
            onUpdateSitePoint={controller.updateSitePoint}
            canvasSettings={project.canvas.settings || { visualGrid: true, snapToGrid: true, unit: 'm', scale: 1, precision: 2, angleFormat: 'DD' }}
          />
        </main>

        {/* AutoCAD-style Status Bar */}
        <footer className="designer-status-bar">
          <div className="status-left">
            <div className="coord-display">
              <span className="coord-label">X:</span> {formatMeters(mouseCoords.x)} 
              <span className="coord-label" style={{ marginLeft: '8px' }}>Y:</span> {formatMeters(mouseCoords.y)}
            </div>
            <div className="status-divider"></div>
            <button 
              className={`autocad-btn ${controller.canvasSettings.visualGrid ? 'active' : ''}`}
              onClick={() => controller.updateSettings({ visualGrid: !controller.canvasSettings.visualGrid })}
              title="Grid (F7)"
            >
              ▦ GRID
            </button>
            <button 
              className={`autocad-btn ${controller.canvasSettings.snapToGrid ? 'active' : ''}`}
              onClick={() => controller.updateSettings({ snapToGrid: !controller.canvasSettings.snapToGrid })}
              title="Snap (F9)"
            >
              🧲 SNAP
            </button>
            <div className="status-divider"></div>
            <button 
              className={`autocad-btn ${controller.canUndo ? '' : 'disabled'}`}
              onClick={controller.undo}
              title="Desfazer (Ctrl+Z)"
            >
              ⟲ UNDO
            </button>
            <button 
              className={`autocad-btn ${controller.canRedo ? '' : 'disabled'}`}
              onClick={controller.redo}
              title="Refazer (Ctrl+Y)"
            >
              ⟳ REDO
            </button>
            <div className="status-divider"></div>
            <button 
              className={`autocad-btn ${showGuide ? 'active' : ''}`}
              onClick={() => setShowGuide(!showGuide)}
              title="Guia de Comandos"
            >
              ⌨️ HELP
            </button>
          </div>
          
          <div className="status-right">
             <span className="status-info">GRID: 24px</span>
             <div className="status-divider"></div>
             <span className="status-info uppercase">Unit: {controller.canvasSettings.unit}</span>
             <div className="status-divider"></div>
             <span className="status-info">SCALE: 1:{controller.canvasSettings.scale}</span>
             <div className="status-divider"></div>
             <span className="status-info">NBR 5410</span>
             <div className="status-divider"></div>
             <button 
              className={`autocad-btn ${rightCollapsed ? 'active' : ''}`}
              onClick={() => setRightCollapsed(!rightCollapsed)}
              title="Alternar Painel de Propriedades"
            >
              PROPS {rightCollapsed ? '«' : '»'}
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
