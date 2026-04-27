import type { ResidentialProject } from '../../../domain/residential-projects';
import { MetricCard, MiniBars, MiniSpark, EmptyDash } from '../../shared/MiniVisuals';

type ModelingTabProps = {
  project: ResidentialProject;
};

export function ModelingTab({ project }: ModelingTabProps) {
  // Em um cenário real, estas listas viriam do repositório vinculadas ao projeto
  const loads = (project as any).loads || [];
  const circuits = (project as any).circuits || [];
  const environments = project.environments || [];

  return (
    <div className="stack lg animate-fade-in">
      <div className="metric-grid">
        <MetricCard 
          label="Cargas" 
          value={loads.length} 
          caption="Itens Registrados" 
          chart={<MiniBars values={[loads.length, circuits.length, environments.length]} />} 
        />
        <MetricCard 
          label="Circuitos" 
          value={circuits.length} 
          caption="Traçados e Proteção" 
          chart={<MiniSpark values={[loads.length, circuits.length, environments.length]} />} 
        />
      </div>

      <div className="grid-two">
        <div className="panel soft-panel">
          <p className="eyebrow">Cargas Individuais</p>
          {loads.length === 0 ? (
            <EmptyDash label="Nenhuma carga especial cadastrada" />
          ) : (
            <div className="stack tight">
              {loads.map((load: any) => (
                <div key={load.id} className="item visual-item">
                   <strong>{load.name}</strong>
                   <span className="badge neutral">{load.power}W</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel soft-panel">
          <p className="eyebrow">Quadro de Circuitos</p>
          {circuits.length === 0 ? (
            <EmptyDash label="Nenhum circuito definido ainda" />
          ) : (
            <div className="stack tight">
               {circuits.map((c: any) => (
                 <div key={c.id} className="item visual-item">
                    <strong>C{c.id} - {c.name}</strong>
                    <span className="badge ok">{c.breaker}A</span>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
