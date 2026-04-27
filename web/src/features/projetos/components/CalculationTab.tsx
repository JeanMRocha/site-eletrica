import { electricalCalculationService } from '../../../services/ElectricalCalculationService';
import type { ResidentialProject } from '../../../domain/residential-projects';
import { MetricCard, MiniRing, MiniBars, EmptyDash } from '../../shared/MiniVisuals';
import { statusClass, statusLabel } from '../../../lib/presentation';

type CalculationTabProps = {
  project: ResidentialProject;
};

export function CalculationTab({ project }: CalculationTabProps) {
  const result = electricalCalculationService.calculate(project);

  return (
    <div className="stack lg animate-fade-in">
      <div className="metric-grid">
        <MetricCard 
          label="Demanda Total" 
          value={Math.round(result.totalPowerW / 1000)} 
          caption="kVA Estimado" 
          chart={<MiniBars values={[10, 20, 30, result.totalPowerW / 500]} />} 
        />
        <MetricCard 
          label="Padrão de Entrada" 
          value={result.breakerSuggestion} 
          caption="Amperes (A)" 
          chart={<MiniRing value={75} />} 
        />
      </div>

      <article className="panel soft-panel">
        <div className="panel-head slim">
           <h2>Resultados do Dimensionamento</h2>
        </div>
        
        <div className="result-visual">
          <MiniRing value={85} />
          <div className="stack tight">
            <strong>Cálculo Automático NBR-5410</strong>
            <p className="muted">Baseado na área total de {project.environments.reduce((acc, e) => acc + e.areaM2, 0)}m²</p>
            <div className="meta">
              <span>{project.environments.length} ambientes analisados</span>
              <span>Conformidade: OK</span>
            </div>
          </div>
          <span className={`badge ${statusClass('COMPLIANT')}`}>{statusLabel('COMPLIANT')}</span>
        </div>
      </article>

      {project.environments.length === 0 && (
        <EmptyDash label="Adicione ambientes na etapa anterior para gerar o cálculo" />
      )}
    </div>
  );
}
