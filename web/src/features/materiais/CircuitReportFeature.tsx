import { useState, useMemo } from 'react';
import type { LoadTree } from './loadTreeModel';
import type { CircuitBOM } from './circuitPlanner';
import { planCircuits, planToBOM } from './circuitPlanner';
import type { ResidentialProject } from '../../domain/residential-projects';
import './circuitReport.css';

type Props = {
  project: ResidentialProject;
  tree: LoadTree;
  onBack: () => void;
};

const CIRCUIT_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  lighting:  { label: 'Iluminação', color: '#ffd166' },
  outlet:    { label: 'Tomadas',    color: '#7fe2ff' },
  dedicated: { label: 'Dedicado',   color: '#ff6b6b' },
  entry:     { label: 'Entrada',    color: '#4ecb71' },
};

const BOM_CATEGORY_LABEL: Record<string, { label: string; icon: string }> = {
  proteção:     { label: 'Proteção (Disjuntores, DR, QDC)', icon: '⚡' },
  condutores:   { label: 'Condutores e Eletrodutos', icon: '🔌' },
  estrutura:    { label: 'Estrutura e Caixas', icon: '🧱' },
  dispositivos: { label: 'Dispositivos (Tomadas, Placas)', icon: '💡' },
  instalação:   { label: 'Materiais de Instalação', icon: '🔧' },
};

