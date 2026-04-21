export type Session = {
  name: string;
  image: string;
};

export type DrawingItem = {
  id: string;
  title: string;
  scale: string;
  notes: string;
};

export type EnvironmentItem = {
  id: string;
  name: string;
  area: string;
  usage: string;
  distance: string;
};

export type LoadItem = {
  id: string;
  name: string;
  category: string;
  power: string;
  quantity: string;
};

export type CircuitItem = {
  id: string;
  name: string;
  environment: string;
  breaker: string;
  conductor: string;
};

export type ProjectWorkspace = {
  drawings: DrawingItem[];
  environments: EnvironmentItem[];
  loads: LoadItem[];
  circuits: CircuitItem[];
};

export type Workspace = {
  projects: Record<string, ProjectWorkspace>;
};

export type ProjectForm = {
  name: string;
  city: string;
  state: string;
};

export const defaultSession: Session = { name: '', image: '' };

export const defaultProjectWorkspace: ProjectWorkspace = {
  drawings: [],
  environments: [],
  loads: [],
  circuits: [],
};

export const defaultWorkspace: Workspace = { projects: {} };

export const defaultProjectForm: ProjectForm = {
  name: '',
  city: '',
  state: '',
};

export function getProjectWorkspace(workspace: Workspace, projectId: string) {
  return workspace.projects[projectId] ?? defaultProjectWorkspace;
}

export function setProjectWorkspace(workspace: Workspace, projectId: string, projectWorkspace: ProjectWorkspace): Workspace {
  return {
    ...workspace,
    projects: {
      ...workspace.projects,
      [projectId]: projectWorkspace,
    },
  };
}

export function normalizeWorkspace(input: Workspace | null | undefined): Workspace {
  if (!input || typeof input !== 'object') {
    return defaultWorkspace;
  }

  const projects = typeof input.projects === 'object' && input.projects ? input.projects : {};

  return {
    projects,
  };
}
