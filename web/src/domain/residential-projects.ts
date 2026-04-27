export type ResidentialProjectStatus = 'draft' | 'designing' | 'review' | 'approved';
export type HouseType = 'padrao' | 'terrea' | 'sobrado' | 'geminada';
export type NetworkSource = 'rede' | 'solar' | 'gerador';

export type CanvasTool =
  | 'select'
  | 'pan'
  | 'wall'
  | 'site-area'
  | 'source-post'
  | 'source-solar'
  | 'source-generator'
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
  isPendingSync?: boolean;
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
  locked?: boolean;
  hidden?: boolean;
  noPrint?: boolean;
  points?: { x: number; y: number; curvature?: number }[];
};

// Graph-based Wall System (Arcada Inspired)
export type CanvasNode = {
  id: string;
  x: number;
  y: number;
};

export type CanvasLink = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  thickness: number;
  type: 'wall' | 'opening';
};

export type CanvasSettings = {
  visualGrid: boolean;
  snapToGrid: boolean;
  showDimensions?: boolean;
  unit: 'm' | 'cm' | 'mm';
  scale: number;
  precision: number; // Decimal places
  angleFormat: 'DD' | 'DMS';
  layers?: {
    terrain: boolean;
    walls: boolean;
    electrical: boolean;
  };
};

export type ProjectCanvas = {
  items: CanvasItem[];
  nodes: CanvasNode[];
  links: CanvasLink[];
  selectedTool: CanvasTool;
  settings?: CanvasSettings;
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
  
  zipCode?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  complement?: string;
  address?: string;

  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
  isPendingSync?: boolean;
};

export type ResidentialProjectInput = {
  clientId: string;
  clientName: string;
  name: string;
  voltage: string;
  houseType: HouseType;
  source: NetworkSource[];
  
  zipCode?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  complement?: string;
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
    if (!raw) return [];
    
    const data = JSON.parse(raw);
    return data.map((p: any) => {
      if (p.canvas && p.canvas.items) {
        p.canvas.items = p.canvas.items.map((item: any) => ({
          ...item,
          tool: item.tool === 'environment' ? 'site-area' : item.tool
        }));
      }
      return p;
    });
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
      zipCode: input.zipCode,
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      complement: input.complement,
      address: `${input.street || ''}, ${input.number || ''} - ${input.city || ''}`,
      status: 'draft',
      environments: [],
      canvas: { 
        nodes: [], 
        links: [], 
        items: [], 
        selectedTool: 'select',
        settings: { 
          visualGrid: true, 
          snapToGrid: true,
          showDimensions: true,
          unit: 'm',
          scale: 1,
          precision: 2,
          angleFormat: 'DD',
          layers: { terrain: true, walls: true, electrical: true }
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSync: true,
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
      zipCode: input.zipCode,
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      complement: input.complement,
      address: `${input.street || ''}, ${input.number || ''} - ${input.city || ''}`,
      updatedAt: new Date().toISOString(),
      isPendingSync: true,
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

    const env: ResidentialEnvironment = { id: crypto.randomUUID(), ...input, isPendingSync: true };
    const updated: ResidentialProject = {
      ...project,
      environments: [env, ...project.environments],
      updatedAt: new Date().toISOString(),
      isPendingSync: true
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
      updatedAt: new Date().toISOString(),
      isPendingSync: true
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