export function CircuitReportFeature({ project, tree, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'circuits' | 'qdc' | 'bom'>('circuits');

  const plan = useMemo(() => planCircuits(tree), [tree]);
  const bom  = useMemo(() => planToBOM(plan), [plan]);

  const bomByCategory = useMemo(() => {
    const map: Record<string, CircuitBOM[]> = {};
    for (const item of bom) {
      const cat = item.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [bom]);



  return (
    <div className="circuit-report">
      {/* Header */}
      <header className="cr-header">
        <div className="cr-header-left">
          <button className="cr-back-btn" onClick={onBack}>← Voltar à Árvore</button>
          <div>
            <h2 className="cr-title">⚡ Relatório de Circuitos — NBR 5410</h2>
            <p className="cr-subtitle">{project.name} · {project.clientName} · Gerado em {plan.generatedAt}</p>
          </div>
        </div>
        <button className="cr-print-btn" onClick={() => window.print()}>🖨️ Imprimir / PDF</button>
      </header>

      {/* Warnings Banner */}
      {plan.warnings.length > 0 && (
        <div className="cr-warnings">
          {plan.warnings.map((w, i) => <div key={i} className="cr-warning-item">⚠️ {w}</div>)}
        </div>
      )}

      {/* Summary KPIs */}
      <div className="cr-kpis">
        <div className="cr-kpi">
          <span>Potência Instalada</span>
          <strong>{plan.totalInstalledKVA} kVA</strong>
        </div>
        <div className="cr-kpi">
          <span>Demanda Calculada</span>
          <strong>{plan.totalDemandKVA} kVA</strong>
        </div>
        <div className="cr-kpi">
          <span>Corrente Total</span>
          <strong>{plan.mainCurrentA} A</strong>
        </div>
        <div className="cr-kpi accent">
          <span>Disjuntor Entrada (DG)</span>
          <strong>{plan.entryBreakerA} A bipolar</strong>
        </div>
        <div className="cr-kpi">
          <span>Ramal de Entrada</span>
          <strong>{plan.entryConductorLabel} × 3</strong>
        </div>
        <div className="cr-kpi accent">
          <span>QDC Recomendado</span>
          <strong>{plan.qdc.qdcModel}</strong>
        </div>
        <div className="cr-kpi">
          <span>Total de Circuitos</span>
          <strong>{plan.qdc.circuits.length}</strong>
        </div>
        <div className="cr-kpi">
          <span>DRs Necessários</span>
          <strong>{plan.qdc.drGroups.length} unidades</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="cr-tabs">
        <button className={`cr-tab ${activeTab === 'circuits' ? 'active' : ''}`} onClick={() => setActiveTab('circuits')}>
          📋 Divisão de Circuitos
        </button>
        <button className={`cr-tab ${activeTab === 'qdc' ? 'active' : ''}`} onClick={() => setActiveTab('qdc')}>
          ⚡ QDC — Diagrama Unifilar
        </button>
        <button className={`cr-tab ${activeTab === 'bom' ? 'active' : ''}`} onClick={() => setActiveTab('bom')}>
          📦 Lista de Materiais
        </button>
      </div>

      {/* ── Tab: Circuit List ── */}
      {activeTab === 'circuits' && (
        <div className="cr-content">
          <table className="cr-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Circuito</th>
                <th>Tipo</th>
                <th>Ambiente</th>
                <th>DR?</th>
                <th className="num">VA Instalado</th>
                <th className="num">Corrente</th>
                <th className="num">Bitola</th>
                <th className="num">Disjuntor</th>
                <th className="num">Comp. (m)</th>
                <th className="num">Δv%</th>
                <th>Cargas</th>
              </tr>
            </thead>
            <tbody>
              {plan.qdc.circuits.map((c, idx) => {
                const typeInfo = CIRCUIT_TYPE_LABEL[c.type] ?? { label: c.type, color: '#888' };
                return (
                  <tr key={c.id} className={c.warnings.length > 0 ? 'row-warn' : ''}>
                    <td className="circuit-num">C{String(idx + 1).padStart(2, '0')}</td>
                    <td className="circuit-name">{c.name}</td>
                    <td>
                      <span className="type-badge" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>{c.roomName}</td>
                    <td className="center">
                      {c.requiresDR
                        ? <span className="dr-badge required">✓ DR 30mA</span>
                        : <span className="dr-badge none">—</span>}
                    </td>
                    <td className="num">{c.installedVA}VA</td>
                    <td className="num">{c.demandA}A</td>
                    <td className="num conductor-cell">{c.conductorLabel}</td>
                    <td className="num">{c.breakerA}A</td>
                    <td className="num">{c.lengthM}m</td>
                    <td className={`num ${c.voltageDrop > 4 ? 'cell-error' : c.voltageDrop > 3 ? 'cell-warn' : 'cell-ok'}`}>
                      {c.voltageDrop}%
                    </td>
                    <td className="loads-cell">
                      {c.loads.map((l, i) => (
                        <span key={i} className="load-chip">{l.qty}× {l.name} ({l.powerW}W)</span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* DR Groups */}
          {plan.qdc.drGroups.length > 0 && (
            <div className="cr-dr-section">
              <h3>🔒 Dispositivos DR — Proteção Diferencial Residual (NBR 5410 §9.4.2.3)</h3>
              <table className="cr-table">
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Ambiente Protegido</th>
                    <th className="num">Corrente Nominal</th>
                    <th className="num">Sensibilidade</th>
                    <th className="num">Slots QDC</th>
                    <th>Circuitos Protegidos</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.qdc.drGroups.map((dr, i) => (
                    <tr key={dr.id}>
                      <td><strong>DR-{i + 1}</strong> {dr.name}</td>
                      <td>{dr.name.replace('DR — ', '')}</td>
                      <td className="num">{dr.breakerA}A</td>
                      <td className="num">30mA</td>
                      <td className="num">{dr.slots}</td>
                      <td>
                        {dr.circuitIds.map((cid, j) => {
                          const circ = plan.qdc.circuits.find(c => c.id === cid);
                          return circ ? <span key={j} className="load-chip">{circ.name}</span> : null;
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: QDC Diagram ── */}
      {activeTab === 'qdc' && (
        <div className="cr-content cr-qdc-view">
          <div className="qdc-box">
            <div className="qdc-title">{plan.qdc.qdcModel} — Quadro de Distribuição</div>
            <div className="qdc-entry">
              <div className="qdc-device main-breaker">
                <span className="qdc-device-code">DG</span>
                <span className="qdc-device-name">Disjuntor Geral</span>
                <span className="qdc-device-spec">{plan.qdc.mainBreakerA}A Bipolar</span>
              </div>
              <div className="qdc-bus-label">Barramento</div>
            </div>

            <div className="qdc-rows">
              {/* DR groups first */}
              {plan.qdc.drGroups.map((dr, i) => (
                <div key={dr.id} className="qdc-dr-group">
                  <div className="qdc-device dr-device">
                    <span className="qdc-device-code">DR{i+1}</span>
                    <span className="qdc-device-name">{dr.name}</span>
                    <span className="qdc-device-spec">{dr.breakerA}A 30mA AC</span>
                  </div>
                  <div className="qdc-dr-circuits">
                    {dr.circuitIds.map((cid, j) => {
                      const circ = plan.qdc.circuits.find(c => c.id === cid);
                      const idx = plan.qdc.circuits.indexOf(circ!);
                      return circ ? (
                        <div key={j} className="qdc-device circuit-device dr-protected">
                          <span className="qdc-device-code">C{String(idx + 1).padStart(2, '0')}</span>
                          <span className="qdc-device-name">{circ.name}</span>
                          <span className="qdc-device-spec">{circ.breakerA}A · {circ.conductorLabel}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}

              {/* Remaining circuits (not under DR) */}
              {plan.qdc.circuits.filter(c => !c.requiresDR).map((c) => {
                const typeInfo = CIRCUIT_TYPE_LABEL[c.type] ?? { label: c.type, color: '#888' };
                return (
                  <div key={c.id} className="qdc-device circuit-device" style={{ borderLeftColor: typeInfo.color }}>
                    <span className="qdc-device-code">C{String(plan.qdc.circuits.indexOf(c) + 1).padStart(2, '0')}</span>
                    <span className="qdc-device-name">{c.name}</span>
                    <span className="qdc-device-spec">{c.breakerA}A · {c.conductorLabel}</span>
                  </div>
                );
              })}
            </div>

            <div className="qdc-footer">
              Total: {plan.qdc.totalSlots} posições · {plan.qdc.circuits.length} circuitos · {plan.qdc.drGroups.length} DRs
            </div>
          </div>

          <div className="qdc-entry-info">
            <h3>🔌 Ramal de Entrada</h3>
            <table className="cr-table">
              <tbody>
                <tr><td>Distância Poste → Medidor</td><td><strong>{plan.distancePoleToMeterM}m</strong></td></tr>
                <tr><td>Distância Medidor → QDC</td><td><strong>{plan.distanceMeterToQDCM}m</strong></td></tr>
                <tr><td>Corrente de Entrada</td><td><strong>{plan.mainCurrentA}A</strong></td></tr>
                <tr><td>Condutor de Entrada (3×)</td><td><strong>{plan.entryConductorLabel}</strong></td></tr>
                <tr><td>Disjuntor Geral (DG)</td><td><strong>{plan.entryBreakerA}A bipolar</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: BOM ── */}
      {activeTab === 'bom' && (
        <div className="cr-content">
          {Object.entries(bomByCategory).map(([cat, items]) => {
            const catInfo = BOM_CATEGORY_LABEL[cat] ?? { label: cat, icon: '📦' };
            return (
              <div key={cat} className="cr-bom-group">
                <div className="cr-bom-group-header">{catInfo.icon} {catInfo.label}</div>
                <table className="cr-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th className="num">Un.</th>
                      <th className="num">Qtd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.code}>
                        <td className="code-cell">{item.code}</td>
                        <td>{item.description}</td>
                        <td className="num">{item.unit}</td>
                        <td className="num"><strong>{item.quantity}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          <div className="cr-bom-footer">
            {bom.length} itens gerados automaticamente com base na NBR 5410:2004 · {plan.generatedAt}
          </div>
        </div>
      )}
    </div>
  );
}
