import { lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DesignerPropertiesPanel } from './DesignerPropertiesPanel';
import { DesignerToolbar } from './DesignerToolbar';
import { useProjectCanvasController } from './useProjectCanvasController';
import './projetador.css';

const FabricProjectCanvas = lazy(() => import('./FabricProjectCanvas').then((module) => ({ default: module.FabricProjectCanvas })));

export function ProjetadorFeature({ hideHeader = false }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id ?? '';
  const controller = useProjectCanvasController(projectId);
  const { project } = controller;

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

  return (
    <section className="designer-page page-transition">
      <div className="designer-layout-container">
        {!hideHeader && (
          <header className="designer-topbar glass-panel">
            <div className="topbar-left">
              <button className="ghost circle-btn" onClick={() => navigate(`/projetos/${project.id}`)} title="Voltar">
                ←
              </button>
              <div className="project-id-block">
                <p className="eyebrow">Terminal Projetador</p>
                <h1>{project.name}</h1>
              </div>
            </div>
            
            <div className="topbar-right">
              <div className="meta-info size-xs muted">
                  <span>{project.voltage}</span>
                  <span>{project.source}</span>
              </div>
              <button className="button" onClick={() => controller.createCanvasObject(controller.selectedTool, 240, 180)}>
                  Inserir {controller.selectedTool}
              </button>
            </div>
          </header>
        )}

        <main className="designer-workspace">
          <DesignerToolbar
            stage={controller.designerStage}
            tools={controller.availableTools}
            selectedTool={controller.selectedTool}
            onChooseTool={controller.chooseTool}
          />

          <section className="canvas-wrapper-modern glass-panel">
            <Suspense fallback={<div className="canvas-loading-state center">Sincronizando Canvas...</div>}>
              <FabricProjectCanvas
                items={project.canvas.items}
                walls={project.canvas.walls}
                selectedTool={controller.selectedTool}
                selection={controller.selection}
                onCreateItem={controller.createCanvasObject}
                onSelect={controller.setSelection}
                onUpdateItem={controller.updateItem}
                onUpdateWall={controller.updateWall}
                onRotate={controller.rotateSelection}
                onResize={controller.resizeSelection}
                onDelete={controller.deleteCanvasObject}
              />
            </Suspense>
          </section>

          <DesignerPropertiesPanel
            selectedTool={controller.selectedTool}
            selectedItem={controller.selectedCanvasItem}
            selectedWall={controller.selectedCanvasWall}
            selection={controller.selection}
            validation={controller.validation}
            calculation={controller.calculation}
            onUpdateItem={controller.updateItem}
            onUpdateWall={controller.updateWall}
            onDelete={controller.deleteCanvasObject}
          />
        </main>
      </div>
    </section>
  );
}
