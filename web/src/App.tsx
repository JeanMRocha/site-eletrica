import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { assessProject, createProject, deleteProject, getProject, listProjects, updateProject, type AssessmentInput, type AssessmentRecord, type Project, type ProjectDetail } from './domain/projects';
import { listHierarchy, listStandards, type HierarchyLevel, type Standard } from './domain/standards';
import { defaultProjectForm, defaultProjectWorkspace, defaultSession, getProjectWorkspace, normalizeWorkspace, setProjectWorkspace, type ProjectForm, type ProjectWorkspace as ProjectWorkspaceState, type Session, type Workspace } from './domain/workspace';
import { listIbgeCities, listIbgeStates, type IbgeCity, type IbgeState } from './domain/ibge';
import { sortStandards } from './lib/presentation';
import { AppLayout } from './layout/AppLayout';
import { tabs, type ProjectSectionKey, type TabKey } from './navigation';
import { AuthScreen } from './features/auth/AuthScreen';
import { HomeDashboard } from './features/home/HomeFeature';
import { ProjectWorkspace as ProjectWorkspaceView } from './features/project/ProjectWorkspace';
import { ReportsTab } from './features/reports/ReportsFeature';
import { StandardsTab } from './features/standards/StandardsFeature';
import { base62Id } from './lib/id';

const sessionKey = 'eletrica.session';
const workspaceKey = 'eletrica.workspace';

