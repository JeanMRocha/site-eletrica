import type { AssessmentRecord, HierarchyLevel, Project, Standard } from '../../types';
import { formatDate, sortHierarchy, sortStandards, statusClass, statusLabel } from '../../lib/presentation';
import type { TabKey } from '../../navigation';
import './home.css';

type HomeDashboardProps = {
  projects: Project[];
  standards: Standard[];
  hierarchy: HierarchyLevel[];
  latestAssessment: AssessmentRecord | null;
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenTab: (tab: TabKey) => void;
};

export function HomeDashboard({
  projects,
  standards,
  hierarchy,
  latestAssessment,
  selectedProjectId,
  onSelectProject,
  onOpenTab,
}: HomeDashboardProps) {
  const orderedHierarchy = sortHierarchy(hierarchy);
  const orderedStandards = sortStandards(standards);
  const latestProjects = projects.slice(0, 3);

  return (
    <section className="dashboard-grid home-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Resumo</p>
            <h2>Últimos projetos</h2>
          </div>
          <button className="ghost" type="button" onClick={() => onOpenTab('project')}>
            Abrir lista
          </button>
        </div>
        <div className="list">
          {latestProjects.length === 0 ? (
            <div className="item">
              <strong>Nenhum projeto ainda.</strong>
              <p className="muted">Crie o primeiro para iniciar a consolidação.</p>
            </div>
          ) : (
            latestProjects.map((project) => (
              <button
                key={project.id}
                className={`item selectable ${project.id === selectedProjectId ? 'selected' : ''}`}
                onClick={() => {
                  onSelectProject(project.id);
                  onOpenTab('project');
                }}
                type="button"
              >
                <div className="row">
                  <div>
                    <strong>{project.name}</strong>
                    <p className="muted">
                      {project.client_name} · {project.location}
                    </p>
                  </div>
                  <span className="badge neutral">{project.project_type}</span>
                </div>
                <div className="meta">
                  <span>{project.voltage}</span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Normas</p>
            <h2>Conferência rápida</h2>
          </div>
          <button className="ghost" type="button" onClick={() => onOpenTab('standards')}>
            Ver catálogo
          </button>
        </div>
        <div className="stack">
          {orderedHierarchy.map((level) => (
            <div key={level.id} className="mini-card">
              <div className="row">
                <strong>{level.id}</strong>
                <span>{level.weight}</span>
              </div>
              <p className="muted">
                {orderedStandards.filter((standard) => standard.hierarchy_weight === level.weight).length} norma(s) nesta camada
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Conformidade</p>
            <h2>Último veredito</h2>
          </div>
          <button className="ghost" type="button" onClick={() => onOpenTab('conformity')}>
            Conferir
          </button>
        </div>
        {latestAssessment ? (
          <div className="verdict-card">
            <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>
              {statusLabel(latestAssessment.verdict.status)}
            </span>
            <strong>{latestAssessment.verdict.standard_name}</strong>
            <p className="muted">
              {latestAssessment.verdict.standard_code} · {latestAssessment.verdict.standard_version}
            </p>
            <div className="meta">
              <span>Regras: {latestAssessment.verdict.rules_applied.length}</span>
              <span>Severidade: {latestAssessment.verdict.severity}</span>
            </div>
          </div>
        ) : (
          <div className="item">
            <strong>Sem veredito ainda.</strong>
            <p className="muted">Execute um cálculo para gerar o resumo.</p>
          </div>
        )}
      </article>
    </section>
  );
}
