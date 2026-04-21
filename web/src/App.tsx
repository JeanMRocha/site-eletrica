import { useEffect, useState } from 'react';
import { assessStudy, createStudy, getStudy, listStandards, listStudies } from './api';
import type { AssessmentInput, AssessmentRecord, Standard, Study, StudyDetail } from './types';

const defaultAssessment: AssessmentInput = {
  circuit_id: 'C1',
  current_project_a: 17.3,
  conductor_mm2: 2.5,
  breaker_a: 20,
  voltage_drop_percent: 3.1,
  installation_method: 'embutido',
  environment_type: 'quarto',
  standard_code: 'NBR-5410',
  standard_version: 'catalog-2026.04',
};

const defaultStudy = {
  name: 'Residência piloto',
  client_name: 'Cliente teste',
  location: 'Campinas/SP',
  project_type: 'residencial',
  voltage: '127/220 V',
};

function statusLabel(status: string) {
  switch (status) {
    case 'conforme':
      return 'Conforme';
    case 'nao_conforme':
      return 'Não conforme';
    case 'incompleto':
      return 'Incompleto';
    case 'revisao_humana':
      return 'Revisão humana';
    default:
      return 'Pendente';
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'conforme':
      return 'ok';
    case 'nao_conforme':
      return 'bad';
    case 'incompleto':
      return 'warn';
    case 'revisao_humana':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function readStudyId() {
  const value = new URLSearchParams(window.location.search).get('studyId');
  return value ?? '';
}

function setStudyId(id: string) {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set('studyId', id);
  } else {
    url.searchParams.delete('studyId');
  }
  window.history.replaceState({}, '', url);
}

export function App() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState(readStudyId());
  const [detail, setDetail] = useState<StudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState(defaultStudy);
  const [assessmentForm, setAssessmentForm] = useState(defaultAssessment);
  const [savingStudy, setSavingStudy] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setSelectedStudyId(readStudyId());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [studyList, standardList] = await Promise.all([listStudies(), listStandards()]);
        setStudies(studyList);
        setStandards(standardList);

        if (selectedStudyId) {
          const nextDetail = await getStudy(selectedStudyId);
          setDetail(nextDetail);
        } else {
          setDetail(null);
        }

        if (!selectedStudyId && studyList[0]) {
          setSelectedStudyId(studyList[0].id);
          setStudyId(studyList[0].id);
          setDetail(await getStudy(studyList[0].id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [selectedStudyId]);

  useEffect(() => {
    const firstStandard = standards[0];
    if (firstStandard && !assessmentForm.standard_code) {
      setAssessmentForm((current) => ({
        ...current,
        standard_code: firstStandard.code,
        standard_version: firstStandard.version,
      }));
    }
  }, [assessmentForm.standard_code, standards]);

  async function refreshDetail(id: string) {
    const nextDetail = await getStudy(id);
    setDetail(nextDetail);
    setStudies(await listStudies());
  }

  async function onCreateStudy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingStudy(true);
    setError('');
    try {
      const study = await createStudy(createForm);
      setStudies(await listStudies());
      setSelectedStudyId(study.id);
      setStudyId(study.id);
      setDetail(await getStudy(study.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar estudo');
    } finally {
      setSavingStudy(false);
    }
  }

  async function onAssessStudy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStudyId) {
      return;
    }

    setSavingAssessment(true);
    setError('');
    try {
      await assessStudy(selectedStudyId, {
        ...assessmentForm,
        study_id: selectedStudyId,
      });
      await refreshDetail(selectedStudyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao avaliar estudo');
    } finally {
      setSavingAssessment(false);
    }
  }

  const assessments: AssessmentRecord[] = detail?.assessments ?? [];

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <strong>Site Elétrica</strong>
          <span>Stack visual do MVP com persistência local</span>
        </div>
        <div className="toolbar">
          <a className="ghost" href="/v1/standards/catalog" target="_blank" rel="noreferrer">
            Catálogo
          </a>
          <a className="button" href="#new-study">
            Novo estudo
          </a>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div className="hero-card">
            <p className="eyebrow">MVP local-first</p>
            <h1>Dimensionamento elétrico com interface visual, normas versionadas e veredito rastreável.</h1>
            <p>
              O sistema começa com estudos, catálogo normativo, conformidade e persistência local.
              A interface visual segue a stack do produto e conversa com a API do Go.
            </p>
            <div className="toolbar">
              <button className="button" onClick={() => document.getElementById('new-study')?.scrollIntoView({ behavior: 'smooth' })}>
                Criar estudo
              </button>
              <a className="ghost" href="/v1/conformidade/assess" target="_blank" rel="noreferrer">
                API de conformidade
              </a>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>{studies.length}</strong>
              <span>estudos salvos</span>
            </div>
            <div className="stat">
              <strong>{standards.length}</strong>
              <span>normas no catálogo</span>
            </div>
            <div className="stat">
              <strong>{assessments.length}</strong>
              <span>veredictos do estudo</span>
            </div>
          </div>
        </section>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando base inicial...</div> : null}

        <section className="grid cols-2">
          <article className="panel" id="new-study">
            <div className="panel-head">
              <div>
                <h2>Novo estudo</h2>
                <p className="muted">Primeiro ponto de entrada do MVP.</p>
              </div>
            </div>
            <form onSubmit={onCreateStudy}>
              <div className="form-grid">
                <label>
                  Nome do estudo
                  <input
                    value={createForm.name}
                    onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label>
                  Cliente
                  <input
                    value={createForm.client_name}
                    onChange={(event) => setCreateForm((current) => ({ ...current, client_name: event.target.value }))}
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Local
                  <input
                    value={createForm.location}
                    onChange={(event) => setCreateForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </label>
                <label>
                  Tipo
                  <input
                    value={createForm.project_type}
                    onChange={(event) => setCreateForm((current) => ({ ...current, project_type: event.target.value }))}
                  />
                </label>
              </div>
              <label>
                Tensão
                <input
                  value={createForm.voltage}
                  onChange={(event) => setCreateForm((current) => ({ ...current, voltage: event.target.value }))}
                />
              </label>
              <button className="button" disabled={savingStudy} type="submit">
                {savingStudy ? 'Salvando...' : 'Salvar estudo'}
              </button>
            </form>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <h2>Estudos</h2>
                <p className="muted">Selecione um estudo para ver o histórico.</p>
              </div>
            </div>
            <div className="list">
              {studies.length === 0 ? (
                <div className="item">
                  <strong>Nenhum estudo salvo ainda.</strong>
                  <p className="muted">Crie o primeiro estudo para começar o MVP.</p>
                </div>
              ) : null}
              {studies.map((study) => (
                <button
                  key={study.id}
                  className={`item selectable ${study.id === selectedStudyId ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedStudyId(study.id);
                    setStudyId(study.id);
                    void refreshDetail(study.id);
                  }}
                  type="button"
                >
                  <div className="row">
                    <div>
                      <strong>{study.name}</strong>
                      <p className="muted">{study.client_name} · {study.location}</p>
                    </div>
                    <span className="badge neutral">{study.project_type}</span>
                  </div>
                  <div className="meta">
                    <span>{study.voltage}</span>
                    <span>{formatDate(study.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </section>

        {detail ? (
          <section className="grid cols-2 detail-grid">
            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>{detail.study.name}</h2>
                  <p className="muted">{detail.study.client_name} · {detail.study.location}</p>
                </div>
                <span className="badge neutral">{detail.study.voltage}</span>
              </div>

              <div className="meta">
                <span>Criado em {formatDate(detail.study.created_at)}</span>
                <span>Atualizado em {formatDate(detail.study.updated_at)}</span>
              </div>

              <div className="subpanel">
                <h3>Catálogo ativo</h3>
                <div className="catalog-list">
                  {standards.map((standard) => (
                    <div key={standard.code} className="catalog-item">
                      <strong>{standard.code}</strong>
                      <span>{standard.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Nova avaliação</h2>
                  <p className="muted">Liga a conformidade ao catálogo de normas.</p>
                </div>
              </div>

              <form onSubmit={onAssessStudy}>
                <div className="form-grid three">
                  <label>
                    Circuito
                    <input
                      value={assessmentForm.circuit_id}
                      onChange={(event) => setAssessmentForm((current) => ({ ...current, circuit_id: event.target.value }))}
                    />
                  </label>
                  <label>
                    Norma
                    <select
                      value={assessmentForm.standard_code}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({
                          ...current,
                          standard_code: event.target.value,
                        }))
                      }
                    >
                      {standards.map((standard) => (
                        <option key={standard.code} value={standard.code}>
                          {standard.code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Versão
                    <input
                      value={assessmentForm.standard_version}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({ ...current, standard_version: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="form-grid three">
                  <label>
                    Corrente de projeto (A)
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.current_project_a}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({
                          ...current,
                          current_project_a: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Condutor (mm²)
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.conductor_mm2}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({
                          ...current,
                          conductor_mm2: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Disjuntor (A)
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.breaker_a}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({
                          ...current,
                          breaker_a: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="form-grid three">
                  <label>
                    Queda de tensão (%)
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.voltage_drop_percent}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({
                          ...current,
                          voltage_drop_percent: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Método de instalação
                    <input
                      value={assessmentForm.installation_method}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({ ...current, installation_method: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Ambiente
                    <input
                      value={assessmentForm.environment_type}
                      onChange={(event) =>
                        setAssessmentForm((current) => ({ ...current, environment_type: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <button className="button" disabled={savingAssessment} type="submit">
                  {savingAssessment ? 'Avaliando...' : 'Avaliar conformidade'}
                </button>
              </form>
            </article>
          </section>
        ) : null}

        {detail ? (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Histórico do estudo</h2>
                <p className="muted">Resultados persistidos localmente.</p>
              </div>
            </div>
            <div className="list">
              {assessments.length === 0 ? (
                <div className="item">
                  <strong>Nenhuma avaliação ainda.</strong>
                  <p className="muted">Execute a primeira conformidade para salvar o histórico.</p>
                </div>
              ) : null}
              {assessments.map((assessment) => (
                <div key={assessment.id} className="item">
                  <div className="row">
                    <div>
                      <strong>{assessment.input.circuit_id}</strong>
                      <p className="muted">
                        {assessment.verdict.standard_code} · {formatDate(assessment.created_at)}
                      </p>
                    </div>
                    <span className={`badge ${statusClass(assessment.verdict.status)}`}>
                      {statusLabel(assessment.verdict.status)}
                    </span>
                  </div>
                  <div className="meta">
                    <span>Severidade: {assessment.verdict.severity}</span>
                    <span>Revisão humana: {assessment.verdict.requires_human_review ? 'sim' : 'não'}</span>
                    <span>Regras: {assessment.verdict.rules_applied.length}</span>
                  </div>
                  <details>
                    <summary>Mensagens</summary>
                    <div className="message-list">
                      {assessment.verdict.messages.map((message) => (
                        <span key={message}>• {message}</span>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
