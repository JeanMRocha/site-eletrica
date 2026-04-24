import type { ValidationFinding } from '../../services/ElectricalValidationEngine';
import './normas.css';

const sampleFindings: ValidationFinding[] = [
  {
    level: 'info',
    type: 'ambient',
    message: 'Ambientes devem ser cadastrados antes do dimensionamento.',
    suggestion: 'Crie a base do projeto com áreas mínimas e uso definido.',
  },
  {
    level: 'alert',
    type: 'dedicated-circuit',
    message: 'Cargas especiais exigem circuitos dedicados.',
    suggestion: 'Separe chuveiro, ar-condicionado e cargas acima do padrão.',
  },
  {
    level: 'error',
    type: 'voltage',
    message: 'Tensão ausente impede validação.',
    suggestion: 'Informe a tensão do projeto antes de calcular.',
  },
];

export function NormasFeature() {
  return (
    <section className="norms-page">
      <article className="panel norms-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Normas e regras</p>
            <h1>Motor computável</h1>
          </div>
        </div>

        <div className="stack">
          {sampleFindings.map((finding) => (
            <article key={finding.type} className={`rule-card ${finding.level}`}>
              <strong>{finding.message}</strong>
              <p>{finding.suggestion}</p>
              <span>{finding.level}</span>
            </article>
          ))}
        </div>

        <div className="muted">
          O serviço de validação está pronto para evolução em <code>ElectricalValidationEngine</code>.
        </div>
      </article>
    </section>
  );
}
