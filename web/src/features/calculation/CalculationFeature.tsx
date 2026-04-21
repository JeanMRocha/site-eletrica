import type { FormEvent } from 'react';
import type { AssessmentInput, AssessmentRecord, Standard } from '../../types';
import { formatDate, statusClass, statusLabel, assessmentsCount } from '../../lib/presentation';
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
  return (
    <section className="dashboard-grid calculation-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Dimensionamento</h2>
          </div>
          <span className="badge neutral">{assessmentForm.standard_version}</span>
        </div>
        <div className="summary-strip">
          <div className="mini-card">
            <span>Norma</span>
            <strong>{assessmentForm.standard_code}</strong>
          </div>
          <div className="mini-card">
            <span>Circuito</span>
            <strong>{assessmentForm.circuit_id}</strong>
          </div>
          <div className="mini-card">
            <span>Cálculos</span>
            <strong>{assessmentsCount(detail?.assessments)}</strong>
          </div>
        </div>
        <details className="details-box">
          <summary>Executar cálculo</summary>
          <form onSubmit={onSubmit}>
            <div className="form-grid three">
              <label>
                <input value={assessmentForm.circuit_id} onChange={(event) => onChangeAssessment((current) => ({ ...current, circuit_id: event.target.value }))} />
              </label>
              <label>
                <select value={assessmentForm.standard_code} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_code: event.target.value }))}>
                  {standards.map((standard) => (
                    <option key={standard.code} value={standard.code}>
                      {standard.code}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <input value={assessmentForm.standard_version} onChange={(event) => onChangeAssessment((current) => ({ ...current, standard_version: event.target.value }))} />
              </label>
            </div>
            <div className="form-grid three">
              <label>
                <input type="number" step="0.1" value={assessmentForm.current_project_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, current_project_a: Number(event.target.value) }))} />
              </label>
              <label>
                <input type="number" step="0.1" value={assessmentForm.conductor_mm2} onChange={(event) => onChangeAssessment((current) => ({ ...current, conductor_mm2: Number(event.target.value) }))} />
              </label>
              <label>
                <input type="number" step="0.1" value={assessmentForm.breaker_a} onChange={(event) => onChangeAssessment((current) => ({ ...current, breaker_a: Number(event.target.value) }))} />
              </label>
            </div>
            <div className="form-grid three">
              <label>
                <input type="number" step="0.1" value={assessmentForm.voltage_drop_percent} onChange={(event) => onChangeAssessment((current) => ({ ...current, voltage_drop_percent: Number(event.target.value) }))} />
              </label>
              <label>
                <input value={assessmentForm.installation_method} onChange={(event) => onChangeAssessment((current) => ({ ...current, installation_method: event.target.value }))} />
              </label>
              <label>
                <input value={assessmentForm.environment_type} onChange={(event) => onChangeAssessment((current) => ({ ...current, environment_type: event.target.value }))} />
              </label>
            </div>
            <button className="button" disabled={saving} type="submit">
              {saving ? 'Calculando...' : 'Executar cálculo'}
            </button>
          </form>
        </details>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Resumo técnico</p>
            <h2>Últimos resultados</h2>
          </div>
        </div>
        {latestAssessment ? (
          <div className="verdict-card">
            <span className={`badge ${statusClass(latestAssessment.verdict.status)}`}>{statusLabel(latestAssessment.verdict.status)}</span>
            <strong>{latestAssessment.verdict.standard_name}</strong>
            <p className="muted">
              {latestAssessment.verdict.standard_code} · {formatDate(latestAssessment.created_at)}
            </p>
            <div className="meta">
              <span>Regras: {latestAssessment.verdict.rules_applied.length}</span>
              <span>Severidade: {latestAssessment.verdict.severity}</span>
            </div>
          </div>
        ) : (
          <div className="item">
            <strong>Sem resultado ainda.</strong>
            <p className="muted">Abra um projeto e execute o cálculo.</p>
          </div>
        )}
      </article>
    </section>
  );
}
