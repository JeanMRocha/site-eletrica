import type { ResidentialProject } from '../../../domain/residential-projects';

type ProjectListProps = {
  projects: ResidentialProject[];
  navigate: (path: string) => void;
  search: string;
  setSearch: (val: string) => void;
  isSearchVisible: boolean;
  setIsSearchVisible: (val: boolean) => void;
};

export function ProjectList({ 
  projects, 
  navigate, 
  search, 
  setSearch, 
  isSearchVisible, 
  setIsSearchVisible 
}: ProjectListProps) {
  return (
    <section className="projects-page page-transition">
      <article className="panel projects-panel glass-panel">
        <div className="panel-head row middle gap-md">
          <h1 style={{ whiteSpace: 'nowrap' }}>Base de Projetos</h1>
          
          <div className="row middle flex-1" style={{ justifyContent: 'flex-end', gap: '12px' }}>
            {isSearchVisible && (
              <input 
                className="modern-input animate-slide-left"
                style={{ maxWidth: '300px', height: '36px' }}
                autoFocus
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Pesquisar projetos..." 
              />
            )}

            <button 
              className={`action-btn-wizard ${isSearchVisible ? 'active' : ''}`} 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              title="Pesquisar"
            >
              🔍
            </button>
            <button className="button" type="button" onClick={() => navigate('/projetos/novo')}>
              Novo Projeto
            </button>
          </div>
        </div>

        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Projeto / Cliente</th>
                <th>Localização</th>
                <th>Configuração</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="center muted" style={{ padding: '40px' }}>
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              ) : (
                projects.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="stack tight">
                        <strong>{item.name}</strong>
                        <span className="muted size-xs">{item.clientName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stack tight">
                        <span className="size-xs">{item.street ? `${item.street}, ${item.number || 's/n'}` : item.address}</span>
                        <span className="muted size-2xs">{item.city || 'Cidade não informada'} - {item.state}</span>
                      </div>
                    </td>
                    <td>
                      <div className="row tight wrap">
                         <span className="badge info">{item.voltage}</span>
                         <span className="badge neutral">{houseTypeLabel(item.houseType)}</span>
                      </div>
                    </td>
                    <td><span className="badge success">Em Aberto</span></td>
                    <td className="right">
                      <div className="row tight">
                        <button 
                          className="action-btn-wizard accent-btn" 
                          onClick={() => navigate(`/projetos/${item.id}/editar`)}
                          title="Editar Projeto"
                        >
                          ✎
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
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
