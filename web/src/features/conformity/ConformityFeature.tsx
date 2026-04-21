import type { AssessmentRecord } from '../../types';
import { statusClass, statusLabel } from '../../lib/presentation';
import './conformity.css';

type ConformityTabProps = {
  latestAssessment: AssessmentRecord | null;
};

export function ConformityTab({ latestAssessment }: ConformityTabProps) {
  return (
    <section className="dashboard-grid conformity-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Veredito</p>
            <h2>Conformidade</h2>
          </div>
        </div>
        {latestAssessment ? (
          <div className="compliance-grid">
            <article className="verdict-card">
              <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
              <strong>{latestAssessment.verdict.standard_name}</strong>
              <p className="muted">
                {latestAssessment.verdict.standard_code} · {latestAssessment.verdict.standard_version}
              </p>
            </article>
            <div className="stack">
              {latestAssessment.verdict.rules_applied.map((rule) => (
                <article key={rule.rule_id} className="mini-card">
                  <strong>{rule.rule_id}</strong>
                  <span>{rule.message}</span>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="item">
            <strong>Sem veredito.</strong>
            <p className="muted">Execute um cálculo para conferir as regras aplicadas.</p>
          </div>
        )}
      </article>
    </section>
  );
}
