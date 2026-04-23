import type { FormEvent } from 'react';
import type { CircuitItem, EnvironmentItem, LoadItem, ProjectWorkspace as ProjectWorkspaceData } from '../../domain/workspace';
import { EmptyDash, MiniBars, MiniSpark, MetricCard } from '../shared/MiniVisuals';
import './modeling.css';

type ModelingTabProps = {
  projectWorkspace: ProjectWorkspaceData;
  onAddEnvironment: (event: FormEvent<HTMLFormElement>) => void;
  onAddLoad: (event: FormEvent<HTMLFormElement>) => void;
  onAddCircuit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ModelingTab({ projectWorkspace, onAddEnvironment, onAddLoad, onAddCircuit }: ModelingTabProps) {
  const counts = [projectWorkspace.drawings.length, projectWorkspace.environments.length, projectWorkspace.loads.length, projectWorkspace.circuits.length];

  return (
    <section className="dashboard-grid modeling-feature">
      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Modelo</p>
            <h2>Estrutura do projeto</h2>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard label="Desenhos" value={projectWorkspace.drawings.length} caption="Plantas" chart={<MiniBars values={counts} />} />
          <MetricCard label="Ambientes" value={projectWorkspace.environments.length} caption="Zonas" chart={<MiniBars values={projectWorkspace.environments.map((item) => Math.max(1, item.name.length))} />} />
          <MetricCard label="Circuitos" value={projectWorkspace.circuits.length} caption="Traçado" chart={<MiniSpark values={counts} />} />
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Ambientes</p>
            <h2>Mapa resumido</h2>
          </div>
        </div>
        <div className="card-grid">
          {projectWorkspace.environments.length === 0 ? (
            <EmptyDash label="Adicione ambientes para montar o modelo" />
          ) : (
            projectWorkspace.environments.slice(0, 4).map((environment) => <EnvironmentCard key={environment.id} environment={environment} />)
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Cargas e circuitos</p>
            <h2>Resumo técnico</h2>
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
        <MiniBars values={counts} />
        <div className="stack">
          {projectWorkspace.loads.slice(0, 2).map((load) => <LoadCard key={load.id} load={load} />)}
          {projectWorkspace.circuits.slice(0, 2).map((circuit) => <CircuitCard key={circuit.id} circuit={circuit} />)}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Entrada guiada</p>
            <h2>Adicionar itens</h2>
          </div>
        </div>

        <details className="details-box">
          <summary>Adicionar ambiente</summary>
          <form onSubmit={onAddEnvironment}>
            <div className="form-grid three">
              <label>
                <span>Nome</span>
                <input name="env_name" placeholder="Nome" />
              </label>
              <label>
                <span>Área</span>
                <input name="env_area" placeholder="Área" />
              </label>
              <label>
                <span>Uso</span>
                <input name="env_usage" placeholder="Uso" />
              </label>
            </div>
            <label>
              <span>Distância</span>
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
                <span>Nome</span>
                <input name="load_name" placeholder="Nome" />
              </label>
              <label>
                <span>Categoria</span>
                <input name="load_category" placeholder="Categoria" />
              </label>
              <label>
                <span>Potência</span>
                <input name="load_power" placeholder="Potência" />
              </label>
            </div>
            <label>
              <span>Quantidade</span>
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
                <span>Nome</span>
                <input name="circuit_name" placeholder="Nome" />
              </label>
              <label>
                <span>Ambiente</span>
                <input name="circuit_environment" placeholder="Ambiente" />
              </label>
              <label>
                <span>Disjuntor</span>
                <input name="circuit_breaker" placeholder="Disjuntor" />
              </label>
            </div>
            <label>
              <span>Condutor</span>
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
    <article className="mini-card tall visual-card">
      <div className="row">
        <strong>{environment.name}</strong>
        <span className="badge neutral">{environment.usage || 'Ambiente'}</span>
      </div>
      <MiniSpark values={[environment.name.length, environment.area.length, environment.usage.length, environment.distance.length]} />
      <div className="meta">
        <span>{environment.area || 'área'}</span>
        <span>{environment.distance || 'distância'}</span>
      </div>
    </article>
  );
}

function LoadCard({ load }: { load: LoadItem }) {
  return (
    <article className="item visual-item">
      <div className="row">
        <div>
          <strong>{load.name}</strong>
          <p className="muted">{load.category}</p>
        </div>
        <span className="badge neutral">{load.power}</span>
      </div>
      <MiniBars values={[load.name.length, load.category.length, load.power.length, load.quantity.length]} />
    </article>
  );
}

function CircuitCard({ circuit }: { circuit: CircuitItem }) {
  return (
    <article className="item visual-item">
      <div className="row">
        <div>
          <strong>{circuit.name}</strong>
          <p className="muted">{circuit.environment}</p>
        </div>
        <span className="badge neutral">{circuit.breaker}</span>
      </div>
      <MiniSpark values={[circuit.name.length, circuit.environment.length, circuit.breaker.length, circuit.conductor.length]} />
    </article>
  );
}
