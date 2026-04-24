import type { FormEvent } from 'react';
import type { AssessmentInput, AssessmentRecord, ProjectDetail, Standard } from '../../types';
import { assessmentsCount, formatDate, statusClass, statusLabel } from '../../lib/presentation';
import type { IbgeCity, IbgeState } from '../../domain/ibge';
import type { CircuitItem, EnvironmentItem, LoadItem, ProjectForm, ProjectWorkspace as ProjectWorkspaceData } from '../../domain/workspace';
import { projectSections, type ProjectSectionKey } from '../../navigation';
import { EmptyDash, MiniBars, MiniRing, MiniSpark, MetricCard } from '../shared/MiniVisuals';
import { ModalShell } from '../shared/ModalShell';
import { ProjectTab } from './ProjectFeature';
import './project.css';

type ProjectWorkspaceProps = {
  detail: ProjectDetail | null;
  form: ProjectForm;
  savingProject: boolean;
  projectWorkspace: ProjectWorkspaceData;
  assessmentForm: AssessmentInput;
  standards: Standard[];
  latestAssessment: AssessmentRecord | null;
  savingAssessment: boolean;
  editingProjectId: string;
  modalSection: ProjectSectionKey | null;
  ibgeStates: IbgeState[];
  ibgeCities: IbgeCity[];
  loadingIbge: boolean;
  geoError: string;
  activeSection: ProjectSectionKey;
  onOpenEditor: () => void;
  onChangeForm: (updater: (current: ProjectForm) => ProjectForm) => void;
  onSubmitProject: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteProject: () => void;
  onStartNewProject: () => void;
  onCloseEditorModal: () => void;
  onCloseStageModal: () => void;
  onOpenModal: (section: ProjectSectionKey) => void;
  onAddDrawing: (event: FormEvent<HTMLFormElement>) => void;
  onAddEnvironment: (event: FormEvent<HTMLFormElement>) => void;
  onAddLoad: (event: FormEvent<HTMLFormElement>) => void;
  onAddCircuit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeAssessment: (updater: (current: AssessmentInput) => AssessmentInput) => void;
  onSubmitAssessment: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSelectSection: (section: ProjectSectionKey) => void;
};

