export type ResidentialProjectStatus = 'draft' | 'designing' | 'review' | 'approved';
export type HouseType = 'padrao' | 'terrea' | 'sobrado' | 'geminada';
export type NetworkSource = 'rede' | 'solar' | 'gerador' | 'mista';
export type CanvasTool =
  | 'wall'
  | 'environment'
  | 'network-source'
  | 'qdc'
  | 'socket'
  | 'switch'
  | 'luminaire'
  | 'shower'
  | 'air-conditioner'
  | 'special-load'
  | 'circuit-line';

export type ResidentialEnvironment = {
  id: string;
  name: string;
  areaM2: number;
  usage: string;
};

export type CanvasItem = {
  id: string;
  tool: Exclude<CanvasTool, 'wall'>;
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
};

export type CanvasWall = {
  id: string;
  tool: 'wall';
  x: number;
  y: number;
  length: number;
  rotation: number;
};

export type ProjectCanvas = {
  walls: CanvasWall[];
  items: CanvasItem[];
  selectedTool: CanvasTool;
};

export type ResidentialProject = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  voltage: string;
  houseType: HouseType;
  source: NetworkSource;
  status: ResidentialProjectStatus;
  environments: ResidentialEnvironment[];
  canvas: ProjectCanvas;
  createdAt: string;
  updatedAt: string;
};

export type ResidentialProjectInput = {
  clientId: string;
  clientName: string;
  name: string;
  voltage: string;
  houseType: HouseType;
  source: NetworkSource;
};

export type ResidentialProjectEnvironmentInput = {
  name: string;
  areaM2: number;
  usage: string;
};

const storageKey = 'electrica.residential-projects';

export const defaultProjectCanvas: ProjectCanvas = {
  walls: [],
  items: [],
  selectedTool: 'environment',
};

const defaultProjects: ResidentialProject[] = [];

export function listResidentialProjects(): ResidentialProject[] {
  return readProjects();
}

export function getResidentialProject(id: string): ResidentialProject | null {
  return readProjects().find((project) => project.id === id) ?? null;
}

export function createResidentialProject(input: ResidentialProjectInput): ResidentialProject {
  const next: ResidentialProject = {
    id: crypto.randomUUID(),
    clientId: input.clientId,
    clientName: input.clientName,
    name: input.name,
    voltage: input.voltage,
    houseType: input.houseType,
    source: input.source,
    status: 'draft',
    environments: [],
    canvas: { ...defaultProjectCanvas },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  persistProjects([next, ...readProjects()]);
  return next;
}

export function updateResidentialProject(id: string, input: ResidentialProjectInput): ResidentialProject {
  const next = readProjects().map((project) =>
    project.id === id
      ? {
          ...project,
          ...input,
          updatedAt: new Date().toISOString(),
        }
      : project,
  );
  persistProjects(next);
  const updated = next.find((project) => project.id === id);
  if (!updated) throw new Error('Projeto não encontrado');
  return updated;
}

export function deleteResidentialProject(id: string): void {
  persistProjects(readProjects().filter((project) => project.id !== id));
}

export function addResidentialProjectEnvironment(id: string, input: ResidentialProjectEnvironmentInput): ResidentialProject {
  const next = readProjects().map((project) =>
    project.id === id
      ? {
          ...project,
          environments: [
            {
              id: crypto.randomUUID(),
              name: input.name,
              areaM2: input.areaM2,
              usage: input.usage,
            },
            ...project.environments,
          ],
          updatedAt: new Date().toISOString(),
        }
      : project,
  );
  persistProjects(next);
  const updated = next.find((project) => project.id === id);
  if (!updated) throw new Error('Projeto não encontrado');
  return updated;
}

export function updateResidentialProjectCanvas(id: string, updater: (canvas: ProjectCanvas) => ProjectCanvas): ResidentialProject {
  const next = readProjects().map((project) =>
    project.id === id
      ? {
          ...project,
          canvas: updater(project.canvas),
          updatedAt: new Date().toISOString(),
        }
      : project,
  );
  persistProjects(next);
  const updated = next.find((project) => project.id === id);
  if (!updated) throw new Error('Projeto não encontrado');
  return updated;
}

function readProjects(): ResidentialProject[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultProjects;
    const parsed = JSON.parse(raw) as ResidentialProject[];
    return Array.isArray(parsed) ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

function persistProjects(projects: ResidentialProject[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(projects));
}
