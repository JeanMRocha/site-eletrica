import type { ResidentialProject } from '../../../domain/residential-projects';
import { EnvironmentTab } from './EnvironmentTab';

type ProjectFormProps = {
  step: number;
  form: any;
  setForm: (val: any) => void;
  clients: any[];
  toggleSource: (source: any) => void;
  envForm: any;
  setEnvForm: (val: any) => void;
  onAddEnv: (e: React.FormEvent) => void;
  project: ResidentialProject;
};

export function ProjectForm({ 
  step, 
  form, 
  setForm, 
  clients, 
  toggleSource, 
  envForm, 
  setEnvForm, 
  onAddEnv, 
  project 
}: ProjectFormProps) {
  if (step === 1) {
    return (
      <div className="stack lg animate-fade-in">
        <div className="form-group-rounded">
          <div className="input-block">
            <label>Identificação do Projeto</label>
            <input 
              className="modern-input"
              value={form.name} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, name: e.target.value }))} 
              placeholder="Ex: Instalação Residencial - Bloco A"
              required
            />
          </div>
          <div className="input-block">
            <label>Cliente Proprietário</label>
            <select
              className="modern-select"
              value={form.clientId}
              onChange={(e) => {
                const client = clients.find((c: any) => c.id === e.target.value);
                setForm((curr: any) => ({ ...curr, clientId: e.target.value, clientName: client?.name ?? '' }));
              }}
              required
            >
              <option value="">Selecione o Cliente</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group-rounded">
          <div className="input-block">
            <label>Tensão Nominal</label>
            <select className="modern-select" value={form.voltage} onChange={(e) => setForm((curr: any) => ({ ...curr, voltage: e.target.value }))}>
              <option value="127V">127V</option>
              <option value="220V">220V</option>
              <option value="127/220V">127/220V</option>
            </select>
          </div>
          <div className="input-block">
            <label>Tipologia</label>
            <select className="modern-select" value={form.houseType} onChange={(e) => setForm((curr: any) => ({ ...curr, houseType: e.target.value }))}>
              <option value="padrao">Padrão</option>
              <option value="terrea">Térrea</option>
              <option value="sobrado">Sobrado</option>
              <option value="geminada">Geminada</option>
            </select>
          </div>
        </div>

        <div className="input-block">
          <label>Fontes de Energia</label>
          <div className="source-checkbox-group row wrap">
             {['rede', 'solar', 'gerador'].map((s: any) => (
               <label key={s} className={`source-check-card ${form.source.includes(s) ? 'active' : ''}`}>
                  <input type="checkbox" checked={form.source.includes(s)} onChange={() => toggleSource(s)} />
                  <span className="icon">{s === 'rede' ? '⚡' : s === 'solar' ? '☼' : '⚙'}</span>
                  <strong>{s.charAt(0).toUpperCase() + s.slice(1)}</strong>
               </label>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="stack lg animate-fade-in">
        <div className="form-group-rounded">
          <div className="input-block">
            <label>CEP / Localização</label>
            <input 
              className="modern-input" 
              value={form.zipCode} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, zipCode: e.target.value }))} 
              placeholder="00000-000" 
            />
          </div>
          <div className="input-block" style={{ flex: 2 }}>
            <label>Rua / Logradouro</label>
            <input 
              className="modern-input" 
              value={form.street} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, street: e.target.value }))} 
              placeholder="Ex: Av. Brasil" 
            />
          </div>
          <div className="input-block" style={{ width: '100px' }}>
            <label>Número</label>
            <input 
              className="modern-input" 
              value={form.number} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, number: e.target.value }))} 
              placeholder="123" 
            />
          </div>
        </div>

        <div className="form-group-rounded">
          <div className="input-block">
            <label>Bairro</label>
            <input 
              className="modern-input" 
              value={form.district} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, district: e.target.value }))} 
              placeholder="Ex: Centro" 
            />
          </div>
          <div className="input-block">
            <label>Cidade</label>
            <input 
              className="modern-input" 
              value={form.city} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, city: e.target.value }))} 
              placeholder="Ex: São Paulo" 
            />
          </div>
          <div className="input-block" style={{ width: '80px' }}>
            <label>UF</label>
            <input 
              className="modern-input" 
              value={form.state} 
              onChange={(e) => setForm((curr: any) => ({ ...curr, state: e.target.value }))} 
              placeholder="SP" 
              maxLength={2}
            />
          </div>
        </div>

        <div className="input-block">
          <label>Complemento / Referência</label>
          <input 
            className="modern-input" 
            value={form.complement} 
            onChange={(e) => setForm((curr: any) => ({ ...curr, complement: e.target.value }))} 
            placeholder="Apto 101, Próximo ao mercado..." 
          />
        </div>
      </div>
    );
  }

  return <EnvironmentTab project={project} envForm={envForm} setEnvForm={setEnvForm} onAddEnv={onAddEnv} />;
}
