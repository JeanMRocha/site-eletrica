import type { FormEvent } from 'react';
import type { Project } from '../../types';
import { formatDate } from '../../lib/presentation';
import type { IbgeCity, IbgeState } from '../../domain/ibge';
import type { ProjectForm } from '../../domain/workspace';
import './project.css';

type ProjectTabProps = {
  projects: Project[];
  selectedProjectId: string;
  detail: { study: Project } | null;
  form: ProjectForm;
  saving: boolean;
  editingProjectId: string;
  states: IbgeState[];
  cities: IbgeCity[];
  loadingGeo: boolean;
  geoError: string;
  onSelectProject: (id: string) => void;
  onChangeForm: (updater: (current: ProjectForm) => ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteProject: () => void;
  onStartNewProject: () => void;
};

export function ProjectTab({
  projects,
  selectedProjectId,
  detail,
  form,
  saving,
  editingProjectId,
  states,
  cities,
  loadingGeo,
  geoError,
  onSelectProject,
  onChangeForm,
  onSubmit,
  onDeleteProject,
  onStartNewProject,
}: ProjectTabProps) {
  return (
    <section className="dashboard-grid project-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Clientes</p>
            <h2>Cadastro básico</h2>
          </div>
          <button className="ghost" type="button" onClick={onStartNewProject}>
            Novo cliente
          </button>
        </div>
        <div className="list">
          {projects.length === 0 ? (
            <div className="item">
              <strong>Sem clientes cadastrados.</strong>
              <p className="muted">Use o formulário ao lado para criar o primeiro.</p>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                className={`item selectable ${project.id === selectedProjectId ? 'selected' : ''}`}
                onClick={() => onSelectProject(project.id)}
                type="button"
              >
                <div className="row">
                  <div>
                    <strong>{project.name}</strong>
                    <p className="muted">
                      {project.city} / {project.state}
                    </p>
                  </div>
                  <span className="badge neutral">Cliente</span>
                </div>
                <div className="meta">
                  <span>{formatDate(project.created_at)}</span>
                  <span>{formatDate(project.updated_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{editingProjectId ? 'Editar cliente' : 'Novo cliente'}</p>
            <h2>{form.name || 'Cadastro básico'}</h2>
          </div>
          {editingProjectId ? (
            <button className="ghost danger" type="button" onClick={onDeleteProject}>
              Excluir
            </button>
          ) : null}
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Nome
              <input value={form.name} onChange={(event) => onChangeForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Estado
              <select
                value={form.state}
                onChange={(event) =>
                  onChangeForm((current) => ({
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
            Cidade
            <select
              value={form.city}
              onChange={(event) => onChangeForm((current) => ({ ...current, city: event.target.value }))}
              disabled={!form.state || loadingGeo}
            >
              <option value="">{loadingGeo ? 'Carregando cidades...' : 'Selecione o estado primeiro'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </label>

          {geoError ? <div className="error">{geoError}</div> : null}

          <div className="popover-actions">
            <button className="button" disabled={saving} type="submit">
              {saving ? (editingProjectId ? 'Salvando...' : 'Criando...') : editingProjectId ? 'Salvar alterações' : 'Criar cliente'}
            </button>
            <button className="ghost" type="button" onClick={onStartNewProject}>
              Limpar
            </button>
          </div>
        </form>

        {detail ? (
          <div className="mini-card">
            <strong>{detail.study.name}</strong>
            <p className="muted">
              {detail.study.city} / {detail.study.state}
            </p>
            <div className="meta">
              <span>Criado em {formatDate(detail.study.created_at)}</span>
              <span>Atualizado em {formatDate(detail.study.updated_at)}</span>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
