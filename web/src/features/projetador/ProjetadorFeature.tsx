import { lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DesignerPropertiesPanel } from './DesignerPropertiesPanel';
import { DesignerToolbar } from './DesignerToolbar';
import { useProjectCanvasController } from './useProjectCanvasController';
import './projetador.css';

const FabricProjectCanvas = lazy(() => import('./FabricProjectCanvas').then((module) => ({ default: module.FabricProjectCanvas })));

export function ProjetadorFeature() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id ?? '';
  const controller = useProjectCanvasController(projectId);
  const { project } = controller;

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
            <button className="button" type="button" onClick={() => controller.createCanvasObject(controller.selectedTool, 240, 180)}>
              Inserir
            </button>
          </div>
        </div>

        <div className="designer-grid">
          <DesignerToolbar
            stage={controller.designerStage}
            tools={controller.availableTools}
            selectedTool={controller.selectedTool}
            onChooseTool={controller.chooseTool}
          />

          <Suspense fallback={<div className="fabric-canvas-shell loading">Carregando canvas...</div>}>
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
        </div>
      </article>
    </section>
  );
}
