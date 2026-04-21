import type { AssessmentRecord, HierarchyLevel, Standard } from '../types';

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function statusLabel(status: string) {
  switch (status) {
    case 'conforme':
      return 'Conforme';
    case 'nao_conforme':
      return 'Não conforme';
    case 'incompleto':
      return 'Incompleto';
    case 'revisao_humana':
      return 'Revisão humana';
    default:
      return 'Pendente';
  }
}

export function statusClass(status: string) {
  switch (status) {
    case 'conforme':
      return 'ok';
    case 'nao_conforme':
      return 'bad';
    case 'incompleto':
      return 'warn';
    default:
      return 'neutral';
  }
}

export function initialsFromName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'SE';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function sortHierarchy(levels: HierarchyLevel[]) {
  return [...levels].sort((a, b) => b.weight - a.weight);
}

export function sortStandards(standards: Standard[]) {
  return [...standards].sort((a, b) => b.hierarchy_weight - a.hierarchy_weight || a.code.localeCompare(b.code));
}

export function assessmentsCount(assessments?: AssessmentRecord[]) {
  return assessments?.length ?? 0;
}
