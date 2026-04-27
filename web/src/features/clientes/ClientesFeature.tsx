import { formatDate } from '../../lib/presentation';
import { SkeletonRow } from '../shared/Skeleton';
import { useClientes, type ClienteStep } from './useClientes';
import './clientes.css';

const clientSteps: Array<{ key: ClienteStep; label: string; hint: string }> = [
  { key: 'dados', label: 'Dados Básicos', hint: 'Identificação e Local' },
  { key: 'contato', label: 'Contato', hint: 'E-mail e Telefones' },
  { key: 'endereco', label: 'Endereço', hint: 'Logradouro completo' },
];

export function ClientesFeature() {
  const {
    visibleProjects,
    detail,
    loading,
    saving,
    search,
    setSearch,
    isSearchVisible,
    setIsSearchVisible,
    draft,
    activeStep,
    setActiveStep,
    states,
    cities,
    loadingGeo,
    mode,
    clientId,
    handleDraftChange,
    handleSubmit,
    handleDelete,
    navigate,
  } = useClientes();

  const pageTitle = titleByMode(mode);

  if (mode === 'create' || mode === 'edit') {
    return (
      <section className="clients-page page-transition">
        <div className="chrome-tabs-row row spread">
          <div className="chrome-tabs-container">
            {clientSteps.map((step) => (
              <button
                key={step.key}
                className={`chrome-tab ${activeStep === step.key ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveStep(step.key)}
              >
                {step.label}
              </button>
            ))}
          </div>

          <div className="wizard-quick-actions row">
            {activeStep !== 'dados' && (
              <button className="action-btn-wizard" type="button" onClick={() => setActiveStep(previousStep(activeStep))} title="Anterior">
                ←
              </button>
            )}
            
            <button 
              className="action-btn-wizard primary" 
              type="button" 
              onClick={() => handleSubmit()}
              disabled={saving}
              title="Salvar Cliente"
            >
              {saving ? '...' : '💾'}
            </button>

            {mode === 'edit' && clientId && (
              <button 
                className="action-btn-wizard danger-btn" 
                type="button" 
                onClick={handleDelete}
                disabled={saving}
                title="Excluir Cliente"
              >
                🗑️
              </button>
            )}

            <button className="action-btn-wizard" type="button" onClick={() => navigate('/clientes')} title="Cancelar">
              ✕
            </button>

            {activeStep !== 'endereco' && (
              <button className="action-btn-wizard accent-btn" type="button" onClick={() => setActiveStep(nextStep(activeStep))} title="Próximo">
                →
              </button>
            )}
          </div>
        </div>

        <article className="clients-panel-wizard glass-panel">
          <header className="panel-head-wizard">
            <p className="eyebrow">{mode === 'edit' ? 'Gestão de Cadastro' : 'Novo Registro'}</p>
            <h1>{activeStep === 'dados' ? 'Identificação do Cliente' : activeStep === 'contato' ? 'Dados de Contato' : 'Localização do Cliente'}</h1>
          </header>

          <form className="client-form-body" onSubmit={handleSubmit}>
            {activeStep === 'dados' && (
              <div className="stack lg animate-fade-in">
                <div className="form-group-rounded">
                  <div className="input-block">
                    <label>Nome do Cliente / Razão Social</label>
                    <input 
                      className="modern-input"
                      value={draft.name} 
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, name: e.target.value }))} 
                      placeholder="Ex: João Silva ou Empresa Ltda"
                      required
                    />
                  </div>
                  <div className="input-block">
                    <label>CEP</label>
                    <input 
                      className="modern-input"
                      value={draft.zip || ''} 
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, zip: maskCep(e.target.value) }))} 
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>
                <div className="form-group-rounded">
                  <div className="input-block">
                    <label>Estado (UF)</label>
                    <select
                      className="modern-select"
                      value={draft.state}
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, state: e.target.value, city: '' }))}
                    >
                      <option value="">Selecione</option>
                      {states.map((s: any) => <option key={s.sigla} value={s.sigla}>{s.nome} ({s.sigla})</option>)}
                    </select>
                  </div>
                  <div className="input-block">
                    <label>Cidade</label>
                    <select 
                      className="modern-select"
                      value={draft.city} 
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, city: e.target.value }))} 
                      disabled={!draft.state || loadingGeo}
                    >
                      <option value="">{loadingGeo ? 'Buscando...' : 'Selecione o estado'}</option>
                      {cities.map((c: any) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 'contato' && (
              <div className="stack lg animate-fade-in">
                <div className="form-group-rounded">
                  <div className="input-block">
                    <label>Nome do Responsável</label>
                    <input 
                      className="modern-input" 
                      value={draft.contact_name || ''} 
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, contact_name: e.target.value }))} 
                      placeholder="Nome de quem atende"
                    />
                  </div>
                  <div className="input-block">
                    <label>E-mail Principal</label>
                    <input 
                      className={`modern-input ${draft.contact_email && !validateEmail(draft.contact_email) ? 'invalid' : ''}`}
                      value={draft.contact_email || ''} 
                      onChange={(e) => handleDraftChange((curr) => ({ ...curr, contact_email: e.target.value }))} 
                      placeholder="exemplo@email.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="input-block">
                  <label>Telefone / WhatsApp</label>
                  <input 
                    className="modern-input" 
                    value={draft.contact_phone || ''} 
                    onChange={(e) => handleDraftChange((curr) => ({ ...curr, contact_phone: maskPhone(e.target.value) }))} 
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            {activeStep === 'endereco' && (
              <div className="stack lg animate-fade-in">
                <div className="form-group-rounded" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                  <div className="input-block">
                    <label>Logradouro / Rua</label>
                    <input className="modern-input" value={draft.street || ''} onChange={(e) => handleDraftChange((curr) => ({ ...curr, street: e.target.value }))} />
                  </div>
                  <div className="input-block">
                    <label>Número</label>
                    <input className="modern-input" value={draft.number || ''} onChange={(e) => handleDraftChange((curr) => ({ ...curr, number: e.target.value }))} />
                  </div>
                  <div className="input-block">
                    <label>Bairro</label>
                    <input className="modern-input" value={draft.district || ''} onChange={(e) => handleDraftChange((curr) => ({ ...curr, district: e.target.value }))} />
                  </div>
                </div>
                <div className="input-block">
                  <label>Complemento / Referência</label>
                  <input className="modern-input" value={draft.complement || ''} onChange={(e) => handleDraftChange((curr) => ({ ...curr, complement: e.target.value }))} />
                </div>
              </div>
            )}
          </form>
        </article>
      </section>
    );
  }

  if (mode === 'detail') {
    const current = detail?.study ?? visibleProjects.find((p) => p.id === clientId) ?? null;
    return (
      <section className="clients-page page-transition">
        <article className="panel clients-panel glass-panel">
          <div className="panel-head row spread middle">
            <div>
              <p className="eyebrow">Ficha Cadastral</p>
              <h1>{current?.name ?? pageTitle}</h1>
            </div>
            <div className="row">
              <button className="ghost" onClick={() => navigate('/clientes')}>Voltar</button>
              <button className="button" onClick={() => navigate(`/clientes/${clientId}/editar`)}>Editar</button>
            </div>
          </div>

          <div className="detail-grid">
            <article className="detail-card">
              <span>Localização Principal</span>
              <strong>{current?.city} / {current?.state}</strong>
              {current?.zip && <p className="muted size-xs">CEP: {current.zip}</p>}
            </article>
            <article className="detail-card">
              <span>Contato Direto</span>
              <strong>{current?.contact_name || 'N/A'}</strong>
              <p className="muted size-xs">{current?.contact_email}</p>
            </article>
            <article className="detail-card">
              <span>Registro</span>
              <strong>{formatDate(current?.created_at || '')}</strong>
              <p className="muted size-xs">Atualizado em {formatDate(current?.updated_at || '')}</p>
            </article>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="clients-page page-transition">
      <article className="panel clients-panel glass-panel">
        <div className="panel-head row middle gap-md">
          <h1 style={{ whiteSpace: 'nowrap' }}>Base de Clientes</h1>
          
          <div className="row middle flex-1" style={{ justifyContent: 'flex-end', gap: '12px' }}>
            {isSearchVisible && (
              <input 
                className="modern-input animate-slide-left"
                style={{ maxWidth: '300px', height: '36px' }}
                autoFocus
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Pesquisar clientes..." 
              />
            )}

            <button 
              className={`action-btn-wizard ${isSearchVisible ? 'active' : ''}`} 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              title="Pesquisar"
            >
              🔍
            </button>
            <button className="button" onClick={() => navigate('/clientes/novo')}>
              Novo Cliente
            </button>
          </div>
        </div>

        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Localização</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}><SkeletonRow count={5} /></td></tr>
              ) : visibleProjects.length === 0 ? (
                <tr><td colSpan={4} className="center muted" style={{ padding: '40px' }}>Nenhum cliente registrado.</td></tr>
              ) : (
                visibleProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="muted size-xs">{p.contact_name || 'Sem responsável'}</div>
                    </td>
                    <td>{p.city} / {p.state}</td>
                    <td><span className="badge success">Ativo</span></td>
                    <td className="right">
                      <button className="ghost size-xs" onClick={() => navigate(`/clientes/${p.id}`)}>Ver</button>
                      <button className="button size-xs" onClick={() => navigate(`/clientes/${p.id}/editar`)}>Editar</button>
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

// --- Helpers ---

function previousStep(step: ClienteStep): ClienteStep {
  if (step === 'contato') return 'dados';
  if (step === 'endereco') return 'contato';
  return step;
}

function nextStep(step: ClienteStep): ClienteStep {
  if (step === 'dados') return 'contato';
  if (step === 'contato') return 'endereco';
  return step;
}

function titleByMode(mode: string) {
  if (mode === 'create') return 'Novo Cliente';
  if (mode === 'edit') return 'Editar Cliente';
  if (mode === 'detail') return 'Detalhe do Cliente';
  return 'Clientes';
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
