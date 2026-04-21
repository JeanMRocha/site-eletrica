import type { AssessmentRecord, Project, Standard } from '../../types';
import { statusLabel } from '../../lib/presentation';
import './reports.css';

type ReportsTabProps = {
  projects: Project[];
  standards: Standard[];
  latestAssessment: AssessmentRecord | null;
};

export function ReportsTab({ projects, standards, latestAssessment }: ReportsTabProps) {
  return (
    <section className="dashboard-grid reports-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Relatórios</h2>
          </div>
        </div>
        <div className="summary-strip">
          <div className="mini-card">
            <span>Projetos</span>
            <strong>{projects.length}</strong>
          </div>
          <div className="mini-card">
            <span>Normas</span>
            <strong>{standards.length}</strong>
          </div>
          <div className="mini-card">
            <span>Veredito</span>
            <strong>{latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Sem dados'}</strong>
          </div>
        </div>
        <div className="actions-grid">
          <button className="ghost" type="button">
            Exportar memorial
          </button>
          <button className="ghost" type="button">
            Lista de materiais
          </button>
          <button className="ghost" type="button">
            Resumo executivo
          </button>
        </div>
      </article>
    </section>
  );
}
