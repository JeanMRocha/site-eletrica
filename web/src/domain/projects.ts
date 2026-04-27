

// --- Domain Types ---

export type Project = {
  id: string;
  name: string;
  city: string;
  state: string;
  zip?: string;
  location: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  street?: string;
  number?: string;
  district?: string;
  complement?: string;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  name: string;
  city: string;
  state: string;
  zip?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  street?: string;
  number?: string;
  district?: string;
  complement?: string;
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

// --- API Implementation ---

class ApiProjectRepository implements ProjectRepository {
  private baseUrl = 'http://localhost:8081/v1/studies';

  async list(): Promise<Project[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) return [];
    return res.json();
  }

  async get(id: string): Promise<ProjectDetail> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  }

  async create(input: ProjectInput): Promise<Project> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  async update(id: string, input: ProjectUpdateInput): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }

  async assess(id: string, input: AssessmentInput): Promise<AssessmentRecord> {
    const res = await fetch(`${this.baseUrl}/${id}/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }
}

// --- Factory/Singleton ---

export const projectRepository: ProjectRepository = new ApiProjectRepository();

// --- Export individual functions for backward compatibility with UI ---
// These now simply delegate to the repository instance.

export const listProjects = () => projectRepository.list();
export const getProject = (id: string) => projectRepository.get(id);
export const createProject = (input: ProjectInput) => projectRepository.create(input);
export const updateProject = (id: string, input: ProjectUpdateInput) => projectRepository.update(id, input);
export const deleteProject = (id: string) => projectRepository.delete(id);
export const assessProject = (id: string, input: AssessmentInput) => projectRepository.assess(id, input);
