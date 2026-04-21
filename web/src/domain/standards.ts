import { request } from './http';

export type Standard = {
  code: string;
  title: string;
  domain: string;
  subject: string;
  version: string;
  status: string;
  source_type: string;
  source_name?: string;
  hierarchy_weight: number;
  applies_to?: string[];
  notes?: string[];
};

export type HierarchyLevel = {
  id: string;
  weight: number;
};

export async function listStandards() {
  const payload = await request<{ standards: Standard[] }>('/v1/standards/catalog');
  return payload.standards;
}

export async function listHierarchy() {
  const payload = await request<{ hierarchy: HierarchyLevel[] }>('/v1/standards/hierarchy');
  return payload.hierarchy;
}
