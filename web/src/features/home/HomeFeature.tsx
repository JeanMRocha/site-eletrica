import type { AssessmentRecord, HierarchyLevel, Project } from '../../types';
import { sortHierarchy, statusClass, statusLabel } from '../../lib/presentation';
import type { ProjectSectionKey } from '../../navigation';
import { EmptyDash, MetricCard, MiniBars, MiniRing, MiniSpark } from '../shared/MiniVisuals';
import './home.css';

type HomeDashboardProps = {
  projects: Project[];
  hierarchy: HierarchyLevel[];
  latestAssessment: AssessmentRecord | null;
  projectCount: number;
  standardCount: number;
  verdictCount: number;
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenProjectSection: (section: ProjectSectionKey) => void;
};

export function HomeDashboard({
  projects,
  hierarchy,
  latestAssessment,
  projectCount,
  standardCount,
  verdictCount,
  selectedProjectId,
  onSelectProject,
  onOpenProjectSection,
}: HomeDashboardProps) {
  const orderedHierarchy = sortHierarchy(hierarchy);
  const latestProjects = projects.slice(0, 4);
  const hierarchyValues = orderedHierarchy.map((level) => level.weight);
  const projectValues = latestProjects.map((_, index) => Math.max(2, latestProjects.length - index));
  const verdictScore = latestAssessment ? scoreVerdict(latestAssessment.verdict.severity) : 0;
  const maxHierarchy = Math.max(...hierarchyValues, 1);

  return (
    <section className="dashboard-grid home-feature">
      <article className="panel hero-panel">
        <div>
          <p className="eyebrow">Painel inicial</p>
          <h1>Dashboard elétrico</h1>
        </div>
        <button className="button" type="button" onClick={() => onOpenProjectSection('client')}>
          Abrir cliente
        </button>
      </article>

      <article className="panel metric-panel">
        <MetricCard label="Projetos" value={projectCount} caption="Base ativa" chart={<MiniBars values={projectValues} />} />
      </article>

      <article className="panel metric-panel">
        <MetricCard label="Normas" value={standardCount} caption="Catálogo" chart={<MiniBars values={hierarchyValues} />} />
      </article>

      <article className="panel metric-panel">
        <MetricCard
          label="Conformidade"
          value={verdictCount}
          caption={latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Sem veredito'}
          chart={<MiniRing value={latestAssessment ? verdictScore : 0} />}
        />
      </article>

      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Projetos recentes</p>
            <h2>Últimos clientes</h2>
          </div>
        </div>
        <div className="chart-shell">
          {latestProjects.length === 0 ? (
            <EmptyDash label="Sem clientes recentes" />
          ) : (
            latestProjects.map((project) => (
              <button
                key={project.id}
                className={`dash-row selectable ${project.id === selectedProjectId ? 'selected' : ''}`}
                onClick={() => {
                  onSelectProject(project.id);
                  onOpenProjectSection('client');
                }}
                type="button"
                title={project.name}
              >
                <div className="dash-row-top">
                  <strong>{project.name}</strong>
                  <span className="badge neutral">Cliente</span>
                </div>
                <MiniSpark values={[2, 4, 3, 5, 4, 6]} />
                <div className="dash-row-bottom">
                  <span className="muted">
                    {project.city} / {project.state}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Normas</p>
            <h2>Precedência</h2>
          </div>
        </div>
        <div className="chart-shell">
          {orderedHierarchy.length === 0 ? (
            <EmptyDash label="Sem catálogo" />
          ) : (
            orderedHierarchy.map((level) => (
              <div key={level.id} className="dash-bar">
                <div className="dash-bar-head">
                  <span>{level.id}</span>
                  <strong>{level.weight}</strong>
                </div>
                <div className="dash-bar-track">
                  <div className="dash-bar-fill" style={{ width: `${Math.max(22, (level.weight / maxHierarchy) * 100)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Veredito</p>
            <h2>Última conformidade</h2>
          </div>
        </div>
        {latestAssessment ? (
          <div className="dash-split">
            <div className="verdict-card compact">
              <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
              <strong>{latestAssessment.verdict.standard_name}</strong>
              <MiniRing value={verdictScore} />
            </div>
            <div className="stack tight">
              {latestAssessment.verdict.rules_applied.slice(0, 4).map((rule) => (
                <div key={rule.rule_id} className="mini-card subtle">
                  <strong>{rule.rule_id}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyDash label="Sem veredito" />
        )}
      </article>
    </section>
  );
}

function scoreVerdict(severity: string) {
  switch (severity.toLowerCase()) {
    case 'alta':
      return 25;
    case 'media':
      return 60;
    case 'baixa':
      return 85;
    default:
      return 50;
  }
}
