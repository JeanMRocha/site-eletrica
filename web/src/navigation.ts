export type TabKey = 'dashboard' | 'clientes' | 'projetos' | 'catalogo' | 'normas' | 'relatorios';

export type ProjectSectionKey = 'client' | 'drawing' | 'area' | 'modeling' | 'calculation' | 'conformity';

export type TabDefinition = {
  key: TabKey;
  label: string;
  icon: string;
  path: string;
};

export type ProjectSectionDefinition = {
  key: ProjectSectionKey;
  label: string;
  icon: string;
  hint: string;
};

export const tabs: TabDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '⌂', path: '/dashboard' },
  { key: 'clientes', label: 'Clientes', icon: '◉', path: '/clientes' },
  { key: 'projetos', label: 'Projetos', icon: '▦', path: '/projetos' },
  { key: 'catalogo', label: 'Catálogo', icon: '◫', path: '/catalogo/materiais' },
  { key: 'normas', label: 'Normas', icon: '≋', path: '/normas' },
  { key: 'relatorios', label: 'Relatórios', icon: '▤', path: '/relatorios' },
];

export const projectSections: ProjectSectionDefinition[] = [
  { key: 'client', label: 'Cliente', icon: '◉', hint: 'Selecionar e abrir o projeto.' },
  { key: 'drawing', label: 'Desenho', icon: '✎', hint: 'Base visual do projeto.' },
  { key: 'area', label: 'Área', icon: '▦', hint: 'Ambientes, áreas e distâncias.' },
  { key: 'modeling', label: 'Modelagem', icon: '◫', hint: 'Cargas, circuitos e estrutura.' },
  { key: 'calculation', label: 'Cálculo', icon: '∑', hint: 'Dimensionamento e verificação.' },
  { key: 'conformity', label: 'Conformidade', icon: '☑', hint: 'Veredito e regras aplicadas.' },
];
