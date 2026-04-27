export type TabKey = 'dashboard' | 'clientes' | 'projetos' | 'catalogo' | 'normas' | 'relatorios' | 'intelligence';

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
  { key: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { key: 'clientes', label: 'Clientes', icon: '👥', path: '/clientes' },
  { key: 'projetos', label: 'Projetos', icon: '⚡', path: '/projetos' },
  { key: 'catalogo', label: 'Catálogo', icon: '📦', path: '/catalogo/materiais' },
  { key: 'normas', label: 'Normas', icon: '📚', path: '/normas' },
  { key: 'relatorios', label: 'Relatórios', icon: '📊', path: '/relatorios' },
  { key: 'intelligence', label: 'Inteligência', icon: '🧠', path: '/inteligencia' },
];

export const projectSections: ProjectSectionDefinition[] = [
  { key: 'client', label: 'Cliente', icon: '👥', hint: 'Dados do proprietário.' },
  { key: 'drawing', label: 'Projetador', icon: '🎨', hint: 'Desenho técnico e canvas.' },
  { key: 'area', label: 'Ambientes', icon: '📐', hint: 'Áreas e dimensões.' },
  { key: 'modeling', label: 'Modelagem', icon: '🏗️', hint: 'Cargas e circuitos.' },
  { key: 'calculation', label: 'Cálculo', icon: '🧮', hint: 'Dimensionamento elétrico.' },
  { key: 'conformity', label: 'Normas', icon: '✅', hint: 'Verificação de conformidade.' },
];
