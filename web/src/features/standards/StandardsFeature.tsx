import type { AssessmentInput, HierarchyLevel, Standard } from '../../types';
import { sortHierarchy, sortStandards } from '../../lib/presentation';
import { EmptyDash, MetricCard, MiniBars, MiniSpark } from '../shared/MiniVisuals';
import './standards.css';

type StandardsTabProps = {
  standards: Standard[];
  hierarchy: HierarchyLevel[];
  assessmentForm: AssessmentInput;
  onSelectStandard: (standard: Standard) => void;
};

export function StandardsTab({ standards, hierarchy, assessmentForm, onSelectStandard }: StandardsTabProps) {
  const orderedHierarchy = sortHierarchy(hierarchy);
  const orderedStandards = sortStandards(standards);
  const hierarchyValues = orderedHierarchy.map((level) => level.weight);
  const selectedStandard = orderedStandards.find((standard) => standard.code === assessmentForm.standard_code) ?? orderedStandards[0];
  const maxHierarchy = Math.max(...hierarchyValues, 1);

  return (
    <section className="dashboard-grid standards-feature">
      <article className="panel metric-panel wide-panel">
        <div className="metric-grid">
          <MetricCard label="Normas" value={orderedStandards.length} caption="Catálogo ativo" chart={<MiniBars values={hierarchyValues} />} />
          <MetricCard label="Precedência" value={orderedHierarchy.length} caption="Níveis" chart={<MiniBars values={hierarchyValues} />} />
          <MetricCard label="Selecionada" value={selectedStandard?.hierarchy_weight ?? 0} caption={selectedStandard ? `${selectedStandard.code} · ${selectedStandard.version}` : 'Nenhuma'} chart={<MiniSpark values={hierarchyValues.slice(0, 6)} />} />
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Hierarquia</p>
            <h2>Precedência do catálogo</h2>
          </div>
        </div>
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
                    .filter((standard) => standard.hierarchy_weight === level.weight)
                    .slice(0, 3)
                    .map((standard) => (
                      <button
                        key={standard.code}
                        className={`standards-chip ${assessmentForm.standard_code === standard.code ? 'active' : ''}`}
                        onClick={() => onSelectStandard(standard)}
                        type="button"
                      >
                        <strong>{standard.code}</strong>
                        <MiniSpark values={[2, 3, 4, 5]} />
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
