import { useState, type FormEvent } from 'react';
import type { Project } from '../../types';
import { formatDate } from '../../lib/presentation';
import type { IbgeCity, IbgeState } from '../../types';
import type { ProjectForm } from '../../domain/workspace';
import type { ProjectSectionKey } from '../../navigation';
import { ModalShell } from '../shared/ModalShell';
import './project.css';

type ClientSectionKey = 'dados' | 'contato' | 'endereco';

const clientSections: Array<{ key: ClientSectionKey; label: string; hint: string }> = [
  { key: 'dados', label: 'Dados', hint: 'Nome e local do cliente.' },
  { key: 'contato', label: 'Contato', hint: 'Telefone, e-mail e responsáveis.' },
  { key: 'endereco', label: 'Endereço', hint: 'Referência de localização do projeto.' },
];

type ProjectTabProps = {
  detail: { study: Project } | null;
  form: ProjectForm;
  saving: boolean;
  editingProjectId: string;
  modalSection: ProjectSectionKey | null;
  states: IbgeState[];
  cities: IbgeCity[];
  loadingGeo: boolean;
  geoError: string;
  onOpenEditor: () => void;
  onChangeForm: (updater: (current: ProjectForm) => ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteProject: () => void;
  onStartNewProject: () => void;
  onCloseModal: () => void;
};

export function ProjectTab({
  detail,
  form,
  saving,
  editingProjectId,
  modalSection,
  states,
  cities,
  loadingGeo,
  geoError,
  onOpenEditor,
  onChangeForm,
  onSubmit,
  onDeleteProject,
  onStartNewProject,
  onCloseModal,
}: ProjectTabProps) {
  const [activeClientSection, setActiveClientSection] = useState<ClientSectionKey>('dados');
  const activeClientSectionLabel = clientSections.find((section) => section.key === activeClientSection)?.label ?? 'Dados';
  const activeClientSectionHint = clientSections.find((section) => section.key === activeClientSection)?.hint ?? '';
  const clientModalOpen = modalSection === 'client';

  return (
    <section className="project-feature-shell">
      <article className="panel client-context-panel-shell">
        <div className="client-context-bar" role="tablist" aria-label="Menu contexto do cliente">
          <div className="client-context-tabs">
            {clientSections.map((section) => (
              <button
                key={section.key}
                aria-selected={activeClientSection === section.key}
                className={`tab-chip context-tab ${activeClientSection === section.key ? 'active' : ''}`}
                onClick={() => setActiveClientSection(section.key)}
                role="tab"
                type="button"
                title={section.hint}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          <button className="button context-create" type="button" onClick={onStartNewProject}>
            Criar
          </button>
        </div>

        <div className="client-context-panel">
          <div className="client-context-summary">
            <div>
              <p className="eyebrow">Seção ativa</p>
              <h3>{activeClientSectionLabel}</h3>
              <p className="muted">{activeClientSectionHint}</p>
            </div>
            {detail ? (
              <div className="mini-card subtle">
                <strong>{detail.study.name}</strong>
                <p className="muted">
                  {detail.study.city} / {detail.study.state}
                </p>
                <div className="meta">
                  <span>Criado em {formatDate(detail.study.created_at)}</span>
                  <span>Atualizado em {formatDate(detail.study.updated_at)}</span>
                </div>
              </div>
            ) : (
              <div className="client-empty-state">
                <strong>Sem cliente selecionado</strong>
                <p className="muted">Abra um cliente na busca da home para editar os dados.</p>
              </div>
            )}
            <div className="popover-actions">
              <button className="ghost" type="button" onClick={onOpenEditor} disabled={!detail}>
                Editar cliente
              </button>
              <button className="button" type="button" onClick={onStartNewProject}>
                Novo cliente
              </button>
            </div>
          </div>
        </div>
      </article>

      <ModalShell
        open={clientModalOpen}
        title={editingProjectId ? 'Editar cliente' : 'Novo cliente'}
        subtitle={detail ? `${detail.study.city} / ${detail.study.state}` : 'Cadastro mínimo do cliente'}
        className="compact"
        onClose={onCloseModal}
        footer={
          <>
            {editingProjectId ? (
              <button className="ghost danger" type="button" onClick={onDeleteProject}>
                Excluir
              </button>
            ) : null}
            <button className="ghost" type="button" onClick={onStartNewProject}>
              Novo cliente
            </button>
          </>
        }
      >
        <div className="client-context-bar" role="tablist" aria-label="Menu contexto do cliente">
          <div className="client-context-tabs">
            {clientSections.map((section) => (
              <button
                key={section.key}
                aria-selected={activeClientSection === section.key}
                className={`tab-chip context-tab ${activeClientSection === section.key ? 'active' : ''}`}
                onClick={() => setActiveClientSection(section.key)}
                role="tab"
                type="button"
                title={section.hint}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          <button className="button context-create" type="button" onClick={onStartNewProject}>
            Criar
          </button>
        </div>

        {activeClientSection === 'dados' ? (
          <form onSubmit={onSubmit} className="stack">
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
        ) : (
          <div className="client-empty-state">
            <strong>{activeClientSectionLabel}</strong>
            <p className="muted">
              {activeClientSection === 'contato'
                ? 'Os campos de contato ainda não foram modelados. Esta etapa seguirá em modal quando os dados existirem.'
                : 'Os campos de endereço ainda não foram modelados. Esta etapa seguirá em modal quando os dados existirem.'}
            </p>
          </div>
        )}
      </ModalShell>
    </section>
  );
}
