export type Session = {
  name: string;
  image: string;
};

export type EnvironmentItem = {
  id: string;
  name: string;
  area: string;
  usage: string;
  distance: string;
};

export type LoadItem = {
  id: string;
  name: string;
  category: string;
  power: string;
  quantity: string;
};

export type CircuitItem = {
  id: string;
  name: string;
  environment: string;
  breaker: string;
  conductor: string;
};

export type Workspace = {
  environments: EnvironmentItem[];
  loads: LoadItem[];
  circuits: CircuitItem[];
};

export type ProjectForm = {
  name: string;
  client_name: string;
  location: string;
  project_type: string;
  voltage: string;
};

export const defaultSession: Session = { name: '', image: '' };
export const defaultWorkspace: Workspace = { environments: [], loads: [], circuits: [] };
export const defaultProjectForm: ProjectForm = {
  name: 'Projeto piloto',
  client_name: 'Cliente teste',
  location: 'Campinas/SP',
  project_type: 'residencial',
  voltage: '127/220 V',
};
