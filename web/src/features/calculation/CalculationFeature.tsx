import type { FormEvent } from 'react';
import type { AssessmentInput, AssessmentRecord, Standard } from '../../types';
import { assessmentsCount, formatDate, statusClass, statusLabel } from '../../lib/presentation';
import { EmptyDash, MiniBars, MiniRing, MiniSpark, MetricCard } from '../shared/MiniVisuals';
import './calculation.css';

type CalculationTabProps = {
  assessmentForm: AssessmentInput;
  standards: Standard[];
  detail: { assessments?: AssessmentRecord[] } | null;
  latestAssessment: AssessmentRecord | null;
  saving: boolean;
  onChangeAssessment: (updater: (current: AssessmentInput) => AssessmentInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function CalculationTab({
  assessmentForm,
  standards,
  detail,
  latestAssessment,
  saving,
  onChangeAssessment,
  onSubmit,
}: CalculationTabProps) {
  const inputValues = [
    assessmentForm.current_project_a,
    assessmentForm.conductor_mm2,
    assessmentForm.breaker_a,
    assessmentForm.voltage_drop_percent,
  ].map((value) => Math.max(1, Number.isFinite(value) ? value : 0));
  const loadScore = Math.min(100, Math.round((assessmentForm.current_project_a + assessmentForm.breaker_a) / 2));
  const ruleCount = latestAssessment?.verdict.rules_applied.length ?? 0;
  const reviewScore = latestAssessment?.verdict.requires_human_review ? 100 : Math.min(100, Math.max(16, ruleCount * 18));

  return (
    <section className="dashboard-grid calculation-feature">
      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Dimensionamento</h2>
          </div>
          <span className="badge neutral">{assessmentForm.standard_version}</span>
        </div>

        <div className="metric-grid">
          <MetricCard label="Norma" value={standards.length} caption={assessmentForm.standard_code} chart={<MiniBars values={inputValues} />} />
          <MetricCard label="Circuito" value={assessmentsCount(detail?.assessments)} caption={assessmentForm.circuit_id} chart={<MiniSpark values={inputValues} />} />
          <MetricCard label="Carga" value={Math.round(assessmentForm.current_project_a)} caption="A" chart={<MiniRing value={loadScore} />} />
        </div>

        <div className="calculation-slab">
          <div className="calculation-slab-copy">
            <p className="eyebrow">Entrada rápida</p>
            <h3>Fluxo resumido antes do cálculo</h3>
            <p className="muted">Os campos ficam recolhidos por padrão e o resultado aparece no painel ao lado.</p>
          </div>
          <MiniBars values={inputValues} />
        </div>

        <details className="details-box">
          <summary>Editar entrada</summary>
          <form onSubmit={onSubmit}>
            <div className="form-grid three">
              <label>
                <span>Circuito</span>
                <input value={assessmentForm.circuit_id} onChange={(event) => onChangeAssessment((current) => ({ ...current, circuit_id: event.target.value }))} />
              </label>
              <label>
                <span>Norma</span>
                <select value={assessmentForm.standard_code} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_code: event.target.value }))}>
                  {standards.map((standard) => (
                    <option key={standard.code} value={standard.code}>
                      {standard.code}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Versão</span>
                <input value={assessmentForm.standard_version} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_version: event.target.value }))} />
              </label>
            </div>
            <div className="form-grid three">
              <label>
                <span>Corrente</span>
                <input type="number" step="0.1" value={assessmentForm.current_project_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, current_project_a: Number(event.target.value) }))} />
              </label>
              <label>
                <span>Condutor</span>
                <input type="number" step="0.1" value={assessmentForm.conductor_mm2} onChange={(event) => onChangeAssessment((current) => ({ ...current, conductor_mm2: Number(event.target.value) }))} />
              </label>
              <label>
                <span>Disjuntor</span>
                <input type="number" step="0.1" value={assessmentForm.breaker_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, breaker_a: Number(event.target.value) }))} />
              </label>
            </div>
            <div className="form-grid three">
              <label>
                <span>Queda</span>
                <input type="number" step="0.1" value={assessmentForm.voltage_drop_percent} onChange={(event) => onChangeAssessment((current) => ({ ...current, voltage_drop_percent: Number(event.target.value) }))} />
              </label>
              <label>
                <span>Método</span>
                <input value={assessmentForm.installation_method} onChange={(event) => onChangeAssessment((current) => ({ ...current, installation_method: event.target.value }))} />
              </label>
              <label>
                <span>Ambiente</span>
                <input value={assessmentForm.environment_type} onChange={(event) => onChangeAssessment((current) => ({ ...current, environment_type: event.target.value }))} />
              </label>
            </div>
            <button className="button" disabled={saving} type="submit">
              {saving ? 'Calculando...' : 'Executar cálculo'}
            </button>
          </form>
        </details>
      </article>

      {latestAssessment ? (
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>Último cálculo</h2>
            </div>
            <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
          </div>

          <div className="result-visual">
            <MiniRing value={reviewScore} />
            <div className="stack tight">
              <strong>{latestAssessment.verdict.standard_name}</strong>
              <p className="muted">
                {latestAssessment.verdict.standard_code} · {formatDate(latestAssessment.created_at)}
              </p>
              <div className="meta">
                <span>{latestAssessment.verdict.rules_applied.length} regras</span>
                <span>{latestAssessment.verdict.severity}</span>
                <span>{latestAssessment.verdict.requires_human_review ? 'Revisão' : 'Automático'}</span>
              </div>
            </div>
          </div>

          <MiniSpark values={latestAssessment.verdict.rules_applied.map((rule) => rule.hierarchy_weight).slice(0, 6)} />

          <div className="rule-stack">
            {latestAssessment.verdict.rules_applied.slice(0, 4).map((rule) => (
              <article key={rule.rule_id} className="rule-item">
                <div className="rule-item-head">
                  <strong>{rule.rule_id}</strong>
                  <span className="badge neutral">{rule.origin_type}</span>
                </div>
                <div className="rule-track">
                  <span className="rule-fill" style={{ width: `${Math.max(24, Math.min(100, rule.hierarchy_weight * 12))}%` }} />
                </div>
                <p className="muted">{rule.message}</p>
              </article>
            ))}
          </div>
        </article>
      ) : (
        <article className="panel">
          <EmptyDash label="Sem resultado ainda. Execute o cálculo para preencher o painel" />
        </article>
      )}
    </section>
  );
}
