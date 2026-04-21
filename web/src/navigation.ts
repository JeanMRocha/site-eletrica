export type TabKey = 'home' | 'project' | 'standards' | 'modeling' | 'calculation' | 'conformity' | 'reports';

export type TabDefinition = {
  key: TabKey;
  label: string;
  hint: string;
};

export const tabs: TabDefinition[] = [
  { key: 'home', label: 'Home', hint: 'consolidação geral' },
  { key: 'project', label: 'Projetos', hint: 'lista consolidada' },
  { key: 'standards', label: 'Normas', hint: 'hierarquia e versões' },
  { key: 'modeling', label: 'Modelagem', hint: 'ambientes e cargas' },
  { key: 'calculation', label: 'Cálculo', hint: 'dimensionamento' },
  { key: 'conformity', label: 'Conformidade', hint: 'veredito técnico' },
  { key: 'reports', label: 'Relatórios', hint: 'saídas consolidadas' },
];
