import { getResidentialProject, updateResidentialProjectCanvas, type ProjectCanvas, type ResidentialProject } from '../../domain/residential-projects';

export type ProjectCanvasRepository = {
  get(projectId: string): ResidentialProject | null;
  updateCanvas(projectId: string, updater: (canvas: ProjectCanvas) => ProjectCanvas): ResidentialProject;
};

export const localProjectCanvasRepository: ProjectCanvasRepository = {
  get: getResidentialProject,
  updateCanvas: updateResidentialProjectCanvas,
};
