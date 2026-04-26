import { useProjetos } from './useProjetos';
import type { ResidentialProject, HouseType, NetworkSource } from '../../domain/residential-projects';
import { SkeletonRow } from '../shared/Skeleton';
import { ProjetadorFeature } from '../projetador/ProjetadorFeature';
import './projetos.css';

export function ProjetosFeature() {
  const {
    mode,
    visibleProjects,
    clients,
    project,
    form,
    setForm,
    envForm,
    setEnvForm,
    loading,
    saving,
    search,
    setSearch,
    isSearchVisible,
    setIsSearchVisible,
    handleFormSubmit,
    handleDelete,
    handleAddEnvironment,
    navigate,
    step,
    handleTabChange,
  } = useProjetos();

  if (loading) return <LoadingView />;

  if (mode === 'list') {
    return (
      <ProjectList 
        projects={visibleProjects} 
        navigate={navigate} 
        search={search} 
        setSearch={setSearch} 
        isSearchVisible={isSearchVisible}
        setIsSearchVisible={setIsSearchVisible}
      />
    );
  }

  // Unified view for Create, Edit, Detail, Designer
  return (
    <ProjectManager
      mode={mode}
      project={project}
      form={form}
      setForm={setForm}
      clients={clients}
      envForm={envForm}
      setEnvForm={setEnvForm}
      onAddEnv={handleAddEnvironment}
      onDelete={handleDelete}
      onSubmit={handleFormSubmit}
      saving={saving}
      step={step}
      setStep={handleTabChange}
      navigate={navigate}
    />
  );
}

// --- Sub-Components ---

function LoadingView() {
  return (
    <section className="projects-page page-transition">
      <article className="panel projects-panel glass-panel">
        <div className="panel-head">
           <SkeletonRow count={1} />
        </div>
        <SkeletonRow count={5} />
      </article>
    </section>
  );
}

