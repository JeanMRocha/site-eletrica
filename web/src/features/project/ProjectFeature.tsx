import type { FormEvent } from 'react';
import type { Project, ProjectDetail } from '../../types';
import { formatDate } from '../../lib/presentation';
import type { ProjectForm } from '../../domain/workspace';
import './project.css';

type ProjectTabProps = {
  projects: Project[];
  selectedProjectId: string;
  detail: ProjectDetail | null;
  form: ProjectForm;
  saving: boolean;
  onSelectProject: (id: string) => void;
  onChangeForm: (updater: (current: ProjectForm) => ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ProjectTab({
  projects,
  selectedProjectId,
  detail,
  form,
  saving,
  onSelectProject,
  onChangeForm,
  onSubmit,
}: ProjectTabProps) {
  return (
    <section className="dashboard-grid project-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Projetos</h2>
          </div>
        </div>
        <div className="list">
          {projects.map((project) => (
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
                    {project.client_name} · {project.location}
                  </p>
                </div>
                <span className="badge neutral">{project.project_type}</span>
              </div>
              <div className="meta">
                <span>{project.voltage}</span>
                <span>{formatDate(project.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Ação secundária</p>
            <h2>Novo projeto</h2>
          </div>
        </div>
        <details className="details-box">
          <summary>Abrir cadastro</summary>
          <form onSubmit={onSubmit}>
            <div className="form-grid">
              <label>
                Nome
                <input value={form.name} onChange={(event) => onChangeForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                Cliente
                <input value={form.client_name} onChange={(event) => onChangeForm((current) => ({ ...current, client_name: event.target.value }))} />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Local
                <input value={form.location} onChange={(event) => onChangeForm((current) => ({ ...current, location: event.target.value }))} />
              </label>
              <label>
                Tipo
                <input value={form.project_type} onChange={(event) => onChangeForm((current) => ({ ...current, project_type: event.target.value }))} />
              </label>
            </div>
            <label>
              Tensão
              <input value={form.voltage} onChange={(event) => onChangeForm((current) => ({ ...current, voltage: event.target.value }))} />
            </label>
            <button className="button" disabled={saving} type="submit">
              {saving ? 'Salvando...' : 'Salvar projeto'}
            </button>
          </form>
        </details>

        {detail ? (
          <div className="mini-card">
            <strong>{detail.study.name}</strong>
            <p className="muted">
              {detail.study.client_name} · {detail.study.location}
            </p>
            <div className="meta">
              <span>{detail.study.project_type}</span>
              <span>{formatDate(detail.study.updated_at)}</span>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
