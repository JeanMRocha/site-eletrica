import type {
  AssessmentInput,
  AssessmentRecord,
  HierarchyLevel,
  Standard,
  Study,
  StudyDetail,
} from './types';

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.error?.message ?? payload.message ?? message;
    } catch {
      // ignore parse errors
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listStudies() {
  const payload = await request<{ studies: Study[] }>('/v1/studies');
  return payload.studies;
}

export async function listProjects() {
  return listStudies();
}

export async function createStudy(input: {
  name: string;
  client_name: string;
  location: string;
  project_type: string;
  voltage: string;
}) {
  const payload = await request<{ study: Study }>('/v1/studies', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return payload.study;
}

export async function createProject(input: {
  name: string;
  client_name: string;
  location: string;
  project_type: string;
  voltage: string;
}) {
  return createStudy(input);
}

export async function getStudy(id: string) {
  const payload = await request<StudyDetail>(`/v1/studies/${id}`);
  return payload;
}

export async function getProject(id: string) {
  return getStudy(id);
}

export async function assessStudy(id: string, input: AssessmentInput) {
  const payload = await request<{ assessment: AssessmentRecord }>(`/v1/studies/${id}/assessments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return payload.assessment;
}

export async function assessProject(id: string, input: AssessmentInput) {
  return assessStudy(id, input);
}

export async function listStandards() {
  const payload = await request<{ standards: Standard[] }>('/v1/standards/catalog');
  return payload.standards;
}

export async function listHierarchy() {
  const payload = await request<{ hierarchy: HierarchyLevel[] }>('/v1/standards/hierarchy');
  return payload.hierarchy;
}
