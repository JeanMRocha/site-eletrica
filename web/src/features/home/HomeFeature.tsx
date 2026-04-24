import { useMemo, useState } from 'react';
import type { AssessmentRecord, HierarchyLevel, Project } from '../../types';
import { formatDate, sortHierarchy, statusClass, statusLabel } from '../../lib/presentation';
import { EmptyDash, MetricCard, MiniBars, MiniRing } from '../shared/MiniVisuals';
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
  onEditProject: (id: string) => void;
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
  onEditProject,
}: HomeDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  const orderedHierarchy = sortHierarchy(hierarchy);
  const latestProjects = projects.slice(0, 4);
  const hierarchyValues = orderedHierarchy.map((level) => level.weight);
  const projectValues = latestProjects.map((_, index) => Math.max(2, latestProjects.length - index));
  const verdictScore = latestAssessment ? scoreVerdict(latestAssessment.verdict.severity) : 0;
  const maxHierarchy = Math.max(...hierarchyValues, 1);
  const availableStates = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.state).filter(Boolean))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [projects],
  );
  const filteredProjects = useMemo(() => {
    const query = normalize(searchTerm);

    return projects.filter((project) => {
      const matchesQuery =
        query.length === 0 ||
        [project.name, project.city, project.state, project.location]
          .filter(Boolean)
          .some((value) => normalize(String(value)).includes(query));
      const matchesState = stateFilter === 'all' || project.state === stateFilter;
      return matchesQuery && matchesState;
    });
  }, [projects, searchTerm, stateFilter]);

  function resetFilters() {
    setSearchTerm('');
    setStateFilter('all');
  }

  return (
    <section className="dashboard-grid home-feature">
      <article className="panel hero-panel">
        <div>
          <p className="eyebrow">Painel inicial</p>
          <h1>Busca de clientes</h1>
          <p className="muted">Encontre clientes por nome, cidade ou estado. Cadastro e edição ficam na tela específica do cliente.</p>
        </div>
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

      <article className="panel wide-panel home-search-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Clientes</p>
            <h2>Pesquisar e filtrar</h2>
          </div>
        </div>
        <div className="home-searchbar">
          <label className="search-field">
            <span>Buscar cliente</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nome, cidade ou estado"
              type="search"
            />
          </label>

          <label className="search-field state-field">
            <span>Estado</span>
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="all">Todos os estados</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <button className="ghost" type="button" onClick={resetFilters}>
            Limpar
          </button>
        </div>

        <div className="home-results-meta">
          <span>
            {filteredProjects.length} de {projects.length} clientes
          </span>
        </div>

        <div className="home-results">
          {projects.length === 0 ? (
            <EmptyDash label="Sem clientes cadastrados" />
          ) : filteredProjects.length === 0 ? (
            <EmptyDash label="Nenhum cliente encontrado" />
          ) : (
            filteredProjects.map((project) => (
              <article
                key={project.id}
                className={`client-result ${project.id === selectedProjectId ? 'selected' : ''}`}
                title={project.name}
              >
                <div className="client-result-main">
                  <div>
                    <strong>{project.name}</strong>
                    <span className="muted">
                      {project.city} / {project.state}
                    </span>
                  </div>
                  <span className="badge neutral">Abrir ficha</span>
                </div>
                <div className="client-result-meta">
                  <span>Criado {formatDate(project.created_at)}</span>
                  <span>Atualizado {formatDate(project.updated_at)}</span>
                </div>
                <div className="row-actions">
                  <button className="ghost" type="button" onClick={() => onSelectProject(project.id)}>
                    Ver
                  </button>
                  <button className="button" type="button" onClick={() => onEditProject(project.id)}>
                    Editar
                  </button>
                </div>
              </article>
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

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
