import { useStandards } from './useStandards';
import { sortHierarchy, sortStandards } from '../../lib/presentation';
import { EmptyDash, MetricCard, MiniBars, MiniSpark } from '../shared/MiniVisuals';
import { Skeleton, SkeletonCard, SkeletonRow } from '../shared/Skeleton';
import type { ValidationFinding } from '../../services/ElectricalValidationEngine';
import './standards.css';

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

export function StandardsFeature() {
  const { standards, hierarchy, loading, error } = useStandards();
  
  const orderedHierarchy = sortHierarchy(hierarchy);
  const orderedStandards = sortStandards(standards);
  const hierarchyValues = orderedHierarchy.map((level) => level.weight);
  const maxHierarchy = Math.max(...hierarchyValues, 1);

  if (loading && standards.length === 0) {
    return (
      <section className="norms-page standards-feature">
        <article className="panel standards-panel">
          <div className="panel-head">
            <Skeleton width="200px" height="2rem" />
          </div>
          <div className="metric-grid">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="standards-layout">
            <div className="hierarchy-column"><SkeletonRow count={5} height="2rem" /></div>
            <div className="findings-column"><SkeletonRow count={3} height="4rem" /></div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="norms-page standards-feature">
      <article className="panel standards-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Catálogo Técnico</p>
            <h1>Normas e Regras</h1>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard label="Normas" value={orderedStandards.length} caption="Ativas" chart={<MiniBars values={hierarchyValues} />} />
          <MetricCard label="Hierarquia" value={orderedHierarchy.length} caption="Níveis" chart={<MiniSpark values={hierarchyValues} />} />
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="standards-layout">
          <div className="hierarchy-column">
            <h3>Precedência</h3>
            <div className="chart-shell">
              {orderedHierarchy.length === 0 ? (
                <EmptyDash label="Sem catálogo" />
              ) : (
                orderedHierarchy.map((level) => (
                  <div key={level.id} className="dash-bar">
                    <div className="dash-bar-head">
                      <span>{level.id}</span>
                      <strong>{level.weight}</strong>
                    </div>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width: `${Math.max(24, (level.weight / maxHierarchy) * 100)}%` }} />
                    </div>
                    <div className="standards-band">
                      {orderedStandards
                        .filter((s) => s.hierarchy_weight === level.weight)
                        .slice(0, 3)
                        .map((s) => (
                          <div key={s.code} className="standards-chip">
                            <strong>{s.code}</strong>
                            <span>{s.version}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="findings-column">
            <h3>Motor de Validação</h3>
            <div className="stack">
              {sampleFindings.map((finding) => (
                <article key={finding.type} className={`rule-card ${finding.level}`}>
                  <strong>{finding.message}</strong>
                  <p>{finding.suggestion}</p>
                  <span className="badge">{finding.level}</span>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="muted footer-note">
          O serviço de validação está integrado ao <code>ElectricalValidationEngine</code>.
        </div>
      </article>
    </section>
  );
}