export function ProjectWorkspace({
  detail,
  form,
  savingProject,
  projectWorkspace,
  assessmentForm,
  standards,
  latestAssessment,
  savingAssessment,
  editingProjectId,
  modalSection,
  ibgeStates,
  ibgeCities,
  loadingIbge,
  geoError,
  activeSection,
  onOpenEditor,
  onChangeForm,
  onSubmitProject,
  onDeleteProject,
  onStartNewProject,
  onCloseEditorModal,
  onCloseStageModal,
  onOpenModal,
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
      <ProjectTab
        detail={detail}
        form={form}
        saving={savingProject}
        editingProjectId={editingProjectId}
        modalSection={modalSection}
        states={ibgeStates}
        cities={ibgeCities}
        loadingGeo={loadingIbge}
        geoError={geoError}
        onOpenEditor={onOpenEditor}
        onChangeForm={onChangeForm}
        onSubmit={onSubmitProject}
        onDeleteProject={onDeleteProject}
        onStartNewProject={onStartNewProject}
        onCloseModal={onCloseEditorModal}
      />

      <div className="workspace-open">
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
                <strong>{detail ? `${detail.study.city} / ${detail.study.state}` : 'Sem local definido'}</strong>
              </div>
            </div>
          </article>
        </aside>

        <div className="stage-area">
          {activeSection === 'client' ? (
            <ClientOverview
              detail={detail}
              projectWorkspace={projectWorkspace}
              latestAssessment={latestAssessment}
              onOpenDrawing={() => onOpenModal('drawing')}
              onOpenArea={() => onOpenModal('area')}
              onOpenModeling={() => onOpenModal('modeling')}
              onOpenCalculation={() => onOpenModal('calculation')}
            />
          ) : null}
          {activeSection === 'drawing' ? <DrawingSummary projectWorkspace={projectWorkspace} canEdit={Boolean(detail)} onOpenModal={() => onOpenModal('drawing')} /> : null}
          {activeSection === 'area' ? <AreaSummary projectWorkspace={projectWorkspace} canEdit={Boolean(detail)} onOpenModal={() => onOpenModal('area')} /> : null}
          {activeSection === 'modeling' ? <ModelingSummary projectWorkspace={projectWorkspace} canEdit={Boolean(detail)} onOpenModal={() => onOpenModal('modeling')} /> : null}
          {activeSection === 'calculation' ? (
            <CalculationSummary
              assessmentForm={assessmentForm}
              standards={standards}
              detail={detail}
              latestAssessment={latestAssessment}
              canEdit={Boolean(detail)}
              onOpenModal={() => onOpenModal('calculation')}
            />
          ) : null}
          {activeSection === 'conformity' ? <ConformitySummary latestAssessment={latestAssessment} /> : null}
        </div>
      </div>

      <DrawingModal open={modalSection === 'drawing'} projectWorkspace={projectWorkspace} onClose={onCloseStageModal} onAddDrawing={onAddDrawing} />
      <AreaModal open={modalSection === 'area'} projectWorkspace={projectWorkspace} onClose={onCloseStageModal} onAddEnvironment={onAddEnvironment} />
      <ModelingModal open={modalSection === 'modeling'} projectWorkspace={projectWorkspace} onClose={onCloseStageModal} onAddLoad={onAddLoad} onAddCircuit={onAddCircuit} />
      <CalculationModal
        open={modalSection === 'calculation'}
        assessmentForm={assessmentForm}
        detail={detail}
        latestAssessment={latestAssessment}
        saving={savingAssessment}
        standards={standards}
        onClose={onCloseStageModal}
        onChangeAssessment={onChangeAssessment}
        onSubmit={onSubmitAssessment}
      />
    </section>
  );
}

function ClientOverview({
  detail,
  projectWorkspace,
  latestAssessment,
  onOpenDrawing,
  onOpenArea,
  onOpenModeling,
  onOpenCalculation,
}: {
  detail: ProjectDetail | null;
  projectWorkspace: ProjectWorkspaceData;
  latestAssessment: AssessmentRecord | null;
  onOpenDrawing: () => void;
  onOpenArea: () => void;
  onOpenModeling: () => void;
  onOpenCalculation: () => void;
}) {
  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Cliente</p>
          <h2>Resumo mínimo</h2>
        </div>
      </div>

      {detail ? (
        <div className="summary-strip">
          <div className="mini-card">
            <span>Nome</span>
            <strong>{detail.study.name}</strong>
          </div>
          <div className="mini-card">
            <span>Local</span>
            <strong>
              {detail.study.city} / {detail.study.state}
            </strong>
          </div>
          <div className="mini-card">
            <span>Atualizado</span>
            <strong>{formatDate(detail.study.updated_at)}</strong>
          </div>
        </div>
      ) : (
        <EmptyDash label="Selecione um cliente na home para liberar as etapas" />
      )}

      <div className="grid-two">
        <button className="panel quick-step" type="button" onClick={onOpenDrawing} disabled={!detail}>
          <strong>Desenho</strong>
          <span>{projectWorkspace.drawings.length} pranchas</span>
        </button>
        <button className="panel quick-step" type="button" onClick={onOpenArea} disabled={!detail}>
          <strong>Área</strong>
          <span>{projectWorkspace.environments.length} ambientes</span>
        </button>
        <button className="panel quick-step" type="button" onClick={onOpenModeling} disabled={!detail}>
          <strong>Modelagem</strong>
          <span>
            {projectWorkspace.loads.length} cargas e {projectWorkspace.circuits.length} circuitos
          </span>
        </button>
        <button className="panel quick-step" type="button" onClick={onOpenCalculation} disabled={!detail}>
          <strong>Cálculo</strong>
          <span>{latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Sem resultado'}</span>
        </button>
      </div>
    </article>
  );
}

