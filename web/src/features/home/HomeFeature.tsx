import { useMemo, useState } from 'react';
import type { AssessmentRecord, HierarchyLevel, Project } from '../../types';
import { formatDate, sortHierarchy, statusLabel } from '../../lib/presentation';
import { EmptyDash, MetricCard, MiniBars, MiniRing } from '../shared/MiniVisuals';
import './home.css';

type HomeDashboardProps = {
  projects: Project[];
  hierarchy: HierarchyLevel[];
  latestAssessment: AssessmentRecord | null;
  projectCount: number;
  standardCount: number;
  verdictCount: number;
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
  onSelectProject,
  onEditProject,
}: HomeDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  const orderedHierarchy = sortHierarchy(hierarchy);
  const hierarchyValues = orderedHierarchy.map((level) => level.weight);
  const verdictScore = latestAssessment ? scoreVerdict(latestAssessment.verdict.severity) : 0;
  
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

  return (
    <div className="home-feature page-transition">
      <header className="panel hero-panel compact-hero">
        <div className="hero-content">
          <p className="eyebrow">Sistema Central</p>
          <h1>Cockpit de Comando</h1>
          <p className="muted size-sm">Gestão integrada de projetos e conformidade normativa.</p>
        </div>
      </header>

      <article className="metric-panel">
        <MetricCard 
          label="Estudos" 
          value={projectCount} 
          caption="Ativos" 
          chart={<MiniBars values={[10, 15, 8, 20, 12]} />} 
        />
      </article>

      <article className="metric-panel">
        <MetricCard 
          label="Catálogo" 
          value={standardCount} 
          caption="Normas" 
          chart={<MiniBars values={hierarchyValues} />} 
        />
      </article>

      <article className="metric-panel">
        <MetricCard
          label="Compliance"
          value={verdictCount}
          caption={latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Aguardando'}
          chart={<MiniRing value={latestAssessment ? verdictScore : 0} />}
        />
      </article>

      <section className="panel home-search-panel">
        <div className="list-header">
          <div>
            <p className="eyebrow">Base de Clientes</p>
            <h2>Explorador de Projetos</h2>
          </div>
          <div className="row">
            <span className="muted">{filteredProjects.length} resultados</span>
          </div>
        </div>

        <div className="home-searchbar">
          <label className="search-field">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Pesquisar por nome..."
              type="search"
            />
          </label>

          <label className="state-field">
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="all">Estados</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="home-results stack tight">
          {projects.length === 0 ? (
            <EmptyDash label="Sem clientes" />
          ) : filteredProjects.length === 0 ? (
            <EmptyDash label="Sem resultados" />
          ) : (
            filteredProjects.map((project) => (
              <article key={project.id} className="client-row-modern">
                <div className="client-info">
                  <strong>{project.name}</strong>
                  <span>{project.city} / {project.state}</span>
                </div>
                <div className="client-stats">
                   <div className="stack tight">
                     <span className="eyebrow">Atualizado</span>
                     <span className="size-xs">{formatDate(project.updated_at)}</span>
                   </div>
                </div>
                <div className="badge neutral">Estágio 1</div>
                <div className="row-actions">
                  <button className="ghost" onClick={() => onSelectProject(project.id)}>Ver</button>
                  <button className="button" onClick={() => onEditProject(project.id)}>Edit</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function scoreVerdict(severity: string) {
  switch (severity.toLowerCase()) {
    case 'alta': return 25;
    case 'media': return 60;
    case 'baixa': return 85;
    default: return 50;
  }
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
