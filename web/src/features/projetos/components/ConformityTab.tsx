import type { ResidentialProject } from '../../../domain/residential-projects';
import { EmptyDash } from '../../shared/MiniVisuals';

type ConformityTabProps = {
  project: ResidentialProject;
};

export function ConformityTab({ project }: ConformityTabProps) {
  return (
    <div className="stack lg animate-fade-in">
       <article className="panel soft-panel">
         <div className="panel-head">
           <h2>Verificação de Conformidade</h2>
         </div>
         
         <div className="conformity-list stack">
            <div className="conformity-item row middle gap-md glass-panel">
               <span className="icon success">✅</span>
               <div className="stack tight">
                  <strong>Aterramento (TT/TN-S)</strong>
                  <p className="muted size-xs">Configuração validada conforme NBR-5410</p>
               </div>
            </div>
            
            <div className="conformity-item row middle gap-md glass-panel">
               <span className="icon warning">⚠️</span>
               <div className="stack tight">
                  <strong>Equipotencialização</strong>
                  <p className="muted size-xs">Verificar continuidade das massas metálicas</p>
               </div>
            </div>

            <div className="conformity-item row middle gap-md glass-panel">
               <span className="icon info">ℹ️</span>
               <div className="stack tight">
                  <strong>Documentação Técnica</strong>
                  <p className="muted size-xs">Pronto para exportação de relatório</p>
               </div>
            </div>
         </div>
       </article>

       {!project && (
         <EmptyDash label="Selecione um projeto para ver a conformidade" />
       )}
    </div>
  );
}
