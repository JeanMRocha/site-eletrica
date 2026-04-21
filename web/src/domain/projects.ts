import { request } from './http';

export type Project = {
  id: string;
  name: string;
  city: string;
  state: string;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  name: string;
  city: string;
  state: string;
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

export async function listProjects() {
  const payload = await request<{ studies: Project[] }>('/v1/studies');
  return payload.studies;
}

export async function createProject(input: ProjectInput) {
  const payload = await request<{ study: Project }>('/v1/studies', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return payload.study;
}

export async function updateProject(id: string, input: ProjectUpdateInput) {
  const payload = await request<{ study: Project }>(`/v1/studies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  return payload.study;
}

export async function deleteProject(id: string) {
  await request<{ deleted: string }>(`/v1/studies/${id}`, {
    method: 'DELETE',
  });
}

export async function getProject(id: string) {
  const payload = await request<ProjectDetail>(`/v1/studies/${id}`);
  return payload;
}

export async function assessProject(id: string, input: AssessmentInput) {
  const payload = await request<{ assessment: AssessmentRecord }>(`/v1/studies/${id}/assessments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return payload.assessment;
}
