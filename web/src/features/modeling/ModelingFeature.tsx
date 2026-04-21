import type { FormEvent } from 'react';
import type { CircuitItem, EnvironmentItem, LoadItem, ProjectWorkspace as ProjectWorkspaceData } from '../../domain/workspace';
import './modeling.css';

type ModelingTabProps = {
  projectWorkspace: ProjectWorkspaceData;
  onAddEnvironment: (event: FormEvent<HTMLFormElement>) => void;
  onAddLoad: (event: FormEvent<HTMLFormElement>) => void;
  onAddCircuit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ModelingTab({ projectWorkspace, onAddEnvironment, onAddLoad, onAddCircuit }: ModelingTabProps) {
  return (
    <section className="dashboard-grid modeling-feature">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Ambientes</h2>
          </div>
        </div>
        <div className="card-grid">
          {projectWorkspace.environments.length === 0 ? (
            <div className="item">
              <strong>Sem ambientes.</strong>
              <p className="muted">Adicione áreas e distâncias para montar o modelo.</p>
            </div>
          ) : (
            projectWorkspace.environments.map((environment) => <EnvironmentCard key={environment.id} environment={environment} />)
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Consolidação</p>
            <h2>Cargas e circuitos</h2>
          </div>
        </div>
        <div className="summary-strip">
          <div className="mini-card">
            <span>Cargas</span>
            <strong>{projectWorkspace.loads.length}</strong>
          </div>
          <div className="mini-card">
            <span>Circuitos</span>
            <strong>{projectWorkspace.circuits.length}</strong>
          </div>
        </div>
        <div className="stack">
          {projectWorkspace.loads.slice(0, 2).map((load) => <LoadCard key={load.id} load={load} />)}
          {projectWorkspace.circuits.slice(0, 2).map((circuit) => <CircuitCard key={circuit.id} circuit={circuit} />)}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Ações secundárias</p>
            <h2>Entrada guiada</h2>
          </div>
        </div>
        <details className="details-box">
          <summary>Adicionar ambiente</summary>
          <form onSubmit={onAddEnvironment}>
            <div className="form-grid three">
              <label>
                <input name="env_name" placeholder="Nome" />
              </label>
              <label>
                <input name="env_area" placeholder="Área" />
              </label>
              <label>
                <input name="env_usage" placeholder="Uso" />
              </label>
            </div>
            <label>
              <input name="env_distance" placeholder="Distância" />
            </label>
            <button className="button" type="submit">
              Adicionar ambiente
            </button>
          </form>
        </details>
        <details className="details-box">
          <summary>Adicionar carga</summary>
          <form onSubmit={onAddLoad}>
            <div className="form-grid three">
              <label>
                <input name="load_name" placeholder="Nome" />
              </label>
              <label>
                <input name="load_category" placeholder="Categoria" />
              </label>
              <label>
                <input name="load_power" placeholder="Potência" />
              </label>
            </div>
            <label>
              <input name="load_quantity" placeholder="Quantidade" />
            </label>
            <button className="button" type="submit">
              Adicionar carga
            </button>
          </form>
        </details>
        <details className="details-box">
          <summary>Adicionar circuito</summary>
          <form onSubmit={onAddCircuit}>
            <div className="form-grid three">
              <label>
                <input name="circuit_name" placeholder="Nome" />
              </label>
              <label>
                <input name="circuit_environment" placeholder="Ambiente" />
              </label>
              <label>
                <input name="circuit_breaker" placeholder="Disjuntor" />
              </label>
            </div>
            <label>
              <input name="circuit_conductor" placeholder="Condutor" />
            </label>
            <button className="button" type="submit">
              Adicionar circuito
            </button>
          </form>
        </details>
      </article>
    </section>
  );
}

function EnvironmentCard({ environment }: { environment: EnvironmentItem }) {
  return (
    <article className="mini-card tall">
      <strong>{environment.name}</strong>
      <span>{environment.area || 'área não informada'}</span>
      <span>{environment.usage || 'uso não informado'}</span>
      <span>{environment.distance || 'distância não informada'}</span>
    </article>
  );
}

function LoadCard({ load }: { load: LoadItem }) {
  return (
    <article className="item">
      <div className="row">
        <div>
          <strong>{load.name}</strong>
          <p className="muted">{load.category}</p>
        </div>
        <span className="badge neutral">{load.power} W</span>
      </div>
    </article>
  );
}

function CircuitCard({ circuit }: { circuit: CircuitItem }) {
  return (
    <article className="item">
      <div className="row">
        <div>
          <strong>{circuit.name}</strong>
          <p className="muted">{circuit.environment}</p>
        </div>
        <span className="badge neutral">{circuit.breaker}</span>
      </div>
    </article>
  );
}
