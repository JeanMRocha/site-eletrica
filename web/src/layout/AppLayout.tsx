import type { ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import type { Session } from '../domain/workspace';
import type { TabDefinition, TabKey } from '../navigation';
import { initialsFromName } from '../lib/presentation';

type AppLayoutProps = {
  session: Session;
  activeTab: TabKey;
  tabs: TabDefinition[];
  profileOpen: boolean;
  draft: Session;
  onToggleProfile: () => void;
  onDraftChange: Dispatch<SetStateAction<Session>>;
  onSaveProfile: () => void;
  onLogout: () => void;
  children: ReactNode;
};

export function AppLayout({
  session,
  activeTab,
  tabs,
  profileOpen,
  draft,
  onToggleProfile,
  onDraftChange,
  onSaveProfile,
  onLogout,
  children,
}: AppLayoutProps) {
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? 'Painel';
  const notificationCount = 3;

  return (
    <div className="app-shell">
      <aside className="app-rail">
        <div className="brand">
          <strong>Zé Faisca</strong>
          <span className="brand-subtitle">Projeto elétrico e conformidade</span>
        </div>

        <nav className="tabbar" aria-label="Menu principal">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              className={`tab-chip ${activeTab === tab.key ? 'active' : ''}`}
              to={tab.path}
              title={tab.label}
            >
              <strong aria-hidden="true">{tab.icon}</strong>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="app-content">
        <header className="app-topbar">
          <div className="topbar-copy">
            <span className="topbar-eyebrow">Navegação global</span>
            <strong>{activeTabLabel}</strong>
          </div>

          <div className="topbar-actions">
            <button className="notification-chip" type="button" aria-label={`Notificações (${notificationCount})`}>
              <span aria-hidden="true">⟡</span>
              <span className="notification-count">{notificationCount}</span>
            </button>

            <div className="user-zone">
              <button className="user-chip" onClick={onToggleProfile} title={session.name} type="button">
                <span className="avatar">
                  {session.image ? <img src={session.image} alt={session.name} /> : initialsFromName(session.name)}
                </span>
                <span className="user-meta">
                  <strong>{session.name}</strong>
                  <span>Usuário ativo</span>
                </span>
              </button>

              {profileOpen ? (
                <div className="popover">
                  <label>
                    Nome
                    <input value={draft.name} onChange={(event) => onDraftChange((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    Imagem
                    <input value={draft.image} onChange={(event) => onDraftChange((current) => ({ ...current, image: event.target.value }))} />
                  </label>
                  <div className="popover-actions">
                    <button className="button" onClick={onSaveProfile} type="button">
                      Salvar
                    </button>
                    <button className="ghost danger" onClick={onLogout} type="button">
                      Sair
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="shell">{children}</main>
      </section>
    </div>
  );
}
