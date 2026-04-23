import type { AssessmentRecord } from '../../types';
import { statusClass, statusLabel } from '../../lib/presentation';
import { EmptyDash, MiniBars, MiniRing, MiniSpark, MetricCard } from '../shared/MiniVisuals';
import './conformity.css';

type ConformityTabProps = {
  latestAssessment: AssessmentRecord | null;
};

export function ConformityTab({ latestAssessment }: ConformityTabProps) {
  const ruleWeights = latestAssessment?.verdict.rules_applied.map((rule) => rule.hierarchy_weight) ?? [];
  const ruleCount = latestAssessment?.verdict.rules_applied.length ?? 0;
  const severityScore = latestAssessment?.verdict.severity === 'high' ? 90 : latestAssessment?.verdict.severity === 'medium' ? 65 : 35;
  const reviewScore = latestAssessment?.verdict.requires_human_review ? 100 : Math.min(100, ruleCount * 18);
  const chartValues = ruleWeights.length > 0 ? ruleWeights : [1, 2, 3, 2];

  return (
    <section className="dashboard-grid conformity-feature">
      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Veredito</p>
            <h2>Conformidade</h2>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard
            label="Status"
            value={latestAssessment ? ruleCount : 0}
            caption={latestAssessment ? statusLabel(latestAssessment.verdict.status) : 'Sem veredito'}
            chart={<MiniRing value={latestAssessment ? severityScore : 0} />}
          />
          <MetricCard
            label="Regras"
            value={ruleCount}
            caption="Aplicadas"
            chart={<MiniBars values={chartValues.slice(0, 4)} />}
          />
          <MetricCard
            label="Revisão"
            value={latestAssessment?.verdict.requires_human_review ? 1 : 0}
            caption={latestAssessment?.verdict.requires_human_review ? 'Humana' : 'Automática'}
            chart={<MiniSpark values={[reviewScore, severityScore, ruleCount * 16 || 12, reviewScore]} />}
          />
        </div>
      </article>

      {latestAssessment ? (
        <>
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Resumo</p>
                <h2>{latestAssessment.verdict.standard_name}</h2>
              </div>
              <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
            </div>

            <div className="compliance-hero">
              <MiniRing value={severityScore} />
              <div className="stack tight">
                <p className="muted">
                  {latestAssessment.verdict.standard_code} · {latestAssessment.verdict.standard_version}
                </p>
                <div className="meta">
                  <span>Hierarquia {latestAssessment.verdict.standard_hierarchy}</span>
                  <span>{latestAssessment.verdict.rules_applied.length} regras</span>
                  <span>{latestAssessment.verdict.severity}</span>
                </div>
              </div>
            </div>

            <MiniSpark values={chartValues} />
          </article>

          <article className="panel">
            <div className="panel-head slim">
              <div>
                <p className="eyebrow">Regras</p>
                <h2>Aplicadas ao estudo</h2>
              </div>
            </div>

            <div className="rule-stack">
              {latestAssessment.verdict.rules_applied.slice(0, 5).map((rule) => (
                <article key={rule.rule_id} className="rule-item">
                  <div className="rule-item-head">
                    <strong>{rule.rule_id}</strong>
                    <span className="badge neutral">{rule.severity}</span>
                  </div>
                  <div className="rule-track">
                    <span className="rule-fill" style={{ width: `${Math.max(24, Math.min(100, rule.hierarchy_weight * 12))}%` }} />
                  </div>
                  <p className="muted">{rule.message}</p>
                </article>
              ))}
            </div>
          </article>
        </>
      ) : (
        <article className="panel wide-panel">
          <EmptyDash label="Execute um cálculo para gerar o veredito" />
        </article>
      )}
    </section>
  );
}
