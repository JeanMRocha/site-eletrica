import type { AssessmentRecord, HierarchyLevel, Project } from '../../types';
import { sortHierarchy, statusClass, statusLabel } from '../../lib/presentation';
import type { ProjectSectionKey, TabKey } from '../../navigation';
import './home.css';

type HomeDashboardProps = {
  projects: Project[];
  hierarchy: HierarchyLevel[];
  latestAssessment: AssessmentRecord | null;
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenProjectSection: (section: ProjectSectionKey) => void;
  onOpenTab: (tab: TabKey) => void;
};

export function HomeDashboard({
  projects,
  hierarchy,
  latestAssessment,
  selectedProjectId,
  onSelectProject,
  onOpenProjectSection,
  onOpenTab,
}: HomeDashboardProps) {
  const orderedHierarchy = sortHierarchy(hierarchy);
  const latestProjects = projects.slice(0, 3);

  return (
    <section className="dashboard-grid home-feature">
      <article className="panel">
        <div className="panel-head">
          <div className="panel-icon" aria-hidden="true">
            ◉
          </div>
          <button className="ghost icon-only" type="button" onClick={() => onOpenProjectSection('client')} title="Cliente">
            ◉
          </button>
        </div>
        <div className="list">
          {latestProjects.length === 0 ? (
            <div className="item">
              <strong>—</strong>
            </div>
          ) : (
            latestProjects.map((project) => (
              <button
                key={project.id}
                className={`item selectable ${project.id === selectedProjectId ? 'selected' : ''}`}
                onClick={() => {
                  onSelectProject(project.id);
                  onOpenProjectSection('client');
                }}
                type="button"
                title={project.name}
              >
                <div className="row">
                  <div>
                    <strong>{project.name}</strong>
                    <p className="muted">
                      {project.city} / {project.state}
                    </p>
                  </div>
                  <span className="badge neutral">Cliente</span>
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div className="panel-icon" aria-hidden="true">
            ≋
          </div>
          <button className="ghost icon-only" type="button" onClick={() => onOpenTab('standards')} title="Normas">
            ≋
          </button>
        </div>
        <div className="stack">
          {orderedHierarchy.map((level) => (
            <div key={level.id} className="mini-card">
              <div className="row">
                <strong>{level.id}</strong>
                <span>{level.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div className="panel-icon" aria-hidden="true">
            ☑
          </div>
          <button className="ghost icon-only" type="button" onClick={() => onOpenProjectSection('conformity')} title="Conformidade">
            ☑
          </button>
        </div>
        {latestAssessment ? (
          <div className="verdict-card">
            <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>
              {statusLabel(latestAssessment.verdict.status)}
            </span>
            <div className="meta">
              <span>Regras: {latestAssessment.verdict.rules_applied.length}</span>
              <span>Severidade: {latestAssessment.verdict.severity}</span>
            </div>
          </div>
        ) : (
          <div className="item">
            <strong>—</strong>
          </div>
        )}
      </article>
    </section>
  );
}
