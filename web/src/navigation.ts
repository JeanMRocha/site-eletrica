export type TabKey = 'home' | 'project' | 'standards' | 'reports';

export type ProjectSectionKey = 'client' | 'drawing' | 'area' | 'modeling' | 'calculation' | 'conformity';

export type TabDefinition = {
  key: TabKey;
  label: string;
  icon: string;
};

export type ProjectSectionDefinition = {
  key: ProjectSectionKey;
  label: string;
  icon: string;
  hint: string;
};

export const tabs: TabDefinition[] = [
  { key: 'home', label: 'Início', icon: '⌂' },
  { key: 'project', label: 'Cliente', icon: '◉' },
  { key: 'standards', label: 'Normas', icon: '≋' },
  { key: 'reports', label: 'Relatórios', icon: '▤' },
];

export const projectSections: ProjectSectionDefinition[] = [
  { key: 'client', label: 'Cliente', icon: '◉', hint: 'Selecionar e abrir o projeto.' },
  { key: 'drawing', label: 'Desenho', icon: '✎', hint: 'Base visual do projeto.' },
  { key: 'area', label: 'Área', icon: '▦', hint: 'Ambientes, áreas e distâncias.' },
  { key: 'modeling', label: 'Modelagem', icon: '◫', hint: 'Cargas, circuitos e estrutura.' },
  { key: 'calculation', label: 'Cálculo', icon: '∑', hint: 'Dimensionamento e verificação.' },
  { key: 'conformity', label: 'Conformidade', icon: '☑', hint: 'Veredito e regras aplicadas.' },
];
