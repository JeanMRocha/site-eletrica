import type { ResidentialProject } from '../domain/residential-projects';

export type MaterialLine = {
  item: string;
  quantity: number;
  unit: string;
  cost: number;
};

export type ElectricalCalculationResult = {
  totalPowerW: number;
  circuitCount: number;
  estimatedCurrentA: number;
  breakerSuggestion: string;
  cableSuggestion: string;
  estimatedMeters: number;
  materials: MaterialLine[];
  totalCost: number;
};

export class ElectricalCalculationService {
  calculate(project: ResidentialProject): ElectricalCalculationResult {
    const totalPowerW = Math.max(0, project.canvas.items.length * 1200 + project.environments.length * 450);
    const estimatedCurrentA = project.voltage.includes('220') ? totalPowerW / 220 : totalPowerW / 127;
    const circuitCount = Math.max(1, project.environments.length + Math.ceil(project.canvas.items.length / 4));
    const breakerSuggestion = estimatedCurrentA <= 10 ? '10A' : estimatedCurrentA <= 16 ? '16A' : estimatedCurrentA <= 20 ? '20A' : '32A';
    const cableSuggestion = estimatedCurrentA <= 10 ? '2,5 mm²' : estimatedCurrentA <= 16 ? '4 mm²' : estimatedCurrentA <= 20 ? '6 mm²' : '10 mm²';
    const estimatedMeters = Math.max(20, project.environments.length * 12 + project.canvas.items.length * 4);
    const materials: MaterialLine[] = [
      { item: 'Cabos', quantity: estimatedMeters, unit: 'm', cost: estimatedMeters * 3.2 },
      { item: 'Disjuntores', quantity: circuitCount, unit: 'un', cost: circuitCount * 28 },
      { item: 'Caixas', quantity: Math.max(1, project.environments.length + 2), unit: 'un', cost: Math.max(1, project.environments.length + 2) * 9 },
    ];
    const totalCost = materials.reduce((sum, entry) => sum + entry.cost, 0);

    return {
      totalPowerW,
      circuitCount,
      estimatedCurrentA,
      breakerSuggestion,
      cableSuggestion,
      estimatedMeters,
      materials,
      totalCost,
    };
  }
}

export const electricalCalculationService = new ElectricalCalculationService();
