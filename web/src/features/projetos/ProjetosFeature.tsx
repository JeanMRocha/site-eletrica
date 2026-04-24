import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Project as Client } from '../../domain/projects';
import { listProjects as listClients } from '../../domain/projects';
import {
  addResidentialProjectEnvironment,
  createResidentialProject,
  deleteResidentialProject,
  getResidentialProject,
  listResidentialProjects,
  updateResidentialProject,
  type HouseType,
  type NetworkSource,
  type ResidentialProject,
  type ResidentialProjectInput,
  type ResidentialProjectEnvironmentInput,
} from '../../domain/residential-projects';
import { formatDate } from '../../lib/presentation';
import './projetos.css';

type Mode = 'list' | 'create' | 'detail' | 'edit' | 'designer';

const defaultForm: ResidentialProjectInput = {
  clientId: '',
  clientName: '',
  name: '',
  voltage: '127/220V',
  houseType: 'padrao',
  source: 'rede',
};

export function ProjetosFeature() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [projects, setProjects] = useState<ResidentialProject[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [project, setProject] = useState<ResidentialProject | null>(null);
  const [form, setForm] = useState<ResidentialProjectInput>(defaultForm);
  const [envForm, setEnvForm] = useState<ResidentialProjectEnvironmentInput>({ name: '', areaM2: 0, usage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const mode = resolveMode(location.pathname);
  const projectId = params.id ?? '';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const [nextProjects, nextClients] = await Promise.all([Promise.resolve(listResidentialProjects()), listClients()]);
        if (cancelled) return;
        setProjects(nextProjects);
        setClients(nextClients);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar projetos');
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
  }, [location.pathname]);

  useEffect(() => {
    if (mode === 'create') {
      setForm(defaultForm);
      setProject(null);
    }
  }, [mode]);

  useEffect(() => {
    if (projectId && (mode === 'detail' || mode === 'edit' || mode === 'designer')) {
      const next = getResidentialProject(projectId);
      setProject(next);
      if (next) {
        setForm({
          clientId: next.clientId,
          clientName: next.clientName,
          name: next.name,
          voltage: next.voltage,
          houseType: next.houseType,
          source: next.source,
        });
      }
    }
  }, [mode, projectId]);

  const currentProject = project ?? (projectId ? getResidentialProject(projectId) : null);
  const pageTitle = titleByMode(mode);
  const detailProject = currentProject ?? projects.find((item) => item.id === projectId) ?? null;

  const selectedClientName = useMemo(() => clients.find((client) => client.id === form.clientId)?.name ?? form.clientName, [clients, form.clientId, form.clientName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: ResidentialProjectInput = {
        ...form,
        clientName: selectedClientName || form.clientName,
      };

      if (mode === 'edit' && projectId) {
        const next = updateResidentialProject(projectId, payload);
        setProjects(listResidentialProjects());
        setProject(next);
        window.dispatchEvent(new Event('electrica:projects-changed'));
        navigate(`/projetos/${next.id}`);
        return;
      }

      const created = createResidentialProject(payload);
      setProjects(listResidentialProjects());
      window.dispatchEvent(new Event('electrica:projects-changed'));
      navigate(`/projetos/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar projeto');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!projectId) return;
    setSaving(true);
    setError('');

    try {
      deleteResidentialProject(projectId);
      setProjects(listResidentialProjects());
      window.dispatchEvent(new Event('electrica:projects-changed'));
      navigate('/projetos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir projeto');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddEnvironment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) return;
    const name = envForm.name.trim();
    if (!name) return;

    const next = addResidentialProjectEnvironment(projectId, {
      name,
      areaM2: Number(envForm.areaM2) || 0,
      usage: envForm.usage.trim(),
    });
    setProject(next);
    setProjects(listResidentialProjects());
    setEnvForm({ name: '', areaM2: 0, usage: '' });
    window.dispatchEvent(new Event('electrica:projects-changed'));
  }

  function renderList() {
    return (
      <section className="projects-page">
        <article className="panel projects-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Projetos</p>
              <h1>Projetos residenciais</h1>
            </div>
            <button className="button" type="button" onClick={() => navigate('/projetos/novo')}>
              Novo projeto
            </button>
          </div>

          {loading ? <div className="loading">Carregando projetos...</div> : null}
          {error ? <div className="error">{error}</div> : null}

          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-card">Nenhum projeto criado ainda.</div>
            ) : (
              projects.map((item) => (
                <article key={item.id} className="project-list-item">
                  <div>
                    <p className="eyebrow">{item.clientName}</p>
                    <strong>{item.name}</strong>
                    <p className="muted">
                      {item.voltage} · {houseTypeLabel(item.houseType)} · {item.source}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button className="ghost" type="button" onClick={() => navigate(`/projetos/${item.id}`)}>
                      Ver
                    </button>
                    <button className="button" type="button" onClick={() => navigate(`/projetos/${item.id}/projetador`)}>
                      Projetador
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderForm() {
    return (
      <section className="projects-page">
        <article className="panel projects-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{mode === 'edit' ? 'Editar' : 'Criar'}</p>
              <h1>{pageTitle}</h1>
            </div>
            <Link className="ghost" to="/projetos">
              Cancelar
            </Link>
          </div>

          <form className="client-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Cliente</span>
                <select
                  value={form.clientId}
                  onChange={(event) => {
                    const client = clients.find((item) => item.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      clientId: event.target.value,
                      clientName: client?.name ?? '',
                    }));
                  }}
                >
                  <option value="">Selecione</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Nome do projeto</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
            </div>

            <div className="form-grid three">
              <label>
                <span>Tensão</span>
                <select value={form.voltage} onChange={(event) => setForm((current) => ({ ...current, voltage: event.target.value }))}>
                  <option value="127V">127V</option>
                  <option value="220V">220V</option>
                  <option value="127/220V">127/220V</option>
                </select>
              </label>
              <label>
                <span>Tipo da casa</span>
                <select value={form.houseType} onChange={(event) => setForm((current) => ({ ...current, houseType: event.target.value as HouseType }))}>
                  <option value="padrao">Padrão</option>
                  <option value="terrea">Térrea</option>
                  <option value="sobrado">Sobrado</option>
                  <option value="geminada">Geminada</option>
                </select>
              </label>
              <label>
                <span>Origem da rede</span>
                <select value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value as NetworkSource }))}>
                  <option value="rede">Rede</option>
                  <option value="solar">Solar</option>
                  <option value="gerador">Gerador</option>
                  <option value="mista">Mista</option>
                </select>
              </label>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <footer className="form-footer">
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar projeto'}
              </button>
            </footer>
          </form>
        </article>
      </section>
    );
  }

  function renderDetail() {
    if (!detailProject) {
      return (
        <section className="projects-page">
          <article className="panel projects-panel">
            <div className="empty-card">Projeto não encontrado.</div>
          </article>
        </section>
      );
    }

    return (
      <section className="projects-page">
        <article className="panel projects-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Detalhe</p>
              <h1>{detailProject.name}</h1>
            </div>
            <div className="row-actions">
              <button className="ghost" type="button" onClick={() => navigate('/projetos')}>
                Voltar
              </button>
              <button className="button" type="button" onClick={() => navigate(`/projetos/${detailProject.id}/projetador`)}>
                Abrir projetador
              </button>
            </div>
          </div>

          <div className="detail-grid">
            <article className="detail-card">
              <span>Cliente</span>
              <strong>{detailProject.clientName}</strong>
            </article>
            <article className="detail-card">
              <span>Tensão</span>
              <strong>{detailProject.voltage}</strong>
            </article>
            <article className="detail-card">
              <span>Casa</span>
              <strong>{houseTypeLabel(detailProject.houseType)}</strong>
            </article>
            <article className="detail-card">
              <span>Origem</span>
              <strong>{detailProject.source}</strong>
            </article>
            <article className="detail-card">
              <span>Criado em</span>
              <strong>{formatDate(detailProject.createdAt)}</strong>
            </article>
            <article className="detail-card">
              <span>Atualizado em</span>
              <strong>{formatDate(detailProject.updatedAt)}</strong>
            </article>
          </div>

          <div className="project-environments">
            <div className="panel-head slim">
              <div>
                <p className="eyebrow">Ambientes</p>
                <h2>Cadastro de ambientes</h2>
              </div>
            </div>
            <form className="client-form" onSubmit={handleAddEnvironment}>
              <div className="form-grid three">
                <label>
                  <span>Nome</span>
                  <input value={envForm.name} onChange={(event) => setEnvForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label>
                  <span>Área m²</span>
                  <input type="number" step="0.1" value={envForm.areaM2} onChange={(event) => setEnvForm((current) => ({ ...current, areaM2: Number(event.target.value) }))} />
                </label>
                <label>
                  <span>Uso</span>
                  <input value={envForm.usage} onChange={(event) => setEnvForm((current) => ({ ...current, usage: event.target.value }))} />
                </label>
              </div>
              <footer className="form-footer">
                <button className="button" type="submit">
                  Adicionar ambiente
                </button>
              </footer>
            </form>

            <div className="project-env-list">
              {detailProject.environments.length === 0 ? (
                <div className="empty-card">Sem ambientes cadastrados.</div>
              ) : (
                detailProject.environments.map((environment) => (
                  <article key={environment.id} className="detail-card">
                    <strong>{environment.name}</strong>
                    <p className="muted">
                      {environment.areaM2} m² · {environment.usage}
                    </p>
                  </article>
                ))
              )}
            </div>

            <div className="form-footer">
              <button className="ghost danger" type="button" onClick={handleDelete} disabled={saving}>
                Excluir projeto
              </button>
            </div>
          </div>
        </article>
      </section>
    );
  }

  if (mode === 'create' || mode === 'edit') return renderForm();
  if (mode === 'detail' || mode === 'designer') return renderDetail();
  return renderList();
}

function resolveMode(pathname: string): Mode {
  if (pathname.endsWith('/projetador')) return 'designer';
  if (pathname.endsWith('/novo')) return 'create';
  if (/\/projetos\/[^/]+$/.test(pathname)) return 'detail';
  if (/\/projetos\/[^/]+\/editar$/.test(pathname)) return 'edit';
  return 'list';
}

function titleByMode(mode: Mode) {
  if (mode === 'create') return 'Novo projeto';
  if (mode === 'edit') return 'Editar projeto';
  if (mode === 'designer') return 'Projetador';
  if (mode === 'detail') return 'Projeto';
  return 'Projetos';
}

function houseTypeLabel(value: HouseType) {
  switch (value) {
    case 'padrao':
      return 'Padrão';
    case 'terrea':
      return 'Térrea';
    case 'sobrado':
      return 'Sobrado';
    case 'geminada':
      return 'Geminada';
  }
}
