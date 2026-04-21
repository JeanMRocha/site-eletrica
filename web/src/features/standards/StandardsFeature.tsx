import type { HierarchyLevel, Standard, AssessmentInput } from '../../types';
import { sortHierarchy, sortStandards } from '../../lib/presentation';
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

  return (
    <section className="dashboard-grid standards-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Hierarquia</p>
            <h2>Normas por precedência</h2>
          </div>
        </div>
        <div className="stack">
          {orderedHierarchy.map((level) => (
            <div key={level.id} className="norm-group">
              <div className="norm-group-head">
                <strong>{level.id}</strong>
                <span>{level.weight}</span>
              </div>
              <div className="stack tight">
                {orderedStandards
                  .filter((standard) => standard.hierarchy_weight === level.weight)
                  .map((standard) => (
                    <button
                      key={standard.code}
                      className={`norm-item ${assessmentForm.standard_code === standard.code ? 'active' : ''}`}
                      onClick={() => onSelectStandard(standard)}
                      type="button"
                    >
                      <div className="row">
                        <div>
                          <strong>{standard.code}</strong>
                          <p className="muted">{standard.title}</p>
                        </div>
                        <span className="badge neutral">{standard.version}</span>
                      </div>
                      <div className="meta">
                        <span>{standard.source_name}</span>
                        <span>{standard.subject}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
