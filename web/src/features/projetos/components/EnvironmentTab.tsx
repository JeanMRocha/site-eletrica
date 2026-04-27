import type { ResidentialProject } from '../../../domain/residential-projects';

type EnvironmentTabProps = {
  project: ResidentialProject;
  envForm?: any;
  setEnvForm?: (val: any) => void;
  onAddEnv?: (e: React.FormEvent) => void;
};

export function EnvironmentTab({ project, envForm, setEnvForm, onAddEnv }: EnvironmentTabProps) {
  return (
    <div className="stack lg animate-fade-in">
       {onAddEnv && setEnvForm && envForm && (
         <form className="add-env-inline row glass-panel" onSubmit={onAddEnv} style={{ padding: '16px' }}>
            <div className="row flex-1" style={{ gap: '12px' }}>
              <input 
                className="modern-input" 
                placeholder="Nome do Cômodo" 
                value={envForm.name} 
                onChange={e => setEnvForm((c: any) => ({...c, name: e.target.value}))} 
                required 
              />
              <input 
                className="modern-input" 
                type="number" 
                placeholder="m²" 
                style={{ width: '100px' }}
                value={envForm.areaM2 || ''} 
                onChange={e => setEnvForm((c: any) => ({...c, areaM2: e.target.value}))} 
              />
            </div>
            <button className="button" type="submit">Adicionar</button>
         </form>
       )}

       <div className="env-list-modern grid">
          {!project?.environments || project.environments.length === 0 ? (
            <p className="muted center" style={{ padding: '40px' }}>Nenhum ambiente registrado ainda.</p>
          ) : (
            project.environments.map((env: any) => (
              <div key={env.id} className="env-card-modern glass-panel row spread middle">
                <div className="stack tight">
                  <strong>{env.name}</strong>
                  <span className="muted size-xs">{env.areaM2}m² de área calculada</span>
                </div>
                <div className="badge info">PRONTO</div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}
