import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getProject, listProjects, type Project, type ProjectDetail } from './domain/projects';
import { listHierarchy, listStandards, type HierarchyLevel, type Standard } from './domain/standards';
import { defaultSession, type Session } from './domain/workspace';
import { AppLayout } from './layout/AppLayout';
import { tabs, type TabKey } from './navigation';
import { AuthScreen } from './features/auth/AuthScreen';
import { HomeDashboard } from './features/home/HomeFeature';
import { ClientesFeature } from './features/clientes/ClientesFeature';
import { ProjetosFeature } from './features/projetos/ProjetosFeature';
import { ProjetadorFeature } from './features/projetador/ProjetadorFeature';
import { CatalogoMateriaisFeature } from './features/catalogo/CatalogoMateriaisFeature';
import { NormasFeature } from './features/normas/NormasFeature';
import { ReportsTab } from './features/reports/ReportsFeature';
import './styles.css';

const sessionKey = 'electrica.session';

function loadSession(): Session {
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) return defaultSession;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    return {
      name: String(parsed.name ?? '').trim(),
      image: String(parsed.image ?? '').trim(),
    };
  } catch {
    return defaultSession;
  }
}

function saveSession(session: Session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(() => loadSession());
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<Session>(session);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
  const [projectsVersion, setProjectsVersion] = useState(0);

  const activeTab = tabFromPath(location.pathname);
  const latestAssessment = detail?.assessments?.[0] ?? null;

  useEffect(() => saveSession(session), [session]);

  useEffect(() => {
    function handleProjectsChanged() {
      setProjectsVersion((current) => current + 1);
    }

    window.addEventListener('electrica:clients-changed', handleProjectsChanged);
    window.addEventListener('electrica:projects-changed', handleProjectsChanged);
    return () => {
      window.removeEventListener('electrica:clients-changed', handleProjectsChanged);
      window.removeEventListener('electrica:projects-changed', handleProjectsChanged);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projectList, standardList, hierarchyList] = await Promise.all([listProjects(), listStandards(), listHierarchy()]);
        if (cancelled) return;
        setProjects(projectList);
        setStandards(standardList);
        setHierarchy(hierarchyList);

        const routeProjectId = extractClientId(location.pathname);
        const nextSelected = routeProjectId || selectedProjectId || projectList[0]?.id || '';
        if (nextSelected) {
          setSelectedProjectId(nextSelected);
          const nextDetail = await getProject(nextSelected);
          if (!cancelled) {
            setDetail(nextDetail);
          }
        } else if (!cancelled) {
          setDetail(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, projectsVersion]);

  useEffect(() => {
    if (!session.name.trim()) {
      setSessionDraft(defaultSession);
      setProfileOpen(false);
    }
  }, [session.name]);

  function openClient(id: string) {
    setSelectedProjectId(id);
    navigate(`/clientes/${id}`);
  }

  function openClientEdit(id: string) {
    setSelectedProjectId(id);
    navigate(`/clientes/${id}/editar`);
  }

  function handleLogin() {
    const next = {
      name: sessionDraft.name.trim() || 'Engenheiro',
      image: sessionDraft.image.trim(),
    };
    setSession(next);
    navigate('/dashboard');
  }

  function handleLogout() {
    setSession(defaultSession);
    setSessionDraft(defaultSession);
    navigate('/login');
  }

  if (!session.name.trim() && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<AuthScreen draft={sessionDraft} onChange={setSessionDraft} onSubmit={handleLogin} />}
      />
      <Route
        element={
          session.name.trim() ? (
            <AppLayout
              session={session}
              activeTab={activeTab}
              tabs={tabs}
              profileOpen={profileOpen}
              onToggleProfile={() => setProfileOpen((current) => !current)}
              draft={sessionDraft}
              onDraftChange={setSessionDraft}
              onSaveProfile={handleLogin}
              onLogout={handleLogout}
            >
              <Outlet />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <HomeDashboard
              projects={projects}
              hierarchy={hierarchy}
              latestAssessment={latestAssessment}
              projectCount={projects.length}
              standardCount={standards.length}
              verdictCount={latestAssessment ? 1 : 0}
              selectedProjectId={selectedProjectId}
              onSelectProject={openClient}
              onEditProject={openClientEdit}
            />
          }
        />
        <Route path="/clientes">
          <Route index element={<ClientesFeature />} />
          <Route path="novo" element={<ClientesFeature />} />
          <Route path=":id" element={<ClientesFeature />} />
          <Route path=":id/editar" element={<ClientesFeature />} />
        </Route>
        <Route path="/projetos">
          <Route index element={<ProjetosFeature />} />
          <Route path="novo" element={<ProjetosFeature />} />
          <Route path=":id" element={<ProjetosFeature />} />
          <Route path=":id/projetador" element={<ProjetadorFeature />} />
        </Route>
        <Route path="/catalogo/materiais" element={<CatalogoMateriaisFeature />} />
        <Route path="/normas" element={<NormasFeature />} />
        <Route path="/relatorios" element={<ReportsTab projects={projects} standards={standards} latestAssessment={latestAssessment} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function tabFromPath(pathname: string): TabKey {
  if (pathname.startsWith('/clientes')) return 'clientes';
  if (pathname.startsWith('/projetos')) return 'projetos';
  if (pathname.startsWith('/catalogo')) return 'catalogo';
  if (pathname.startsWith('/normas')) return 'normas';
  if (pathname.startsWith('/relatorios')) return 'relatorios';
  return 'dashboard';
}

function extractClientId(pathname: string) {
  const match = pathname.match(/^\/clientes\/([^/]+)/);
  return match?.[1] ?? '';
}
