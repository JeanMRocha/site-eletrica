import type { AssessmentRecord, Project, Standard } from '../../types';
import { statusLabel } from '../../lib/presentation';
import { EmptyDash, MiniBars, MiniRing, MiniSpark, MetricCard } from '../shared/MiniVisuals';
import './reports.css';

type ReportsTabProps = {
  projects: Project[];
  standards: Standard[];
  latestAssessment: AssessmentRecord | null;
};

export function ReportsTab({ projects, standards, latestAssessment }: ReportsTabProps) {
  const statusScore = latestAssessment?.verdict.status === 'conforme' ? 100 : latestAssessment?.verdict.status === 'nao_conforme' ? 28 : latestAssessment ? 58 : 0;
  const trendValues = [projects.length, standards.length, latestAssessment?.verdict.rules_applied.length ?? 0, statusScore].map((value) => Math.max(1, value));

  return (
    <section className="dashboard-grid reports-feature">
      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Resumo</p>
            <h2>Painel de relatórios</h2>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard label="Projetos" value={projects.length} caption="Base ativa" chart={<MiniBars values={trendValues} />} />
          <MetricCard label="Normas" value={standards.length} caption="Catálogo" chart={<MiniSpark values={trendValues} />} />
          <MetricCard label="Status" value={statusScore} caption={latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Sem dados'} chart={<MiniRing value={statusScore} />} />
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Proporção</p>
            <h2>Base do sistema</h2>
          </div>
        </div>

        <MiniBars values={trendValues} />

        <div className="report-band">
          <div className="report-chip">
            <strong>{projects.length}</strong>
            <span>Projetos</span>
          </div>
          <div className="report-chip">
            <strong>{standards.length}</strong>
            <span>Normas</span>
          </div>
          <div className="report-chip">
            <strong>{latestAssessment?.verdict.rules_applied.length ?? 0}</strong>
            <span>Regras</span>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Veredito</p>
            <h2>Última análise</h2>
          </div>
        </div>

        {latestAssessment ? (
          <div className="report-verdict">
            <MiniRing value={statusScore} />
            <div className="stack tight">
              <strong>{latestAssessment.verdict.standard_name}</strong>
              <p className="muted">{statusLabel(latestAssessment.verdict.status)}</p>
              <div className="meta">
                <span>{latestAssessment.verdict.standard_code}</span>
                <span>{latestAssessment.verdict.rules_applied.length} regras</span>
              </div>
            </div>
            <MiniSpark values={latestAssessment.verdict.rules_applied.map((rule) => rule.hierarchy_weight).slice(0, 6)} />
          </div>
        ) : (
          <EmptyDash label="Sem análise final para montar o relatório" />
        )}
      </article>
    </section>
  );
}
