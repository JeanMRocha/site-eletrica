import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/presentation';
import { SkeletonCard, SkeletonRow } from '../shared/Skeleton';
import { useClientes, type ClienteStep } from './useClientes';
import './clientes.css';

const clientSteps: Array<{ key: ClienteStep; label: string; hint: string }> = [
  { key: 'dados', label: 'Dados básicos', hint: 'Nome, estado e cidade.' },
  { key: 'contato', label: 'Contato', hint: 'Telefone, e-mail e responsável.' },
  { key: 'endereco', label: 'Endereço', hint: 'Rua, bairro e complemento.' },
];

export function ClientesFeature() {
  const {
    visibleProjects,
    detail,
    loading,
    saving,
    search,
    setSearch,
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

  function renderList() {
    return (
      <section className="clients-page">
        <article className="panel clients-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Cadastro</p>
              <h1>Clientes</h1>
            </div>
            <button className="button" type="button" onClick={() => navigate('/clientes/novo')}>
              Novo cliente
            </button>
          </div>

          <div className="clients-toolbar">
            <label className="clients-search">
              <span>Buscar</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, cidade ou estado" />
            </label>
          </div>

          {loading ? (
            <div className="card-grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : null}

          <div className="clients-table-wrap">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Local</th>
                  <th>Atualizado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  visibleProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.name}</strong>
                        <div className="muted">{project.location}</div>
                      </td>
                      <td>
                        {project.city} / {project.state}
                      </td>
                      <td>{formatDate(project.updated_at)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="ghost" type="button" onClick={() => navigate(`/clientes/${project.id}`)}>
                            Ver
                          </button>
                          <button className="button" type="button" onClick={() => navigate(`/clientes/${project.id}/editar`)}>
                            Editar
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

  function renderDetail() {
    const current = detail?.study ?? visibleProjects.find((p) => p.id === clientId) ?? null;

    return (
      <section className="clients-page">
        <article className="panel clients-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Ficha</p>
              <h1>{current?.name ?? pageTitle}</h1>
            </div>
            <div className="row-actions">
              <button className="ghost" type="button" onClick={() => navigate('/clientes')}>
                Voltar
              </button>
              <button className="button" type="button" onClick={() => navigate(`/clientes/${clientId}/editar`)}>
                Editar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="detail-grid">
              <div className="detail-card"><SkeletonRow count={3} /></div>
              <div className="detail-card"><SkeletonRow count={2} /></div>
              <div className="detail-card"><SkeletonRow count={2} /></div>
            </div>
          ) : null}

          {current ? (
            <div className="detail-grid">
              <article className="detail-card">
                <span>Dados básicos</span>
                <strong>{current.name}</strong>
                <p className="muted">
                  {current.zip ? `CEP: ${current.zip} - ` : ''}{current.city} / {current.state}
                </p>
              </article>
              <article className="detail-card">
                <span>Criado em</span>
                <strong>{formatDate(current.created_at)}</strong>
              </article>
              <article className="detail-card">
                <span>Atualizado em</span>
                <strong>{formatDate(current.updated_at)}</strong>
              </article>
            </div>
          ) : null}
        </article>
      </section>
    );
  }

  function renderForm() {
    return (
      <section className="clients-page">
        <article className="panel clients-panel form-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{mode === 'edit' ? 'Edição' : 'Cadastro'}</p>
              <h1>{pageTitle}</h1>
            </div>
            <Link className="ghost" to={mode === 'edit' && clientId ? `/clientes/${clientId}` : '/clientes'}>
              Cancelar
            </Link>
          </div>

          <div className="stepper" role="tablist" aria-label="Etapas do cliente">
            {clientSteps.map((step) => (
              <button
                key={step.key}
                className={`step-chip ${activeStep === step.key ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveStep(step.key)}
              >
                <strong>{step.label}</strong>
                <span>{step.hint}</span>
              </button>
            ))}
          </div>

          <form className="client-form" onSubmit={handleSubmit}>
            {activeStep === 'dados' ? (
              <section className="form-section">
                <div className="section-copy">
                  <p className="eyebrow">Dados básicos</p>
                  <h2>Identificação do cliente</h2>
                </div>
                <div className="form-grid">
                  <label>
                    <span>Nome</span>
                    <input 
                      value={draft.name} 
                      onChange={(event) => handleDraftChange((current) => ({ ...current, name: event.target.value }))} 
                      placeholder="Ex: João Silva" 
                    />
                  </label>
                  <label>
                    <span>CEP</span>
                    <input 
                      value={draft.zip} 
                      onChange={(event) => {
                        const masked = maskCep(event.target.value);
                        handleDraftChange((current) => ({ ...current, zip: masked }));
                      }} 
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </label>
                </div>
                <div className="form-grid">
                  <label>
                    <span>Estado</span>
                    <select
                      value={draft.state}
                      onChange={(event) =>
                        handleDraftChange((current) => ({
                          ...current,
                          state: event.target.value,
                          city: '',
                        }))
                      }
                    >
                      <option value="">Selecione</option>
                      {states.map((state) => (
                        <option key={state.sigla} value={state.sigla}>
                          {state.nome} ({state.sigla})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Cidade</span>
                    <select 
                      value={draft.city} 
                      onChange={(event) => handleDraftChange((current) => ({ ...current, city: event.target.value }))} 
                      disabled={!draft.state || loadingGeo}
                    >
                      <option value="">{loadingGeo ? 'Carregando cidades...' : 'Selecione o estado primeiro'}</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.nome}>
                          {city.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            ) : null}

            {activeStep === 'contato' ? (
              <section className="form-section">
                <div className="section-copy">
                  <p className="eyebrow">Contato</p>
                  <h2>Dados de contato</h2>
                </div>
                <div className="form-grid">
                  <label>
                    <span>Responsável</span>
                    <input value={draft.contact_name} onChange={(event) => handleDraftChange((current) => ({ ...current, contact_name: event.target.value }))} />
                  </label>
                  <label>
                    <span>E-mail</span>
                    <input value={draft.contact_email} onChange={(event) => handleDraftChange((current) => ({ ...current, contact_email: event.target.value }))} />
                  </label>
                </div>
                <label>
                  <span>Telefone</span>
                  <input value={draft.contact_phone} onChange={(event) => handleDraftChange((current) => ({ ...current, contact_phone: event.target.value }))} />
                </label>
              </section>
            ) : null}

            {activeStep === 'endereco' ? (
              <section className="form-section">
                <div className="section-copy">
                  <p className="eyebrow">Endereço</p>
                  <h2>Localização do cliente</h2>
                </div>
                <div className="form-grid three">
                  <label>
                    <span>Rua</span>
                    <input value={draft.street} onChange={(event) => handleDraftChange((current) => ({ ...current, street: event.target.value }))} />
                  </label>
                  <label>
                    <span>Número</span>
                    <input value={draft.number} onChange={(event) => handleDraftChange((current) => ({ ...current, number: event.target.value }))} />
                  </label>
                  <label>
                    <span>Bairro</span>
                    <input value={draft.district} onChange={(event) => handleDraftChange((current) => ({ ...current, district: event.target.value }))} />
                  </label>
                </div>
                <div className="form-grid">
                  <label>
                    <span>CEP</span>
                    <input 
                      value={draft.zip} 
                      onChange={(event) => {
                        const masked = maskCep(event.target.value);
                        handleDraftChange((current) => ({ ...current, zip: masked }));
                      }} 
                    />
                  </label>
                  <label>
                    <span>Complemento</span>
                    <input value={draft.complement} onChange={(event) => handleDraftChange((current) => ({ ...current, complement: event.target.value }))} />
                  </label>
                </div>
              </section>
            ) : null}

            <footer className="form-footer">
              <button
                className="ghost"
                type="button"
                onClick={() => setActiveStep((current) => previousStep(current))}
                disabled={activeStep === 'dados'}
              >
                Anterior
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setActiveStep((current) => nextStep(current))}
                disabled={activeStep === 'endereco'}
              >
                Próximo
              </button>
              <button className="button" disabled={saving} type="submit">
                {saving ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </footer>
          </form>

          {mode === 'edit' && clientId ? (
            <button className="ghost danger delete-link" type="button" onClick={handleDelete} disabled={saving}>
              Excluir cliente
            </button>
          ) : null}
        </article>
      </section>
    );
  }

  if (mode === 'create' || mode === 'edit') {
    return renderForm();
  }

  if (mode === 'detail') {
    return renderDetail();
  }

  return renderList();
}

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
  if (mode === 'create') return 'Novo cliente';
  if (mode === 'edit') return 'Editar cliente';
  if (mode === 'detail') return 'Detalhe do cliente';
  return 'Clientes';
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}
