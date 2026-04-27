import { ProjetadorFeature } from '../../projetador/ProjetadorFeature';
import { ProjectForm } from './ProjectForm';
import { ProjectDisplay } from './ProjectDisplay';
import type { ProjectStep } from '../useProjetos';

type ProjectManagerProps = {
  mode: 'create' | 'edit' | 'detail' | 'designer';
  project: any;
  form: any;
  setForm: (val: any) => void;
  clients: any[];
  envForm: any;
  setEnvForm: (val: any) => void;
  onAddEnv: (e: React.FormEvent) => void;
  onDelete: () => void;
  onSubmit: () => void;
  saving: boolean;
  step: ProjectStep;
  setStep: (step: ProjectStep) => void;
  navigate: (path: string) => void;
};

export function ProjectManager({ 
  mode, 
  project, 
  form, 
  setForm, 
  clients, 
  envForm, 
  setEnvForm, 
  onAddEnv, 
  onDelete, 
  onSubmit, 
  saving, 
  step, 
  setStep, 
  navigate 
}: ProjectManagerProps) {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isDetail = mode === 'detail';
  const isDesigner = mode === 'designer';

  const toggleSource = (key: string) => {
    const current = form.source as string[];
    const next = current.includes(key) 
      ? current.filter(k => k !== key) 
      : [...current, key];
    setForm((curr: any) => ({ ...curr, source: next }));
  };

  return (
    <section className="projects-page page-transition">
      <div className="chrome-tabs-row row spread">
        <div className="chrome-tabs-container">
          <button className={`chrome-tab ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)} type="button">
            Identificação
          </button>
          <button className={`chrome-tab ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)} type="button">
            Localização
          </button>
          {!isCreate && (
             <button className={`chrome-tab ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)} type="button">
               Projeto Técnico
             </button>
          )}
        </div>

        <div className="wizard-quick-actions row">
          {step > 1 && (
            <button className="action-btn-wizard" type="button" onClick={() => setStep((step - 1) as ProjectStep)} title="Voltar">
              ←
            </button>
          )}
          
          {(isCreate || isEdit || isDesigner) ? (
             <button className="action-btn-wizard primary" type="button" onClick={() => onSubmit()} disabled={saving} title="Salvar Projeto">
                {saving ? '...' : '💾'}
             </button>
          ) : (
            <button className="action-btn-wizard accent-btn" type="button" onClick={() => navigate(`/projetos/${project?.id}/editar`)} title="Editar Dados">
               ✎
            </button>
          )}

          {!isCreate && (
            <button className="action-btn-wizard danger-btn" type="button" onClick={onDelete} disabled={saving} title="Excluir Projeto">
              🗑️
            </button>
          )}

          <button className="action-btn-wizard" type="button" onClick={() => navigate('/projetos')} title="Fechar">
            ✕
          </button>

          {step < (isCreate ? 2 : 3) && (
            <button className="action-btn-wizard accent-btn" type="button" onClick={() => setStep((step + 1) as ProjectStep)} title="Próximo">
              →
            </button>
          )}
          
          {isDetail && (
            <button className="action-btn-wizard primary" type="button" onClick={() => setStep(3 as ProjectStep)} title="Abrir Projetador">
               ⚡
            </button>
          )}
        </div>
      </div>

      <article className={`projects-panel-wizard glass-panel ${isDesigner ? 'designer-tab-active' : ''}`}>
        {!(isDesigner || step === 3) && (
          <header className="panel-head-wizard">
            <p className="eyebrow">{isCreate ? 'Novo Projeto' : isEdit ? 'Edição Técnica' : 'Consolidação'}</p>
            <h1>{step === 1 ? 'Engenharia e Cliente' : 'Endereço da Instalação'}</h1>
          </header>
        )}

        <div className="manager-content">
          {step === 3 ? (
            <div className="designer-embedded animate-fade-in">
               <ProjetadorFeature hideHeader />
            </div>
          ) : (isCreate || isEdit) ? (
            <ProjectForm 
              step={step} 
              form={form} 
              setForm={setForm} 
              clients={clients} 
              toggleSource={toggleSource} 
              envForm={envForm}
              setEnvForm={setEnvForm}
              onAddEnv={onAddEnv}
              project={project}
            />
          ) : (
            <ProjectDisplay 
              step={step} 
              project={project} 
            />
          )}
        </div>
      </article>
    </section>
  );
}
