import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { IbgeCity, IbgeState } from '../../domain/ibge';
import type { Project, ProjectDetail, ProjectInput } from '../../domain/projects';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../../domain/projects';
import { formatDate } from '../../lib/presentation';
import { listIbgeCities, listIbgeStates } from '../../domain/ibge';
import './clientes.css';

type ClienteStep = 'dados' | 'contato' | 'endereco';
type ClienteMode = 'list' | 'detail' | 'create' | 'edit';

type ClienteDraft = ProjectInput & {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  street: string;
  number: string;
  district: string;
  zip: string;
  complement: string;
};

const clientSteps: Array<{ key: ClienteStep; label: string; hint: string }> = [
  { key: 'dados', label: 'Dados básicos', hint: 'Nome, estado e cidade.' },
  { key: 'contato', label: 'Contato', hint: 'Telefone, e-mail e responsável.' },
  { key: 'endereco', label: 'Endereço', hint: 'Rua, bairro e complemento.' },
];

const emptyDraft: ClienteDraft = {
  name: '',
  city: '',
  state: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  street: '',
  number: '',
  district: '',
  zip: '',
  complement: '',
};

export function ClientesFeature() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<ClienteDraft>(emptyDraft);
  const [activeStep, setActiveStep] = useState<ClienteStep>('dados');
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState('');

  const clientId = params.id ?? '';
  const mode = resolveMode(clientId, location.pathname);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const [items, ibgeStates] = await Promise.all([listProjects(), listIbgeStates()]);
        if (cancelled) return;
        setProjects(items);
        setStates(ibgeStates);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar clientes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      if (!clientId || mode === 'list' || mode === 'create') {
        setDetail(null);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const nextDetail = await getProject(clientId);
        if (!cancelled) {
          setDetail(nextDetail);
          setDraft((current) => ({
            ...current,
            name: nextDetail.study.name,
            city: nextDetail.study.city,
            state: nextDetail.study.state,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar cliente');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [clientId, mode]);

  useEffect(() => {
    let cancelled = false;
    const state = draft.state.trim();

    async function loadCities() {
      if (!state) {
        setCities([]);
        return;
      }

      try {
        setLoadingGeo(true);
        setGeoError('');
        const nextCities = await listIbgeCities(state);
        if (!cancelled) {
          setCities(nextCities);
        }
      } catch (err) {
        if (!cancelled) {
          setGeoError(err instanceof Error ? err.message : 'Falha ao carregar cidades');
        }
      } finally {
        if (!cancelled) {
          setLoadingGeo(false);
        }
      }
    }

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [draft.state]);

  useEffect(() => {
    if (mode === 'create') {
      setDraft(emptyDraft);
      setDetail(null);
      setActiveStep('dados');
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && detail) {
      setDraft((current) => ({
        ...current,
        name: detail.study.name,
        city: detail.study.city,
        state: detail.study.state,
      }));
    }
  }, [detail, mode]);

  const visibleProjects = useMemo(() => {
    const query = normalize(search);
    return projects.filter((project) => {
      if (!query) return true;
      return [project.name, project.city, project.state, project.location]
        .filter(Boolean)
        .some((value) => normalize(String(value)).includes(query));
    });
  }, [projects, search]);

  const pageTitle = titleByMode(mode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: ProjectInput = {
        name: draft.name.trim(),
        city: draft.city.trim(),
        state: draft.state.trim().toUpperCase(),
      };

      if (mode === 'edit' && clientId) {
        const next = await updateProject(clientId, payload);
        setProjects((current) => current.map((project) => (project.id === next.id ? next : project)));
        const nextDetail = await getProject(clientId);
        setDetail(nextDetail);
        window.dispatchEvent(new Event('electrica:clients-changed'));
        navigate(`/clientes/${next.id}`);
        return;
      }

      const created = await createProject(payload);
      setProjects((current) => [created, ...current]);
      window.dispatchEvent(new Event('electrica:clients-changed'));
      navigate(`/clientes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar cliente');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!clientId) return;
    setSaving(true);
    setError('');

    try {
      await deleteProject(clientId);
      setProjects((current) => current.filter((project) => project.id !== clientId));
      setDetail(null);
      window.dispatchEvent(new Event('electrica:clients-changed'));
      navigate('/clientes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir cliente');
    } finally {
      setSaving(false);
    }
  }

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

          {loading ? <div className="loading">Carregando clientes...</div> : null}
          {error ? <div className="error">{error}</div> : null}

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
    const current = detail?.study ?? projects.find((project) => project.id === clientId) ?? null;

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

          {loading ? <div className="loading">Carregando cliente...</div> : null}
          {error ? <div className="error">{error}</div> : null}

          {current ? (
            <div className="detail-grid">
              <article className="detail-card">
                <span>Dados básicos</span>
                <strong>{current.name}</strong>
                <p className="muted">
                  {current.city} / {current.state}
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
                    <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    <span>Estado</span>
                    <select
                      value={draft.state}
                      onChange={(event) =>
                        setDraft((current) => ({
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
                </div>
                <label>
                  <span>Cidade</span>
                  <select value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} disabled={!draft.state || loadingGeo}>
                    <option value="">{loadingGeo ? 'Carregando cidades...' : 'Selecione o estado primeiro'}</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                </label>
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
                    <input value={draft.contact_name} onChange={(event) => setDraft((current) => ({ ...current, contact_name: event.target.value }))} />
                  </label>
                  <label>
                    <span>E-mail</span>
                    <input value={draft.contact_email} onChange={(event) => setDraft((current) => ({ ...current, contact_email: event.target.value }))} />
                  </label>
                </div>
                <label>
                  <span>Telefone</span>
                  <input value={draft.contact_phone} onChange={(event) => setDraft((current) => ({ ...current, contact_phone: event.target.value }))} />
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
                    <input value={draft.street} onChange={(event) => setDraft((current) => ({ ...current, street: event.target.value }))} />
                  </label>
                  <label>
                    <span>Número</span>
                    <input value={draft.number} onChange={(event) => setDraft((current) => ({ ...current, number: event.target.value }))} />
                  </label>
                  <label>
                    <span>Bairro</span>
                    <input value={draft.district} onChange={(event) => setDraft((current) => ({ ...current, district: event.target.value }))} />
                  </label>
                </div>
                <div className="form-grid">
                  <label>
                    <span>CEP</span>
                    <input value={draft.zip} onChange={(event) => setDraft((current) => ({ ...current, zip: event.target.value }))} />
                  </label>
                  <label>
                    <span>Complemento</span>
                    <input value={draft.complement} onChange={(event) => setDraft((current) => ({ ...current, complement: event.target.value }))} />
                  </label>
                </div>
              </section>
            ) : null}

            {geoError ? <div className="error">{geoError}</div> : null}
            {error ? <div className="error">{error}</div> : null}

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

function resolveMode(clientId: string, pathname: string): ClienteMode {
  if (pathname.endsWith('/novo')) return 'create';
  if (pathname.endsWith('/editar')) return 'edit';
  if (clientId) return 'detail';
  return 'list';
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

function titleByMode(mode: ClienteMode) {
  if (mode === 'create') return 'Novo cliente';
  if (mode === 'edit') return 'Editar cliente';
  if (mode === 'detail') return 'Detalhe do cliente';
  return 'Clientes';
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