const defaultAssessment: AssessmentInput = {
  circuit_id: 'C1',
  current_project_a: 17.3,
  conductor_mm2: 2.5,
  breaker_a: 20,
  voltage_drop_percent: 3.1,
  installation_method: 'embutido',
  environment_type: 'quarto',
  standard_code: 'NBR-5410',
  standard_version: 'catalog-2026.04',
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function loadSession() {
  return safeParse<Session | null>(window.localStorage.getItem(sessionKey), null);
}

function loadWorkspace() {
  return normalizeWorkspace(safeParse<Workspace | null>(window.localStorage.getItem(workspaceKey), null));
}

function saveJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [sessionDraft, setSessionDraft] = useState<Session>(() => session ?? defaultSession);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeProjectSection, setActiveProjectSection] = useState<ProjectSectionKey>('client');
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace());
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState('');
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
  const [ibgeStates, setIbgeStates] = useState<IbgeState[]>([]);
  const [ibgeCities, setIbgeCities] = useState<IbgeCity[]>([]);
  const [loadingIbge, setLoadingIbge] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectForm, setProjectForm] = useState<ProjectForm>(defaultProjectForm);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentInput>(defaultAssessment);
  const [savingProject, setSavingProject] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);

  useEffect(() => saveJson(sessionKey, session), [session]);
  useEffect(() => saveJson(workspaceKey, workspace), [workspace]);

  useEffect(() => {
    let cancelled = false;

    async function loadStates() {
      try {
        setLoadingIbge(true);
        setGeoError('');
        const states = await listIbgeStates();
        if (!cancelled) {
          setIbgeStates(states);
        }
      } catch (err) {
        if (!cancelled) {
          setGeoError(err instanceof Error ? err.message : 'Falha ao carregar estados do IBGE');
        }
      } finally {
        if (!cancelled) {
          setLoadingIbge(false);
        }
      }
    }

    void loadStates();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const state = projectForm.state.trim();

    async function loadCities() {
      if (!state) {
        setIbgeCities([]);
        return;
      }

      try {
        setLoadingIbge(true);
        setGeoError('');
        const cities = await listIbgeCities(state);
        if (!cancelled) {
          setIbgeCities(cities);
        }
      } catch (err) {
        if (!cancelled) {
          setGeoError(err instanceof Error ? err.message : 'Falha ao carregar cidades do IBGE');
          setIbgeCities([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingIbge(false);
        }
      }
    }

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [projectForm.state]);

  function openTab(tab: TabKey) {
    setActiveTab(tab);
    if (tab === 'project') {
      setActiveProjectSection('client');
    }
  }

  function openProjectSection(section: ProjectSectionKey) {
    setActiveTab('project');
    setActiveProjectSection(section);
  }

  async function loadProjectDetail(id: string) {
    const nextDetail = await getProject(id);
    setDetail(nextDetail);
    setProjectForm({
      name: nextDetail.study.name,
      city: nextDetail.study.city,
      state: nextDetail.study.state,
    });
    return nextDetail;
  }

  useEffect(() => {
    if (!session) {
      setProjects([]);
      setStandards([]);
      setHierarchy([]);
      setDetail(null);
      setSelectedProjectId('');
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const [projectList, standardList, hierarchyList] = await Promise.all([
          listProjects(),
          listStandards(),
          listHierarchy(),
        ]);
        setProjects(projectList);
        setStandards(standardList);
        setHierarchy(hierarchyList);

        const nextSelected = selectedProjectId || projectList[0]?.id || '';
        if (nextSelected) {
          setSelectedProjectId(nextSelected);
          const nextDetail = await getProject(nextSelected);
          setDetail(nextDetail);
          setEditingProjectId('');
          setProjectEditorOpen(false);
          setProjectForm({
            name: nextDetail.study.name,
            city: nextDetail.study.city,
            state: nextDetail.study.state,
          });
        } else {
          setDetail(null);
          setEditingProjectId('');
          setProjectEditorOpen(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [session, selectedProjectId]);

  useEffect(() => {
    const firstStandard = sortStandards(standards)[0];
    if (firstStandard) {
      setAssessmentForm((current) => ({
        ...current,
        standard_code: current.standard_code || firstStandard.code,
        standard_version: current.standard_version || firstStandard.version,
      }));
    }
  }, [standards]);

  function saveSession(nextSession: Session) {
    setSession(nextSession);
    setSessionDraft(nextSession);
    setProfileOpen(false);
    setError('');
  }

  function logout() {
    setSession(null);
    setSessionDraft(defaultSession);
    setProfileOpen(false);
    setProjects([]);
    setHierarchy([]);
    setStandards([]);
    setDetail(null);
    setSelectedProjectId('');
    setEditingProjectId('');
    setProjectEditorOpen(false);
    setProjectForm(defaultProjectForm);
    setIbgeCities([]);
  }

  async function activateProject(id: string) {
    setSelectedProjectId(id);
    setEditingProjectId('');
    setProjectEditorOpen(false);
    try {
      await loadProjectDetail(id);
      setActiveProjectSection('client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao abrir projeto');
    }
  }

  async function openProjectEditor(id?: string) {
    setActiveTab('project');
    setActiveProjectSection('client');
    setProjectEditorOpen(true);
    setError('');

    if (!id) {
      setSelectedProjectId('');
      setEditingProjectId('');
      setDetail(null);
      setProjectForm(defaultProjectForm);
      return;
    }

    setSelectedProjectId(id);
    setEditingProjectId(id);

    try {
      await loadProjectDetail(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao abrir editor');
    }
  }

  async function onCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProject(true);
    setError('');
    try {
      const input = {
        name: projectForm.name.trim(),
        city: projectForm.city.trim(),
        state: projectForm.state.trim().toUpperCase(),
      };
      const project = editingProjectId
        ? await updateProject(editingProjectId, input)
        : await createProject(input);
      setProjects(await listProjects());
      await activateProject(project.id);
      setProjectEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : editingProjectId ? 'Falha ao atualizar cliente' : 'Falha ao criar cliente');
    } finally {
      setSavingProject(false);
    }
  }

  async function onDeleteProject() {
    if (!editingProjectId) return;
    setSavingProject(true);
    setError('');
    try {
      await deleteProject(editingProjectId);
      setProjects(await listProjects());
      setWorkspace((current) => {
        const nextProjects = { ...current.projects };
        delete nextProjects[editingProjectId];
        return { projects: nextProjects };
      });
      setEditingProjectId('');
      setProjectForm(defaultProjectForm);
      setSelectedProjectId('');
      setDetail(null);
      setProjectEditorOpen(false);
      setActiveProjectSection('client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir cliente');
    } finally {
      setSavingProject(false);
    }
  }

  function startNewProject() {
    void openProjectEditor();
  }

  function startEditProject() {
    if (!selectedProjectId) return;
    void openProjectEditor(selectedProjectId);
  }

  function updateSelectedProjectWorkspace(updater: (current: ProjectWorkspaceState) => ProjectWorkspaceState) {
    if (!selectedProjectId) return;
    setWorkspace((current) => {
      const nextProjectWorkspace = updater(getProjectWorkspace(current, selectedProjectId));
      return setProjectWorkspace(current, selectedProjectId, nextProjectWorkspace);
    });
  }

  function addDrawing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('drawing_title') ?? '').trim();
    if (!title || !selectedProjectId) return;

    updateSelectedProjectWorkspace((current) => ({
      ...current,
      drawings: [
        {
          id: base62Id(),
          title,
          scale: String(data.get('drawing_scale') ?? '').trim(),
          notes: String(data.get('drawing_notes') ?? '').trim(),
        },
        ...current.drawings,
      ],
    }));

    event.currentTarget.reset();
  }

  async function onAssessProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProjectId) return;
    setSavingAssessment(true);
    setError('');
    try {
      await assessProject(selectedProjectId, { ...assessmentForm, study_id: selectedProjectId });
      const nextDetail = await getProject(selectedProjectId);
      setDetail(nextDetail);
      setProjects(await listProjects());
      openProjectSection('conformity');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar cálculo');
    } finally {
      setSavingAssessment(false);
    }
  }

  function addEnvironment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProjectId) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('env_name') ?? '').trim();
    if (!name) return;

    updateSelectedProjectWorkspace((current) => ({
      ...current,
      environments: [
        {
          id: base62Id(),
          name,
          area: String(data.get('env_area') ?? '').trim(),
          usage: String(data.get('env_usage') ?? '').trim(),
          distance: String(data.get('env_distance') ?? '').trim(),
        },
        ...current.environments,
      ],
    }));
    event.currentTarget.reset();
  }

  function addLoad(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProjectId) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('load_name') ?? '').trim();
    if (!name) return;

    updateSelectedProjectWorkspace((current) => ({
      ...current,
      loads: [
        {
          id: base62Id(),
          name,
          category: String(data.get('load_category') ?? '').trim(),
          power: String(data.get('load_power') ?? '').trim(),
          quantity: String(data.get('load_quantity') ?? '').trim(),
        },
        ...current.loads,
      ],
    }));
    event.currentTarget.reset();
  }

  function addCircuit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProjectId) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('circuit_name') ?? '').trim();
    if (!name) return;

    updateSelectedProjectWorkspace((current) => ({
      ...current,
      circuits: [
        {
          id: base62Id(),
          name,
          environment: String(data.get('circuit_environment') ?? '').trim(),
          breaker: String(data.get('circuit_breaker') ?? '').trim(),
          conductor: String(data.get('circuit_conductor') ?? '').trim(),
        },
        ...current.circuits,
      ],
    }));
    event.currentTarget.reset();
  }

  if (!session) {
    return <AuthScreen draft={sessionDraft} onChange={setSessionDraft} onSubmit={() => saveSession({ name: sessionDraft.name.trim() || 'Engenheiro', image: sessionDraft.image.trim() })} />;
  }

  const latestAssessment: AssessmentRecord | null = detail?.assessments?.[0] ?? null;
  const selectedProjectWorkspace = selectedProjectId ? getProjectWorkspace(workspace, selectedProjectId) : defaultProjectWorkspace;

  return (
      <AppLayout
        session={session}
        activeTab={activeTab}
        tabs={tabs}
        profileOpen={profileOpen}
        onToggleProfile={() => setProfileOpen((current) => !current)}
        onOpenTab={openTab}
        draft={sessionDraft}
        onDraftChange={setSessionDraft}
        onSaveProfile={() =>
          saveSession({
            name: sessionDraft.name.trim() || 'Engenheiro',
            image: sessionDraft.image.trim(),
          })
        }
        onLogout={logout}
      >
        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando dados iniciais...</div> : null}

        {activeTab === 'home' ? (
          <HomeDashboard
            projects={projects}
            hierarchy={hierarchy}
            latestAssessment={latestAssessment}
            projectCount={projects.length}
            standardCount={standards.length}
            verdictCount={latestAssessment ? 1 : 0}
            selectedProjectId={selectedProjectId}
            onSelectProject={activateProject}
            onOpenProjectSection={openProjectSection}
          />
        ) : null}

        {activeTab === 'project' ? (
          <ProjectWorkspaceView
            projects={projects}
            selectedProjectId={selectedProjectId}
            detail={detail}
            form={projectForm}
            savingProject={savingProject}
            projectWorkspace={selectedProjectWorkspace}
            assessmentForm={assessmentForm}
            standards={sortStandards(standards)}
            latestAssessment={latestAssessment}
            savingAssessment={savingAssessment}
            editingProjectId={editingProjectId}
            ibgeStates={ibgeStates}
            ibgeCities={ibgeCities}
            loadingIbge={loadingIbge}
            geoError={geoError}
            activeSection={activeProjectSection}
            editorOpen={projectEditorOpen}
            onSelectProject={activateProject}
            onOpenEditor={startEditProject}
            onChangeForm={setProjectForm}
            onSubmitProject={onCreateProject}
            onDeleteProject={onDeleteProject}
            onStartNewProject={startNewProject}
            onAddDrawing={addDrawing}
            onAddEnvironment={addEnvironment}
            onAddLoad={addLoad}
            onAddCircuit={addCircuit}
            onChangeAssessment={setAssessmentForm}
            onSubmitAssessment={onAssessProject}
            onSelectSection={setActiveProjectSection}
          />
        ) : null}

        {activeTab === 'standards' ? (
          <StandardsTab
            standards={standards}
            hierarchy={hierarchy}
            assessmentForm={assessmentForm}
            onSelectStandard={(standard: Standard) => {
              setAssessmentForm((current) => ({
                ...current,
                standard_code: standard.code,
                standard_version: standard.version,
              }));
              openProjectSection('calculation');
            }}
          />
        ) : null}

        {activeTab === 'reports' ? <ReportsTab projects={projects} standards={standards} latestAssessment={latestAssessment} /> : null}
    </AppLayout>
  );
}
