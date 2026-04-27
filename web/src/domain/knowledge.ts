import { request } from './http';

export type KnowledgeEntry = {
  id: string;
  title: string;
  status: 'curated' | 'draft' | 'raw';
  tags: string[];
  content: string;
  category: 'constraint' | 'landmark' | 'skill';
  severity?: string;
  createdAt: string;
};

export async function listKnowledge(): Promise<KnowledgeEntry[]> {
  try {
    return await request<KnowledgeEntry[]>('/v1/knowledge');
  } catch (err) {
    console.error('Falha ao buscar memórias (MOM) do backend:', err);
    // Fallback para lista vazia se o backend estiver offline
    return [];
  }
}
