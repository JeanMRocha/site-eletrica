export type {
  AssessmentInput,
  AssessmentRecord,
  AssessmentRule,
  Project,
  ProjectDetail,
  ProjectInput,
  Verdict,
} from './domain/projects';

export type { HierarchyLevel, Standard } from './domain/standards';

// --- Geo / Location Types ---

export type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeCity = {
  id: number;
  nome: string;
};

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};
