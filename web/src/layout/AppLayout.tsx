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
  activeProjectName: string;
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
  activeProjectName,
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
          <strong>Site Elétrica</strong>
          <span>Consolidação geral, normas e dimensionamento</span>
        </div>

        <nav className="tabbar" aria-label="Abas principais">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-chip ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onOpenTab(tab.key)}
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{tab.hint}</span>
            </button>
          ))}
        </nav>

        <div className="user-zone">
          <button className="user-chip" onClick={onToggleProfile} type="button">
            <span className="avatar">
              {session.image ? <img src={session.image} alt={session.name} /> : initialsFromName(session.name)}
            </span>
            <span className="user-meta">
              <strong>{session.name}</strong>
              <small>{activeProjectName}</small>
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