function DrawingSummary({ projectWorkspace, canEdit, onOpenModal }: { projectWorkspace: ProjectWorkspaceData; canEdit: boolean; onOpenModal: () => void }) {
  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Projeto</p>
          <h2>Desenho</h2>
        </div>
        <button className="button" type="button" onClick={onOpenModal} disabled={!canEdit}>
          Editar desenho
        </button>
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

      {projectWorkspace.drawings.length === 0 ? (
        <EmptyDash label="Abra o modal para registrar a primeira prancha" />
      ) : (
        <div className="stack">
          {projectWorkspace.drawings.slice(0, 4).map((drawing) => (
            <article key={drawing.id} className="mini-card">
              <strong>{drawing.title}</strong>
              <span>{drawing.scale || 'Escala não informada'}</span>
              <p className="muted">{drawing.notes || 'Sem observações'}</p>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}

function AreaSummary({ projectWorkspace, canEdit, onOpenModal }: { projectWorkspace: ProjectWorkspaceData; canEdit: boolean; onOpenModal: () => void }) {
  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Projeto</p>
          <h2>Área</h2>
        </div>
        <button className="button" type="button" onClick={onOpenModal} disabled={!canEdit}>
          Editar área
        </button>
      </div>

      <div className="summary-strip">
        <div className="mini-card">
          <span>Ambientes</span>
          <strong>{projectWorkspace.environments.length}</strong>
        </div>
        <div className="mini-card">
          <span>Última distância</span>
          <strong>{projectWorkspace.environments[0]?.distance || 'N/D'}</strong>
        </div>
      </div>

      <div className="card-grid">
        {projectWorkspace.environments.length === 0 ? (
          <EmptyDash label="Abra o modal para cadastrar ambientes" />
        ) : (
          projectWorkspace.environments.slice(0, 4).map((environment) => <EnvironmentCard key={environment.id} environment={environment} />)
        )}
      </div>
    </article>
  );
}

function ModelingSummary({ projectWorkspace, canEdit, onOpenModal }: { projectWorkspace: ProjectWorkspaceData; canEdit: boolean; onOpenModal: () => void }) {
  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Projeto</p>
          <h2>Modelagem</h2>
        </div>
        <button className="button" type="button" onClick={onOpenModal} disabled={!canEdit}>
          Editar modelagem
        </button>
      </div>

      <div className="metric-grid">
        <MetricCard label="Cargas" value={projectWorkspace.loads.length} caption="Itens" chart={<MiniBars values={[projectWorkspace.loads.length, projectWorkspace.circuits.length, projectWorkspace.environments.length]} />} />
        <MetricCard label="Circuitos" value={projectWorkspace.circuits.length} caption="Traçados" chart={<MiniSpark values={[projectWorkspace.loads.length, projectWorkspace.circuits.length, projectWorkspace.environments.length]} />} />
      </div>

      <div className="grid-two">
        <div className="panel soft-panel">
          <p className="eyebrow">Cargas</p>
          {projectWorkspace.loads.length === 0 ? (
            <EmptyDash label="Nenhuma carga cadastrada" />
          ) : (
            <div className="stack">
              {projectWorkspace.loads.slice(0, 4).map((load) => (
                <LoadCard key={load.id} load={load} />
              ))}
            </div>
          )}
        </div>
        <div className="panel soft-panel">
          <p className="eyebrow">Circuitos</p>
          {projectWorkspace.circuits.length === 0 ? (
            <EmptyDash label="Nenhum circuito cadastrado" />
          ) : (
            <div className="stack">
              {projectWorkspace.circuits.slice(0, 4).map((circuit) => (
                <CircuitCard key={circuit.id} circuit={circuit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CalculationSummary({
  assessmentForm,
  standards,
  detail,
  latestAssessment,
  canEdit,
  onOpenModal,
}: {
  assessmentForm: AssessmentInput;
  standards: Standard[];
  detail: ProjectDetail | null;
  latestAssessment: AssessmentRecord | null;
  canEdit: boolean;
  onOpenModal: () => void;
}) {
  const inputValues = [
    assessmentForm.current_project_a,
    assessmentForm.conductor_mm2,
    assessmentForm.breaker_a,
    assessmentForm.voltage_drop_percent,
  ].map((value) => Math.max(1, Number.isFinite(value) ? value : 0));
  const loadScore = Math.min(100, Math.round((assessmentForm.current_project_a + assessmentForm.breaker_a) / 2));
  const ruleCount = latestAssessment?.verdict.rules_applied.length ?? 0;
  const reviewScore = latestAssessment?.verdict.requires_human_review ? 100 : Math.min(100, Math.max(16, ruleCount * 18));

  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Consolidação</p>
          <h2>Dimensionamento</h2>
        </div>
        <button className="button" type="button" onClick={onOpenModal} disabled={!canEdit}>
          Editar cálculo
        </button>
      </div>

      <div className="metric-grid">
        <MetricCard label="Norma" value={standards.length} caption={assessmentForm.standard_code} chart={<MiniBars values={inputValues} />} />
        <MetricCard label="Circuito" value={assessmentsCount(detail?.assessments)} caption={assessmentForm.circuit_id} chart={<MiniSpark values={inputValues} />} />
        <MetricCard label="Carga" value={Math.round(assessmentForm.current_project_a)} caption="A" chart={<MiniRing value={loadScore} />} />
      </div>

      <div className="calculation-slab">
        <div className="calculation-slab-copy">
          <p className="eyebrow">Entrada rápida</p>
          <h3>Fluxo resumido antes do cálculo</h3>
          <p className="muted">Os campos ficam dentro do modal, para manter a página principal limpa.</p>
        </div>
        <MiniBars values={inputValues} />
      </div>

      {latestAssessment ? (
        <div className="result-visual">
          <MiniRing value={reviewScore} />
          <div className="stack tight">
            <strong>{latestAssessment.verdict.standard_name}</strong>
            <p className="muted">
              {latestAssessment.verdict.standard_code} · {formatDate(latestAssessment.created_at)}
            </p>
            <div className="meta">
              <span>{latestAssessment.verdict.rules_applied.length} regras</span>
              <span>{latestAssessment.verdict.severity}</span>
              <span>{latestAssessment.verdict.requires_human_review ? 'Revisão' : 'Automático'}</span>
            </div>
          </div>
          <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
        </div>
      ) : (
        <EmptyDash label="Nenhum cálculo executado ainda" />
      )}
    </article>
  );
}

function ConformitySummary({ latestAssessment }: { latestAssessment: AssessmentRecord | null }) {
  return (
    <article className="panel stage-summary">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Conformidade</p>
          <h2>Veredito final</h2>
        </div>
      </div>

      {latestAssessment ? (
        <div className="stack">
          <div className="result-visual">
            <MiniRing value={latestAssessment.verdict.requires_human_review ? 100 : 72} />
            <div className="stack tight">
              <strong>{latestAssessment.verdict.standard_name}</strong>
              <p className="muted">
                {latestAssessment.verdict.standard_code} · {formatDate(latestAssessment.created_at)}
              </p>
            </div>
            <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
          </div>
          <MiniSpark values={latestAssessment.verdict.rules_applied.map((rule) => rule.hierarchy_weight).slice(0, 6)} />
        </div>
      ) : (
        <EmptyDash label="Sem avaliação disponível" />
      )}
    </article>
  );
}

function DrawingModal({
  open,
  projectWorkspace,
  onClose,
  onAddDrawing,
}: {
  open: boolean;
  projectWorkspace: ProjectWorkspaceData;
  onClose: () => void;
  onAddDrawing: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalShell open={open} title="Editar desenho" subtitle={`${projectWorkspace.drawings.length} desenhos registrados`} className="compact" onClose={onClose}>
      <div className="summary-strip">
        <div className="mini-card">
          <span>Desenhos</span>
          <strong>{projectWorkspace.drawings.length}</strong>
        </div>
        <div className="mini-card">
          <span>Status</span>
          <strong>Em construção</strong>
        </div>
      </div>

      <form onSubmit={onAddDrawing} className="stack">
        <div className="form-grid three">
          <label>
            <span>Título</span>
            <input name="drawing_title" placeholder="Título da prancha" />
          </label>
          <label>
            <span>Escala</span>
            <input name="drawing_scale" placeholder="Escala" />
          </label>
          <label>
            <span>Notas</span>
            <input name="drawing_notes" placeholder="Observações" />
          </label>
        </div>
        <button className="button" type="submit">
          Adicionar desenho
        </button>
      </form>
    </ModalShell>
  );
}

function AreaModal({
  open,
  projectWorkspace,
  onClose,
  onAddEnvironment,
}: {
  open: boolean;
  projectWorkspace: ProjectWorkspaceData;
  onClose: () => void;
  onAddEnvironment: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalShell open={open} title="Editar área" subtitle={`${projectWorkspace.environments.length} ambientes cadastrados`} className="compact" onClose={onClose}>
      <form onSubmit={onAddEnvironment} className="stack">
        <div className="form-grid three">
          <label>
            <span>Nome</span>
            <input name="env_name" placeholder="Nome" />
          </label>
          <label>
            <span>Área</span>
            <input name="env_area" placeholder="Área" />
          </label>
          <label>
            <span>Uso</span>
            <input name="env_usage" placeholder="Uso" />
          </label>
        </div>
        <label>
          <span>Distância</span>
          <input name="env_distance" placeholder="Distância" />
        </label>
        <button className="button" type="submit">
          Adicionar ambiente
        </button>
      </form>
    </ModalShell>
  );
}

function ModelingModal({
  open,
  projectWorkspace,
  onClose,
  onAddLoad,
  onAddCircuit,
}: {
  open: boolean;
  projectWorkspace: ProjectWorkspaceData;
  onClose: () => void;
  onAddLoad: (event: FormEvent<HTMLFormElement>) => void;
  onAddCircuit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalShell open={open} title="Editar modelagem" subtitle={`${projectWorkspace.loads.length} cargas e ${projectWorkspace.circuits.length} circuitos`} onClose={onClose}>
      <div className="grid-two">
        <form onSubmit={onAddLoad} className="panel soft-panel">
          <p className="eyebrow">Carga</p>
          <div className="form-grid three">
            <label>
              <span>Nome</span>
              <input name="load_name" placeholder="Nome" />
            </label>
            <label>
              <span>Categoria</span>
              <input name="load_category" placeholder="Categoria" />
            </label>
            <label>
              <span>Potência</span>
              <input name="load_power" placeholder="Potência" />
            </label>
          </div>
          <label>
            <span>Quantidade</span>
            <input name="load_quantity" placeholder="Quantidade" />
          </label>
          <button className="button" type="submit">
            Adicionar carga
          </button>
        </form>

        <form onSubmit={onAddCircuit} className="panel soft-panel">
          <p className="eyebrow">Circuito</p>
          <div className="form-grid three">
            <label>
              <span>Nome</span>
              <input name="circuit_name" placeholder="Nome" />
            </label>
            <label>
              <span>Ambiente</span>
              <input name="circuit_environment" placeholder="Ambiente" />
            </label>
            <label>
              <span>Disjuntor</span>
              <input name="circuit_breaker" placeholder="Disjuntor" />
            </label>
          </div>
          <label>
            <span>Condutor</span>
            <input name="circuit_conductor" placeholder="Condutor" />
          </label>
          <button className="button" type="submit">
            Adicionar circuito
          </button>
        </form>
      </div>
    </ModalShell>
  );
}

function CalculationModal({
  open,
  assessmentForm,
  detail,
  latestAssessment,
  saving,
  standards,
  onClose,
  onChangeAssessment,
  onSubmit,
}: {
  open: boolean;
  assessmentForm: AssessmentInput;
  detail: ProjectDetail | null;
  latestAssessment: AssessmentRecord | null;
  saving: boolean;
  standards: Standard[];
  onClose: () => void;
  onChangeAssessment: (updater: (current: AssessmentInput) => AssessmentInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <ModalShell open={open} title="Editar cálculo" subtitle={detail ? detail.study.name : 'Sem cliente selecionado'} onClose={onClose}>
      <form onSubmit={onSubmit} className="stack">
        <div className="form-grid three">
          <label>
            <span>Circuito</span>
            <input value={assessmentForm.circuit_id} onChange={(event) => onChangeAssessment((current) => ({ ...current, circuit_id: event.target.value }))} />
          </label>
          <label>
            <span>Norma</span>
            <select value={assessmentForm.standard_code} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_code: event.target.value }))}>
              {standards.map((standard) => (
                <option key={standard.code} value={standard.code}>
                  {standard.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Versão</span>
            <input value={assessmentForm.standard_version} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_version: event.target.value }))} />
          </label>
        </div>
        <div className="form-grid three">
          <label>
            <span>Corrente</span>
            <input type="number" step="0.1" value={assessmentForm.current_project_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, current_project_a: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Condutor</span>
            <input type="number" step="0.1" value={assessmentForm.conductor_mm2} onChange={(event) => onChangeAssessment((current) => ({ ...current, conductor_mm2: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Disjuntor</span>
            <input type="number" step="0.1" value={assessmentForm.breaker_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, breaker_a: Number(event.target.value) }))} />
          </label>
        </div>
        <div className="form-grid three">
          <label>
            <span>Queda</span>
            <input type="number" step="0.1" value={assessmentForm.voltage_drop_percent} onChange={(event) => onChangeAssessment((current) => ({ ...current, voltage_drop_percent: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Método</span>
            <input value={assessmentForm.installation_method} onChange={(event) => onChangeAssessment((current) => ({ ...current, installation_method: event.target.value }))} />
          </label>
          <label>
            <span>Ambiente</span>
            <input value={assessmentForm.environment_type} onChange={(event) => onChangeAssessment((current) => ({ ...current, environment_type: event.target.value }))} />
          </label>
        </div>
        <div className="popover-actions">
          <button className="button" disabled={saving} type="submit">
            {saving ? 'Calculando...' : 'Executar cálculo'}
          </button>
          {latestAssessment ? <span className="badge neutral">{statusLabel(latestAssessment.verdict.status)}</span> : null}
        </div>
      </form>
    </ModalShell>
  );
}

function EnvironmentCard({ environment }: { environment: EnvironmentItem }) {
  return (
    <article className="mini-card tall visual-card">
      <div className="row">
        <strong>{environment.name}</strong>
        <span className="badge neutral">{environment.usage || 'Ambiente'}</span>
      </div>
      <MiniSpark values={[environment.name.length, environment.area.length, environment.usage.length, environment.distance.length]} />
      <div className="meta">
        <span>{environment.area || 'área'}</span>
        <span>{environment.distance || 'distância'}</span>
      </div>
    </article>
  );
}

function LoadCard({ load }: { load: LoadItem }) {
  return (
    <article className="item visual-item">
      <div className="row">
        <div>
          <strong>{load.name}</strong>
          <p className="muted">{load.category}</p>
        </div>
        <span className="badge neutral">{load.power}</span>
      </div>
      <MiniBars values={[load.name.length, load.category.length, load.power.length, load.quantity.length]} />
    </article>
  );
}

function CircuitCard({ circuit }: { circuit: CircuitItem }) {
  return (
    <article className="item visual-item">
      <div className="row">
        <div>
          <strong>{circuit.name}</strong>
          <p className="muted">{circuit.environment}</p>
        </div>
        <span className="badge neutral">{circuit.breaker}</span>
      </div>
      <MiniSpark values={[circuit.name.length, circuit.environment.length, circuit.breaker.length, circuit.conductor.length]} />
    </article>
  );
}
