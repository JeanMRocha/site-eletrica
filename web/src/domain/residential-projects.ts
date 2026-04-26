export type ResidentialProjectStatus = 'draft' | 'designing' | 'review' | 'approved';
export type HouseType = 'padrao' | 'terrea' | 'sobrado' | 'geminada';
export type NetworkSource = 'rede' | 'solar' | 'gerador';

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
  tool: CanvasTool;
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
  rotation?: number;
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
  source: NetworkSource[];
  status: ResidentialProjectStatus;
  environments: ResidentialEnvironment[];
  canvas: ProjectCanvas;
  address?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type ResidentialProjectInput = {
  clientId: string;
  clientName: string;
  name: string;
  voltage: string;
  houseType: HouseType;
  source: NetworkSource[];
  address?: string;
  zipCode?: string;
};

export type ResidentialProjectEnvironmentInput = {
  name: string;
  areaM2: number;
  usage: string;
};

// --- Repository Interface ---

export interface ProjectRepository {
  list(): Promise<ResidentialProject[]>;
  get(id: string): Promise<ResidentialProject | null>;
  create(input: ResidentialProjectInput): Promise<ResidentialProject>;
  update(id: string, input: ResidentialProjectInput): Promise<ResidentialProject>;
  delete(id: string): Promise<void>;
  addEnvironment(id: string, input: ResidentialProjectEnvironmentInput): Promise<ResidentialProject>;
  updateCanvas(id: string, updater: (canvas: ProjectCanvas) => ProjectCanvas): Promise<ResidentialProject>;
}

// --- Local Implementation ---

const STORAGE_KEY = 'electrica.residential-projects';

export class LocalProjectRepository implements ProjectRepository {
  private read(): ResidentialProject[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private persist(projects: ResidentialProject[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  async list(): Promise<ResidentialProject[]> {
    return this.read();
  }

  async get(id: string): Promise<ResidentialProject | null> {
    return this.read().find(p => p.id === id) ?? null;
  }

  async create(input: ResidentialProjectInput): Promise<ResidentialProject> {
    const next: ResidentialProject = {
      id: crypto.randomUUID(),
      clientId: input.clientId,
      clientName: input.clientName,
      name: input.name,
      voltage: input.voltage,
      houseType: input.houseType,
      source: input.source,
      address: input.address,
      zipCode: input.zipCode,
      status: 'draft',
      environments: [],
      canvas: { walls: [], items: [], selectedTool: 'environment' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.persist([next, ...this.read()]);
    return next;
  }

  async update(id: string, input: ResidentialProjectInput): Promise<ResidentialProject> {
    const all = this.read();
    const project = all.find(p => p.id === id);
    if (!project) throw new Error('Not found');
    
    const updated: ResidentialProject = { 
      ...project,
      clientId: input.clientId,
      clientName: input.clientName,
      name: input.name,
      voltage: input.voltage,
      houseType: input.houseType,
      source: input.source,
      address: input.address,
      zipCode: input.zipCode,
      updatedAt: new Date().toISOString() 
    };
    
    const nextList = all.map(p => p.id === id ? updated : p);
    this.persist(nextList);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.persist(this.read().filter(p => p.id !== id));
  }

  async addEnvironment(id: string, input: ResidentialProjectEnvironmentInput): Promise<ResidentialProject> {
    const all = this.read();
    const project = all.find(p => p.id === id);
    if (!project) throw new Error('Not found');

    const env: ResidentialEnvironment = { id: crypto.randomUUID(), ...input };
    const updated: ResidentialProject = {
      ...project,
      environments: [env, ...project.environments],
      updatedAt: new Date().toISOString()
    };
    
    const nextList = all.map(p => p.id === id ? updated : p);
    this.persist(nextList);
    return updated;
  }

  async updateCanvas(id: string, updater: (canvas: ProjectCanvas) => ProjectCanvas): Promise<ResidentialProject> {
    const all = this.read();
    const project = all.find(p => p.id === id);
    if (!project) throw new Error('Not found');

    const updated: ResidentialProject = {
      ...project,
      canvas: updater(project.canvas),
      updatedAt: new Date().toISOString()
    };
    
    const nextList = all.map(p => p.id === id ? updated : p);
    this.persist(nextList);
    return updated;
  }
}

// --- Online Connector (Stub) ---

export class OnlineProjectRepository implements ProjectRepository {
  async list(): Promise<ResidentialProject[]> { return []; }
  async get(_id: string): Promise<ResidentialProject | null> { return null; }
  async create(_input: ResidentialProjectInput): Promise<ResidentialProject> { throw new Error('Offline mode only'); }
  async update(_id: string, _input: ResidentialProjectInput): Promise<ResidentialProject> { throw new Error('Offline mode only'); }
  async delete(_id: string): Promise<void> { throw new Error('Offline mode only'); }
  async addEnvironment(_id: string, _input: ResidentialProjectEnvironmentInput): Promise<ResidentialProject> { throw new Error('Offline mode only'); }
  async updateCanvas(_id: string, _updater: (canvas: ProjectCanvas) => ProjectCanvas): Promise<ResidentialProject> { throw new Error('Offline mode only'); }
}

// --- Singleton Export ---

export const projectsRepo: ProjectRepository = new LocalProjectRepository();
