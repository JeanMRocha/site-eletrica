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
  visible?: boolean;
  locked?: boolean;
  noPrint?: boolean;
  points?: { x: number; y: number; curvature?: number }[];
};

// Graph-based Wall System (Arcada Inspired)
export type CanvasNode = {
  id: string;
  x: number;
  y: number;
  visible?: boolean;
  locked?: boolean;
  noPrint?: boolean;
};

export type CanvasLink = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  thickness: number;
  type: 'wall' | 'opening';
  visible?: boolean;
  locked?: boolean;
  noPrint?: boolean;
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

// --- API Implementation (Wails/Go Backend) ---

export class ApiProjectRepository implements ProjectRepository {
  private baseUrl = 'http://localhost:8081/v1/studies';

  async list(): Promise<ResidentialProject[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) return [];
    const text = await res.text();
    const data = JSON.parse(text.trim());
    const studies = data.studies || data;
    return (studies || []).map((p: any) => this.mapToResidential(p));
  }

  async get(id: string): Promise<ResidentialProject | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) return null;
    const text = await res.text();
    const data = JSON.parse(text.trim());
    return this.mapToResidential(data.study || data);
  }

  async create(input: ResidentialProjectInput): Promise<ResidentialProject> {
    const payload = {
      name: input.name,
      city: input.city,
      state: input.state,
      metadata: JSON.stringify(input)
    };
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    const data = JSON.parse(text.trim());
    return this.mapToResidential(data.study || data);
  }

  async update(id: string, input: ResidentialProjectInput): Promise<ResidentialProject> {
    const payload = {
      name: input.name,
      city: input.city,
      state: input.state,
      metadata: JSON.stringify(input)
    };
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    const data = JSON.parse(text.trim());
    return this.mapToResidential(data.study || data);
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }

  async addEnvironment(id: string, input: ResidentialProjectEnvironmentInput): Promise<ResidentialProject> {
    // Para simplificar no MVP, salvamos ambientes como parte do 'update' ou mockamos se o backend for limitado
    const project = await this.get(id);
    if (!project) throw new Error('Not found');
    
    const env = { id: crypto.randomUUID(), ...input };
    const updated = { ...project, environments: [env, ...project.environments] };
    return this.update(id, updated as any);
  }

  async updateCanvas(id: string, updater: (canvas: ProjectCanvas) => ProjectCanvas): Promise<ResidentialProject> {
    const project = await this.get(id);
    if (!project) throw new Error('Not found');
    const updated = { ...project, canvas: updater(project.canvas) };
    return this.update(id, updated as any);
  }

  private mapToResidential(apiStudy: any): ResidentialProject {
    let meta: any = {};
    try {
      if (apiStudy.metadata) {
        meta = JSON.parse(apiStudy.metadata);
      }
    } catch (e) {
      console.error('Failed to parse metadata', e);
    }

    return {
      id: apiStudy.id,
      clientId: meta.clientId || apiStudy.clientId || '',
      clientName: meta.clientName || apiStudy.clientName || apiStudy.name,
      name: apiStudy.name,
      voltage: meta.voltage || apiStudy.voltage || '127/220V',
      houseType: meta.houseType || apiStudy.houseType || 'padrao',
      source: meta.source || apiStudy.source || ['rede'],
      status: meta.status || apiStudy.status || 'draft',
      environments: meta.environments || apiStudy.environments || [],
      canvas: meta.canvas || apiStudy.canvas || { nodes: [], links: [], items: [], selectedTool: 'select' },
      createdAt: apiStudy.created_at,
      updatedAt: apiStudy.updated_at,
      city: apiStudy.city,
      state: apiStudy.state,
      address: `${apiStudy.city} / ${apiStudy.state}`,
      zipCode: meta.zipCode || apiStudy.zipCode || '',
      street: meta.street || apiStudy.street || '',
      number: meta.number || apiStudy.number || '',
      district: meta.district || apiStudy.district || '',
      complement: meta.complement || apiStudy.complement || '',
    };
  }
}

// --- Singleton Export ---

export const projectsRepo: ProjectRepository = new ApiProjectRepository();
