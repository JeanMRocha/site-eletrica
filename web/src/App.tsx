import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { assessProject, createProject, getProject, listHierarchy, listProjects, listStandards } from './api';
import type { AssessmentInput, AssessmentRecord, HierarchyLevel, Project, ProjectDetail, Standard } from './types';
import { defaultProjectForm, defaultSession, defaultWorkspace, type ProjectForm, type Session, type Workspace } from './domain/workspace';
import { sortStandards } from './lib/presentation';
import { AppLayout } from './layout/AppLayout';
import { tabs, type TabKey } from './navigation';
import { AuthScreen } from './features/auth/AuthScreen';
import { CalculationTab } from './features/calculation/CalculationFeature';
import { ConformityTab } from './features/conformity/ConformityFeature';
import { HomeDashboard } from './features/home/HomeFeature';
import { ModelingTab } from './features/modeling/ModelingFeature';
import { ProjectTab } from './features/project/ProjectFeature';
import { ReportsTab } from './features/reports/ReportsFeature';
import { StandardsTab } from './features/standards/StandardsFeature';
import './features/home/home.css';

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
  return safeParse<Workspace>(window.localStorage.getItem(workspaceKey), defaultWorkspace);
}

function saveJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [sessionDraft, setSessionDraft] = useState<Session>(() => session ?? defaultSession);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace());
  const [projects, setProjects] = useState<Project[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
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
          setDetail(await getProject(nextSelected));
        } else {
          setDetail(null);
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
  }

  function activateProject(id: string) {
    setSelectedProjectId(id);
    void getProject(id)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao abrir projeto'));
  }

  async function onCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProject(true);
    setError('');
    try {
      const project = await createProject(projectForm);
      setProjects(await listProjects());
      activateProject(project.id);
      setActiveTab('project');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar projeto');
    } finally {
      setSavingProject(false);
    }
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
      setActiveTab('conformity');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar cálculo');
    } finally {
      setSavingAssessment(false);
    }
  }

  function addEnvironment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('env_name') ?? '').trim();
    if (!name) return;

    setWorkspace((current) => ({
      ...current,
      environments: [
        {
          id: `env_${Math.random().toString(36).slice(2, 10)}`,
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
    const data = new FormData(event.currentTarget);
    const name = String(data.get('load_name') ?? '').trim();
    if (!name) return;

    setWorkspace((current) => ({
      ...current,
      loads: [
        {
          id: `load_${Math.random().toString(36).slice(2, 10)}`,
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
    const data = new FormData(event.currentTarget);
    const name = String(data.get('circuit_name') ?? '').trim();
    if (!name) return;

    setWorkspace((current) => ({
      ...current,
      circuits: [
        {
          id: `ckt_${Math.random().toString(36).slice(2, 10)}`,
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

  return (
      <AppLayout
        session={session}
        activeTab={activeTab}
        tabs={tabs}
        profileOpen={profileOpen}
        activeProjectName={detail?.study.name ?? 'nenhum projeto ativo'}
        onToggleProfile={() => setProfileOpen((current) => !current)}
        onOpenTab={setActiveTab}
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
        <section className="hero-strip home-feature">
          <div>
            <p className="eyebrow">Home</p>
            <h1>Consolidação geral do projeto</h1>
            <p>As abas abaixo mostram síntese, hierarquia normativa, modelagem e veredito, sem menus de cadastro como tela principal.</p>
          </div>
          <div className="hero-metrics">
            <div className="metric">
              <strong>{projects.length}</strong>
              <span>projetos</span>
            </div>
            <div className="metric">
              <strong>{standards.length}</strong>
              <span>normas</span>
            </div>
            <div className="metric">
              <strong>{latestAssessment ? 1 : 0}</strong>
              <span>último veredito</span>
            </div>
          </div>
        </section>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando dados iniciais...</div> : null}

        {activeTab === 'home' ? (
          <HomeDashboard
            projects={projects}
            standards={standards}
            hierarchy={hierarchy}
            latestAssessment={latestAssessment}
            selectedProjectId={selectedProjectId}
            onSelectProject={activateProject}
            onOpenTab={setActiveTab}
          />
        ) : null}

        {activeTab === 'project' ? (
          <ProjectTab
            projects={projects}
            selectedProjectId={selectedProjectId}
            detail={detail}
            form={projectForm}
            saving={savingProject}
            onSelectProject={activateProject}
            onChangeForm={setProjectForm}
            onSubmit={onCreateProject}
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
              setActiveTab('calculation');
            }}
          />
        ) : null}

        {activeTab === 'modeling' ? (
          <ModelingTab workspace={workspace} onAddEnvironment={addEnvironment} onAddLoad={addLoad} onAddCircuit={addCircuit} />
        ) : null}

        {activeTab === 'calculation' ? (
          <CalculationTab
            assessmentForm={assessmentForm}
            standards={sortStandards(standards)}
            detail={detail}
            latestAssessment={latestAssessment}
            saving={savingAssessment}
            onChangeAssessment={setAssessmentForm}
            onSubmit={onAssessProject}
          />
        ) : null}

        {activeTab === 'conformity' ? <ConformityTab latestAssessment={latestAssessment} /> : null}

        {activeTab === 'reports' ? <ReportsTab projects={projects} standards={standards} latestAssessment={latestAssessment} /> : null}
    </AppLayout>
  );
}
