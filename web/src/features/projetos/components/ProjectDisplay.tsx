import type { ResidentialProject } from '../../../domain/residential-projects';

type ProjectDisplayProps = {
  step: number;
  project: ResidentialProject;
};

export function ProjectDisplay({ step, project }: ProjectDisplayProps) {
  if (step === 1) {
    return (
      <div className="detail-header-grid animate-fade-in">
        <article className="info-block">
          <span className="muted size-xs">Proprietário</span>
          <strong>{project?.clientName}</strong>
        </article>
        <article className="info-block">
          <span className="muted size-xs">Configuração Elétrica</span>
          <strong>{project?.voltage} · {sourceLabel(project?.source)}</strong>
        </article>
        <article className="info-block">
          <span className="muted size-xs">Tipologia</span>
          <strong>{project?.houseType ? houseTypeLabel(project.houseType) : 'N/A'}</strong>
        </article>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
         <span className="muted size-xs uppercase bold">Endereço de Instalação</span>
         <h2 style={{ margin: '12px 0' }}>{project?.street}, {project?.number || 's/n'}</h2>
         <p className="size-md">{project?.district} - {project?.city} / {project?.state}</p>
         {project?.zipCode && <p className="muted size-sm" style={{ marginTop: '8px' }}>CEP: {project.zipCode}</p>}
         {project?.complement && <p className="muted size-xs italic" style={{ marginTop: '8px' }}>{project.complement}</p>}
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in stack middle center" style={{ padding: '64px', borderStyle: 'dashed', opacity: 0.5 }}>
       <span className="icon" style={{ fontSize: '2rem', marginBottom: '16px' }}>📐</span>
       <p>O Projeto Técnico deve ser visualizado no Projetador.</p>
    </div>
  );
}

function houseTypeLabel(value: string) {
  const labels: Record<string, string> = {
    padrao: 'Padrão',
    terrea: 'Térrea',
    sobrado: 'Sobrado',
    geminada: 'Geminada'
  };
  return labels[value] || value;
}

function sourceLabel(sources: string[]) {
  if (!sources || sources.length === 0) return 'Nenhuma';
  if (sources.length > 1) return `Mista (${sources.map(s => s === 'rede' ? 'Rede' : s === 'solar' ? 'Solar' : 'Gerador').join(' + ')})`;
  const s = sources[0];
  return s === 'rede' ? 'Rede' : s === 'solar' ? 'Solar' : 'Gerador';
}
