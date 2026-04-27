import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getProject, listProjects } from './domain/projects';
import { listHierarchy, listStandards } from './domain/standards';
import type { Project, ProjectDetail, HierarchyLevel, Standard } from './types';
import { defaultSession, type Session } from './domain/workspace';
import { loadSession, clearSession, persistSession } from './domain/auth';
import { AppLayout } from './layout/AppLayout';
import { tabs, type TabKey } from './navigation';
import { AuthScreen } from './features/auth/AuthScreen';
import { HomeDashboard } from './features/home/HomeFeature';
import { ClientesFeature } from './features/clientes/ClientesFeature';
import { ProjetosFeature } from './features/projetos/ProjetosFeature';
import { CatalogoMateriaisFeature } from './features/catalogo/CatalogoMateriaisFeature';
import { NotificationSystem } from './features/shared/NotificationSystem';
import { StandardsFeature } from './features/standards/StandardsFeature';
import { ReportsTab } from './features/reports/ReportsFeature';
import { KnowledgeFeature } from './features/intelligence/KnowledgeFeature';
import { eventBus } from './lib/events';
import './styles.css';


export function App() {
  console.log('App: Initializing...');
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(() => {
    const s = loadSession();
    console.log('App: Loaded session:', s);
    return s;
  });
  const [sessionDraft, setSessionDraft] = useState<Session>(session);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
  const [projectsVersion, setProjectsVersion] = useState(0);

  const activeTab = tabFromPath(location.pathname);
  const latestAssessment = detail?.assessments?.[0] ?? null;

  useEffect(() => {
    persistSession(session);
  }, [session]);

  useEffect(() => {
    function handleProjectsChanged() {
      setProjectsVersion((current) => current + 1);
    }

    const unbindClients = eventBus.on('clients:changed', handleProjectsChanged);
    const unbindProjects = eventBus.on('projects:changed', handleProjectsChanged);

    return () => {
      unbindClients();
      unbindProjects();
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
    const s = loadSession();
    setSession(s);
    setSessionDraft(s);
    navigate('/dashboard');
  }

  function handleLogout() {
    clearSession();
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
        element={<AuthScreen onLoginSuccess={handleLogin} />}
      />
      <Route
        element={
          session.name.trim() ? (
            <AppLayout
              session={session}
              activeTab={activeTab}
              tabs={tabs}
              draft={sessionDraft}
              onDraftChange={setSessionDraft}
              onSaveProfile={handleLogin}
              onLogout={handleLogout}
            >
              <NotificationSystem />
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
          <Route path=":id/editar" element={<ProjetosFeature />} />
          <Route path=":id/projetador" element={<ProjetosFeature />} />
        </Route>
        <Route path="/catalogo/materiais" element={<CatalogoMateriaisFeature />} />
        <Route path="/normas" element={<StandardsFeature />} />
        <Route path="/relatorios" element={<ReportsTab projects={projects} standards={standards} latestAssessment={latestAssessment} />} />
        <Route path="/inteligencia" element={<KnowledgeFeature />} />
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
  if (pathname.startsWith('/inteligencia')) return 'intelligence';
  return 'dashboard';
}

function extractClientId(pathname: string) {
  const match = pathname.match(/^\/clientes\/([^/]+)/);
  return match?.[1] ?? '';
}
