import type { ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';
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
  onOpenTab: (tab: TabKey) => void;
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
  onOpenTab,
  onDraftChange,
  onSaveProfile,
  onLogout,
  children,
}: AppLayoutProps) {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <strong>Zé Faisca</strong>
        </div>

        <nav className="tabbar" aria-label="Menu principal">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-chip ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onOpenTab(tab.key)}
              title={tab.label}
              type="button"
            >
              <strong aria-hidden="true">{tab.icon}</strong>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="user-zone">
          <button className="user-chip" onClick={onToggleProfile} title={session.name} type="button">
            <span className="avatar">
              {session.image ? <img src={session.image} alt={session.name} /> : initialsFromName(session.name)}
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
      </header>

      <main className="shell">{children}</main>
    </>
  );
}
