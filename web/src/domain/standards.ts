import { request } from './http';
import { getFromLocal, saveToLocal } from '../lib/storage';

// --- Domain Types ---

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

// --- Repository Port ---

export interface StandardRepository {
  list(): Promise<Standard[]>;
  listHierarchy(): Promise<HierarchyLevel[]>;
}

// --- Implementation (Hybrid/Local Cache) ---

class ApiStandardRepository implements StandardRepository {
  private CACHE_KEY = 'electrica:standards:cache';

  async list(): Promise<Standard[]> {
    try {
      const payload = await request<{ standards: Standard[] }>('/v1/standards/catalog');
      saveToLocal(this.CACHE_KEY, payload.standards);
      return payload.standards;
    } catch (err) {
      console.warn('Falha ao buscar normas da API, tentando cache local:', err);
      return getFromLocal<Standard[]>(this.CACHE_KEY) || [];
    }
  }

  async listHierarchy(): Promise<HierarchyLevel[]> {
    try {
      const payload = await request<{ hierarchy: HierarchyLevel[] }>('/v1/standards/hierarchy');
      return payload.hierarchy;
    } catch (err) {
      console.warn('Falha ao buscar hierarquia da API:', err);
      return [];
    }
  }
}

export const standardRepository: StandardRepository = new ApiStandardRepository();

// --- Backward Compatibility Exports ---

export const listStandards = () => standardRepository.list();
export const listHierarchy = () => standardRepository.listHierarchy();
