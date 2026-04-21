import type { FormEvent } from 'react';
import type { AssessmentInput, AssessmentRecord, Project, ProjectDetail, Standard } from '../../types';
import type { ProjectForm, ProjectWorkspace as ProjectWorkspaceData } from '../../domain/workspace';
import { CalculationTab } from '../calculation/CalculationFeature';
import { ConformityTab } from '../conformity/ConformityFeature';
import { ModelingTab } from '../modeling/ModelingFeature';
import { ProjectTab } from './ProjectFeature';
import { projectSections, type ProjectSectionKey } from '../../navigation';
import type { IbgeCity, IbgeState } from '../../domain/ibge';

type ProjectWorkspaceProps = {
  projects: Project[];
  selectedProjectId: string;
  detail: ProjectDetail | null;
  form: ProjectForm;
  savingProject: boolean;
  projectWorkspace: ProjectWorkspaceData;
  assessmentForm: AssessmentInput;
  standards: Standard[];
  latestAssessment: AssessmentRecord | null;
  savingAssessment: boolean;
  editingProjectId: string;
  ibgeStates: IbgeState[];
  ibgeCities: IbgeCity[];
  loadingIbge: boolean;
  geoError: string;
  activeSection: ProjectSectionKey;
  onSelectProject: (id: string) => void;
  onChangeForm: (updater: (current: ProjectForm) => ProjectForm) => void;
  onSubmitProject: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteProject: () => void;
  onStartNewProject: () => void;
  onAddDrawing: (event: FormEvent<HTMLFormElement>) => void;
  onAddEnvironment: (event: FormEvent<HTMLFormElement>) => void;
  onAddLoad: (event: FormEvent<HTMLFormElement>) => void;
  onAddCircuit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeAssessment: (updater: (current: AssessmentInput) => AssessmentInput) => void;
  onSubmitAssessment: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSelectSection: (section: ProjectSectionKey) => void;
};

export function ProjectWorkspace({
  projects,
  selectedProjectId,
  detail,
  form,
  savingProject,
  projectWorkspace,
  assessmentForm,
  standards,
  latestAssessment,
  savingAssessment,
  editingProjectId,
  ibgeStates,
  ibgeCities,
  loadingIbge,
  geoError,
  activeSection,
  onSelectProject,
  onChangeForm,
  onSubmitProject,
  onDeleteProject,
  onStartNewProject,
  onAddDrawing,
  onAddEnvironment,
  onAddLoad,
  onAddCircuit,
  onChangeAssessment,
  onSubmitAssessment,
  onSelectSection,
}: ProjectWorkspaceProps) {
  return (
    <section className="workspace project-workspace">
      <aside className="sidebar">
        <article className="panel compact">
          <div className="panel-head slim">
            <div>
              <p className="eyebrow">Menu do projeto</p>
              <h2>Etapas internas</h2>
            </div>
          </div>

          <div className="stack tight">
            {projectSections.map((section) => (
              <button
                key={section.key}
                className={`stage-row ${activeSection === section.key ? 'active' : ''}`}
                onClick={() => onSelectSection(section.key)}
                type="button"
              >
                <div className="row">
                  <strong>
                    <span aria-hidden="true">{section.icon}</span> {section.label}
                  </strong>
                </div>
                <span className="muted">{section.hint}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel compact">
          <div className="panel-head slim">
            <div>
              <p className="eyebrow">Projeto atual</p>
              <h3>{detail?.study.name ?? 'Nenhum selecionado'}</h3>
            </div>
          </div>
          <div className="stack tight">
            <div className="mini-card">
              <span>Cliente</span>
              <strong>{detail?.study.name ?? 'Selecione um cliente'}</strong>
            </div>
            <div className="mini-card">
              <span>Local</span>
              <strong>
                {detail ? `${detail.study.city} / ${detail.study.state}` : 'Sem local definido'}
              </strong>
            </div>
          </div>
        </article>
      </aside>

      <div className="stage-area">
        {activeSection === 'client' ? (
          <ProjectTab
            projects={projects}
            selectedProjectId={selectedProjectId}
            detail={detail}
            form={form}
            saving={savingProject}
            editingProjectId={editingProjectId}
            states={ibgeStates}
            cities={ibgeCities}
            loadingGeo={loadingIbge}
            geoError={geoError}
            onSelectProject={onSelectProject}
            onChangeForm={onChangeForm}
            onSubmit={onSubmitProject}
            onDeleteProject={onDeleteProject}
            onStartNewProject={onStartNewProject}
          />
        ) : null}

        {activeSection === 'drawing' ? (
          <DrawingStage projectWorkspace={projectWorkspace} onAddDrawing={onAddDrawing} />
        ) : null}

        {activeSection === 'area' || activeSection === 'modeling' ? (
          <ModelingTab projectWorkspace={projectWorkspace} onAddEnvironment={onAddEnvironment} onAddLoad={onAddLoad} onAddCircuit={onAddCircuit} />
        ) : null}

        {activeSection === 'calculation' ? (
          <CalculationTab
            assessmentForm={assessmentForm}
            standards={standards}
            detail={detail}
            latestAssessment={latestAssessment}
            saving={savingAssessment}
            onChangeAssessment={onChangeAssessment}
            onSubmit={onSubmitAssessment}
          />
        ) : null}

        {activeSection === 'conformity' ? <ConformityTab latestAssessment={latestAssessment} /> : null}
      </div>
    </section>
  );
}

function DrawingStage({
  projectWorkspace,
  onAddDrawing,
}: {
  projectWorkspace: ProjectWorkspaceData;
  onAddDrawing: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Projeto</p>
          <h2>Desenho</h2>
        </div>
      </div>

      <div className="summary-strip">
        <div className="mini-card">
          <span>Desenhos</span>
          <strong>{projectWorkspace.drawings.length}</strong>
        </div>
        <div className="mini-card">
          <span>Vinculados ao cliente</span>
          <strong>Sim</strong>
        </div>
        <div className="mini-card">
          <span>Status</span>
          <strong>Em construção</strong>
        </div>
      </div>

      <details className="details-box">
        <summary>Registrar desenho</summary>
        <form onSubmit={onAddDrawing}>
          <div className="form-grid three">
            <label>
              <input name="drawing_title" placeholder="Título da prancha" />
            </label>
            <label>
              <input name="drawing_scale" placeholder="Escala" />
            </label>
            <label>
              <input name="drawing_notes" placeholder="Observações" />
            </label>
          </div>
          <button className="button" type="submit">
            Adicionar desenho
          </button>
        </form>
      </details>

      <div className="stack">
        {projectWorkspace.drawings.length === 0 ? (
          <div className="item">
            <strong>Sem desenhos registrados.</strong>
            <p className="muted">Crie a primeira prancha para este cliente.</p>
          </div>
        ) : (
          projectWorkspace.drawings.map((drawing) => (
            <article key={drawing.id} className="mini-card">
              <strong>{drawing.title}</strong>
              <span>{drawing.scale || 'Escala não informada'}</span>
              <span>{drawing.notes || 'Sem observações'}</span>
            </article>
          ))
        )}
      </div>
    </article>
  );
}
