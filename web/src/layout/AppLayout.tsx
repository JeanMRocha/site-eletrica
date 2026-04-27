import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import type { Session } from '../domain/workspace';
import type { TabDefinition, TabKey } from '../navigation';
import { initialsFromName, formatDate } from '../lib/presentation';
import { eventBus, type AppNotification } from '../lib/events';
import { NotificationSystem } from '../features/shared/NotificationSystem';

type AppLayoutProps = {
  session: Session;
  activeTab: TabKey;
  tabs: TabDefinition[];
  draft: Session;
  onDraftChange: (session: Session) => void;
  onSaveProfile: () => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export function AppLayout({
  session,
  activeTab,
  tabs,
  draft,
  onDraftChange,
  onSaveProfile,
  onLogout,
  children,
}: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [history, setHistory] = useState<AppNotification[]>([]);
  
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? 'Cockpit';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsub = eventBus.on('notification:added', (n) => {
      setHistory((prev) => [n, ...prev].slice(0, 20));
    });
    return unsub;
  }, []);

  return (
    <div className="app-shell">
      <aside className="app-rail">
        <div className="brand"><strong>ZF</strong></div>
        <nav className="tabbar" aria-label="Menu principal">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              className={({ isActive }) => `tab-chip ${isActive ? 'active' : ''}`}
              to={tab.path}
              title={tab.label}
            >
              <strong aria-hidden="true">{tab.icon}</strong>
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="app-content">
        <header className="app-topbar">
          <div className="topbar-copy">
            <span className="topbar-eyebrow">Terminal de Comando</span>
            <strong>{activeTabLabel}</strong>
          </div>

          <div className="topbar-actions row">
            {/* Central de Notificações */}
            <div className="action-zone" ref={notifRef}>
              <button 
                className={`action-btn ${notifsOpen ? 'active' : ''}`} 
                onClick={() => { setNotifsOpen(!notifsOpen); setProfileOpen(false); }}
                title="Notificações"
              >
                <strong aria-hidden="true">🔔</strong>
                {history.length > 0 && <span className="notif-dot" />}
              </button>

              {notifsOpen && (
                <div className="popover notif-popover glass-panel">
                  <div className="popover-head">
                    <p className="eyebrow">Notificações Recentes</p>
                    {history.length > 0 && (
                      <button className="text-btn size-xs" onClick={() => setHistory([])}>
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                  <div className="notif-list scroll-thin">
                    {history.length === 0 ? (
                      <p className="muted size-xs center">Sem notificações recentes</p>
                    ) : (
                      history.map((n) => (
                        <div key={n.id} className={`notif-item ${n.type}`}>
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Módulo de Usuário */}
            <div className="user-zone" ref={userRef}>
              <button 
                className={`user-chip-modern ${profileOpen ? 'active' : ''}`} 
                onClick={() => { setProfileOpen(!profileOpen); setNotifsOpen(false); }} 
                type="button"
              >
                <span className="avatar">
                  {session.image ? <img src={session.image} alt={session.name} /> : initialsFromName(session.name)}
                </span>
                <div className="user-meta-compact">
                  <strong>{session.name}</strong>
                  <span className="badge ok">Online</span>
                </div>
              </button>

              {profileOpen && (
                <div className="popover user-popover glass-panel">
                  <div className="popover-head">
                    <p className="eyebrow">Configurações de Acesso</p>
                    <div className="status-compact row">
                       <span className="badge ok">API Online</span>
                       <span className="muted size-xs">V.1.2.0 (Crompressor-AI)</span>
                    </div>
                  </div>
                  
                  <div className="popover-form stack tight">
                    <label>
                      <span>Nome do Engenheiro</span>
                      <input 
                        value={draft.name} 
                        onChange={(e) => onDraftChange({ ...draft, name: e.target.value })} 
                      />
                    </label>
                  </div>

                  <div className="popover-info">
                    <p className="eyebrow">Última Atividade</p>
                    <p className="size-sm">{formatDate(new Date().toISOString())}</p>
                    <span className="muted size-xs">Sincronização realizada com sucesso</span>
                  </div>

                  <div className="popover-actions">
                    <button 
                      className="button" 
                      onClick={() => { onSaveProfile(); setProfileOpen(false); }} 
                      type="button"
                    >
                      Salvar
                    </button>
                    <button className="ghost danger" onClick={onLogout} type="button">Sair</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main key={activeTab} className="shell page-transition">
          <NotificationSystem />
          {children}
        </main>
      </section>
    </div>
  );
}
