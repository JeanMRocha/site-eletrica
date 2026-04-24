import type { ResidentialProject } from '../domain/residential-projects';

export type ValidationLevel = 'info' | 'alert' | 'error';

export type ValidationFinding = {
  level: ValidationLevel;
  type: string;
  message: string;
  suggestion: string;
};

export class ElectricalValidationEngine {
  validate(project: ResidentialProject): ValidationFinding[] {
    const findings: ValidationFinding[] = [];

    if (!project.voltage.trim()) {
      findings.push({
        level: 'error',
        type: 'voltage',
        message: 'A tensão do projeto não foi definida.',
        suggestion: 'Informe a tensão antes de calcular circuitos e materiais.',
      });
    }

    if (project.environments.length === 0) {
      findings.push({
        level: 'info',
        type: 'environment',
        message: 'Nenhum ambiente foi cadastrado.',
        suggestion: 'Cadastre os ambientes da casa para permitir dimensionamento mais preciso.',
      });
    }

    if (project.canvas.items.filter((item) => item.tool === 'shower').length > 0) {
      findings.push({
        level: 'alert',
        type: 'shower',
        message: 'Há chuveiro no projeto.',
        suggestion: 'Confirme circuito dedicado e corrente compatível com a potência instalada.',
      });
    }

    if (project.canvas.items.filter((item) => item.tool === 'air-conditioner').length > 0) {
      findings.push({
        level: 'alert',
        type: 'air-conditioner',
        message: 'Há ar-condicionado no projeto.',
        suggestion: 'Verifique carga dedicada, disjuntor e seção do cabo.',
      });
    }

    return findings;
  }
}

export const electricalValidationEngine = new ElectricalValidationEngine();
