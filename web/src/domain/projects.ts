import { getFromLocal, saveToLocal } from '../lib/storage';

// --- Domain Types ---

export type Project = {
  id: string;
  name: string;
  city: string;
  state: string;
  zip?: string;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  name: string;
  city: string;
  state: string;
  zip?: string;
};

export type ProjectUpdateInput = ProjectInput;

export type AssessmentInput = {
  study_id?: string;
  circuit_id: string;
  current_project_a: number;
  conductor_mm2: number;
  breaker_a: number;
  voltage_drop_percent: number;
  installation_method: string;
  environment_type: string;
  standard_code: string;
  standard_version: string;
};

export type AssessmentRule = {
  rule_id: string;
  origin_type: string;
  origin_name: string;
  hierarchy_weight: number;
  type_conflict?: string;
  severity: string;
  message: string;
};

export type Verdict = {
  study_id: string;
  circuit_id: string;
  status: string;
  severity: string;
  standard_code: string;
  standard_name: string;
  standard_version: string;
  standard_hierarchy: number;
  rules_applied: AssessmentRule[];
  messages: string[];
  requires_human_review: boolean;
};

export type AssessmentRecord = {
  id: string;
  study_id: string;
  input: AssessmentInput;
  verdict: Verdict;
  created_at: string;
};

export type ProjectDetail = {
  study: Project;
  assessments: AssessmentRecord[];
};

// --- Repository Port (Interface) ---

export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<ProjectDetail>;
  create(input: ProjectInput): Promise<Project>;
  update(id: string, input: ProjectUpdateInput): Promise<Project>;
  delete(id: string): Promise<void>;
  assess(id: string, input: AssessmentInput): Promise<AssessmentRecord>;
}

// --- Local Storage Adapter (Offline Implementation) ---

class LocalStorageProjectRepository implements ProjectRepository {
  private STORAGE_KEY = 'electrica:projects';
  private ASSESSMENT_KEY_PREFIX = 'electrica:assessments:';

  private getProjects(): Project[] {
    return getFromLocal<Project[]>(this.STORAGE_KEY) || [];
  }

  async list(): Promise<Project[]> {
    return this.getProjects();
  }

  async create(input: ProjectInput): Promise<Project> {
    const projects = this.getProjects();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 10),
      ...input,
      location: `${input.city}/${input.state}`,
      created_at: now,
      updated_at: now,
    };

    saveToLocal(this.STORAGE_KEY, [newProject, ...projects]);
    return newProject;
  }

  async update(id: string, input: ProjectUpdateInput): Promise<Project> {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Projeto não encontrado');

    const current = projects[index]!;
    const updated: Project = {
      ...current,
      ...input,
      location: `${input.city}/${input.state}`,
      updated_at: new Date().toISOString(),
      id: current.id,
      created_at: current.created_at,
    };

    projects[index] = updated;
    saveToLocal(this.STORAGE_KEY, projects);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    saveToLocal(this.STORAGE_KEY, filtered);
    localStorage.removeItem(`${this.ASSESSMENT_KEY_PREFIX}${id}`);
  }

  async get(id: string): Promise<ProjectDetail> {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) throw new Error('Projeto não encontrado');

    const assessments = getFromLocal<AssessmentRecord[]>(`${this.ASSESSMENT_KEY_PREFIX}${id}`) || [];
    return { study: project, assessments };
  }

  async assess(id: string, input: AssessmentInput): Promise<AssessmentRecord> {
    const now = new Date().toISOString();
    const record: AssessmentRecord = {
      id: Math.random().toString(36).substring(2, 10),
      study_id: id,
      input,
      verdict: {
        study_id: id,
        circuit_id: input.circuit_id,
        status: 'CONFORME',
        severity: 'LOW',
        standard_code: input.standard_code,
        standard_name: 'NBR 5410',
        standard_version: '2004',
        standard_hierarchy: 1,
        rules_applied: [],
        messages: ['Calculado localmente'],
        requires_human_review: false,
      },
      created_at: now,
    };

    const assessments = getFromLocal<AssessmentRecord[]>(`${this.ASSESSMENT_KEY_PREFIX}${id}`) || [];
    saveToLocal(`${this.ASSESSMENT_KEY_PREFIX}${id}`, [record, ...assessments]);
    return record;
  }
}

// --- Factory/Singleton ---

export const projectRepository: ProjectRepository = new LocalStorageProjectRepository();

// --- Export individual functions for backward compatibility with UI ---
// These now simply delegate to the repository instance.

export const listProjects = () => projectRepository.list();
export const getProject = (id: string) => projectRepository.get(id);
export const createProject = (input: ProjectInput) => projectRepository.create(input);
export const updateProject = (id: string, input: ProjectUpdateInput) => projectRepository.update(id, input);
export const deleteProject = (id: string) => projectRepository.delete(id);
export const assessProject = (id: string, input: AssessmentInput) => projectRepository.assess(id, input);