function ProjectList({ projects, navigate, search, setSearch, isSearchVisible, setIsSearchVisible }: any) {
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
                projects.map((item: ResidentialProject) => (
                  <tr key={item.id}>
                    <td>
                      <div className="stack tight">
                        <strong>{item.name}</strong>
                        <span className="muted size-xs">{item.clientName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stack tight">
                        <span className="size-xs">{item.address || 'Local não informado'}</span>
                        {item.zipCode && <span className="muted size-2xs">CEP: {item.zipCode}</span>}
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

function ProjectManager({ mode, project, form, setForm, clients, envForm, setEnvForm, onAddEnv, onDelete, onSubmit, saving, step, setStep, navigate }: any) {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isDetail = mode === 'detail';
  const isDesigner = mode === 'designer';

  const toggleSource = (key: NetworkSource) => {
    const current = form.source as NetworkSource[];
    const next = current.includes(key) 
      ? current.filter(k => k !== key) 
      : [...current, key];
    setForm((curr: any) => ({ ...curr, source: next }));
  };

  return (
    <section className="projects-page page-transition">
      <div className="chrome-tabs-row row spread">
        <div className="chrome-tabs-container">
          <button className={`chrome-tab ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)} type="button">
            Identificação
          </button>
          <button className={`chrome-tab ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)} type="button">
            Localização
          </button>
          {!isCreate && (
            <button className={`chrome-tab ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)} type="button">
              Ambientes
            </button>
          )}
          {!isCreate && (
             <button className={`chrome-tab ${step === 4 ? 'active' : ''}`} onClick={() => setStep(4)} type="button">
               Projeto Técnico
             </button>
          )}
        </div>

        <div className="wizard-quick-actions row">
          {step > 1 && !isDesigner && (
            <button className="action-btn-wizard" type="button" onClick={() => setStep(step - 1)} title="Voltar">
              ←
            </button>
          )}
          
          {(isCreate || isEdit) ? (
             <button className="action-btn-wizard primary" type="button" onClick={() => onSubmit()} disabled={saving} title="Salvar Projeto">
                {saving ? '...' : '💾'}
             </button>
          ) : !isDesigner && (
            <button className="action-btn-wizard accent-btn" type="button" onClick={() => navigate(`/projetos/${project?.id}/editar`)} title="Editar Dados">
               ✎
            </button>
          )}

          {!isCreate && !isDesigner && (
            <button className="action-btn-wizard danger-btn" type="button" onClick={onDelete} disabled={saving} title="Excluir Projeto">
              🗑️
            </button>
          )}

          <button className="action-btn-wizard" type="button" onClick={() => navigate('/projetos')} title="Fechar">
            ✕
          </button>

          {step < (isCreate ? 2 : (isDesigner ? 4 : 3)) && !isDesigner && (
            <button className="action-btn-wizard accent-btn" type="button" onClick={() => setStep(step + 1)} title="Próximo">
              →
            </button>
          )}
          
          {isDetail && (
            <button className="action-btn-wizard primary" type="button" onClick={() => setStep(4)} title="Abrir Projetador">
               ⚡
            </button>
          )}
        </div>
      </div>

      <article className={`projects-panel-wizard glass-panel ${isDesigner ? 'designer-tab-active' : ''}`}>
        {!isDesigner && (
          <header className="panel-head-wizard">
            <p className="eyebrow">{isCreate ? 'Novo Projeto' : isEdit ? 'Edição Técnica' : 'Consolidação'}</p>
            <h1>{step === 1 ? 'Engenharia e Cliente' : step === 2 ? 'Endereço da Instalação' : 'Carga e Ambientes'}</h1>
          </header>
        )}

        <div className="manager-content">
          {(isCreate || isEdit) ? (
            <ProjectForm 
              step={step} 
              form={form} 
              setForm={setForm} 
              clients={clients} 
              toggleSource={toggleSource} 
              envForm={envForm}
              setEnvForm={setEnvForm}
              onAddEnv={onAddEnv}
              project={project}
            />
          ) : isDesigner ? (
            <div className="designer-embedded animate-fade-in">
               <ProjetadorFeature hideHeader />
            </div>
          ) : (
            <ProjectDisplay 
              step={step} 
              project={project} 
              envForm={envForm}
              setEnvForm={setEnvForm}
              onAddEnv={onAddEnv}
            />
          )}
        </div>
      </article>
    </section>
  );
}

function ProjectForm({ step, form, setForm, clients, toggleSource, envForm, setEnvForm, onAddEnv, project }: any) {
  if (step === 1) {
    return (
      <div className="stack lg animate-fade-in">
        <div className="form-group-rounded">
          <div className="input-block">
            <label>Identificação do Projeto</label>
            <input 
              className="modern-input"
              value={form.name} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, name: e.target.value }))} 
              placeholder="Ex: Instalação Residencial - Bloco A"
              required
            />
          </div>
          <div className="input-block">
            <label>Cliente Proprietário</label>
            <select
              className="modern-select"
              value={form.clientId}
              onChange={(e) => {
                const client = clients.find((c: any) => c.id === e.target.value);
                setForm((curr: any) => ({ ...curr, clientId: e.target.value, clientName: client?.name ?? '' }));
              }}
              required
            >
              <option value="">Selecione o Cliente</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group-rounded">
          <div className="input-block">
            <label>Tensão Nominal</label>
            <select className="modern-select" value={form.voltage} onChange={(e) => setForm((curr: any) => ({ ...curr, voltage: e.target.value }))}>
              <option value="127V">127V</option>
              <option value="220V">220V</option>
              <option value="127/220V">127/220V</option>
            </select>
          </div>
          <div className="input-block">
            <label>Tipologia</label>
            <select className="modern-select" value={form.houseType} onChange={(e) => setForm((curr: any) => ({ ...curr, houseType: e.target.value as HouseType }))}>
              <option value="padrao">Padrão</option>
              <option value="terrea">Térrea</option>
              <option value="sobrado">Sobrado</option>
              <option value="geminada">Geminada</option>
            </select>
          </div>
        </div>

        <div className="input-block">
          <label>Fontes de Energia</label>
          <div className="source-checkbox-group row wrap">
             {['rede', 'solar', 'gerador'].map((s: any) => (
               <label key={s} className={`source-check-card ${form.source.includes(s) ? 'active' : ''}`}>
                  <input type="checkbox" checked={form.source.includes(s)} onChange={() => toggleSource(s)} />
                  <span className="icon">{s === 'rede' ? '⚡' : s === 'solar' ? '☼' : '⚙'}</span>
                  <strong>{s.charAt(0).toUpperCase() + s.slice(1)}</strong>
               </label>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="stack lg animate-fade-in">
        <div className="form-group-rounded">
          <div className="input-block">
            <label>CEP / Localização</label>
            <input className="modern-input" value={form.zipCode} onChange={(e) => setForm((curr: any) => ({ ...curr, zipCode: e.target.value }))} placeholder="00000-000" />
          </div>
          <div className="input-block">
            <label>Endereço Completo</label>
            <input className="modern-input" value={form.address} onChange={(e) => setForm((curr: any) => ({ ...curr, address: e.target.value }))} placeholder="Rua, Número, Bairro..." />
          </div>
        </div>
        <div className="mini-canvas-preview-modern glass-panel center">
           <div className="canvas-placeholder-icon">✎</div>
           <p className="muted size-sm">Mapa de carga será definido no projetador.</p>
        </div>
      </div>
    );
  }

  return <EnvironmentTab project={project} envForm={envForm} setEnvForm={setEnvForm} onAddEnv={onAddEnv} />;
}

function ProjectDisplay({ step, project }: any) {
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
         <h2 style={{ margin: '12px 0' }}>{project?.address || 'Não informado'}</h2>
         {project?.zipCode && <p className="muted">CEP: {project.zipCode}</p>}
      </div>
    );
  }

  return <EnvironmentTab project={project} />;
}

function EnvironmentTab({ project, envForm, setEnvForm, onAddEnv }: any) {
  return (
    <div className="stack lg animate-fade-in">
       {onAddEnv && (
         <form className="add-env-inline row glass-panel" onSubmit={onAddEnv} style={{ padding: '16px' }}>
            <div className="row flex-1" style={{ gap: '12px' }}>
              <input 
                className="modern-input" 
                placeholder="Nome do Cômodo" 
                value={envForm.name} 
                onChange={e => setEnvForm((c: any) => ({...c, name: e.target.value}))} 
                required 
              />
              <input 
                className="modern-input" 
                type="number" 
                placeholder="m²" 
                style={{ width: '100px' }}
                value={envForm.areaM2 || ''} 
                onChange={e => setEnvForm((c: any) => ({...c, areaM2: e.target.value}))} 
              />
            </div>
            <button className="button" type="submit">Adicionar</button>
         </form>
       )}

       <div className="env-list-modern grid">
          {!project?.environments || project.environments.length === 0 ? (
            <p className="muted center" style={{ padding: '40px' }}>Nenhum ambiente registrado ainda.</p>
          ) : (
            project.environments.map((env: any) => (
              <div key={env.id} className="env-card-modern glass-panel row spread middle">
                <div className="stack tight">
                  <strong>{env.name}</strong>
                  <span className="muted size-xs">{env.areaM2}m² de área calculada</span>
                </div>
                <div className="badge info">PRONTO</div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

// --- Helpers ---

function houseTypeLabel(value: HouseType) {
  const labels: Record<string, string> = {
    padrao: 'Padrão',
    terrea: 'Térrea',
    sobrado: 'Sobrado',
    geminada: 'Geminada'
  };
  return labels[value] || value;
}

function sourceLabel(sources: NetworkSource[]) {
  if (!sources || sources.length === 0) return 'Nenhuma';
  if (sources.length > 1) return `Mista (${sources.map(s => s === 'rede' ? 'Rede' : s === 'solar' ? 'Solar' : 'Gerador').join(' + ')})`;
  const s = sources[0];
  return s === 'rede' ? 'Rede' : s === 'solar' ? 'Solar' : 'Gerador';
}
