import { useState, useMemo } from 'react';
import type { ResidentialProject } from '../../domain/residential-projects';
import { deriveMaterials, calcTotal, groupByCategory, type MaterialItem } from './materialsEngine';
import { LoadTreeFeature } from './LoadTreeFeature';
import { buildStarterTree } from './loadTreeModel';
import type { LoadTree } from './loadTreeModel';
import { CircuitReportFeature } from './CircuitReportFeature';
import './materiais.css';

type Props = {
  project: ResidentialProject;
};

type Phase = 'tree' | 'report' | 'bom';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  'estrutura': { label: 'Estrutura e Fixação', icon: '🧱' },
  'instalação': { label: 'Instalação Geral', icon: '🔧' },
  'condutores': { label: 'Condutores e Eletrodutos', icon: '🔌' },
  'proteção': { label: 'Proteção (Disjuntores / QDC)', icon: '⚡' },
  'dispositivos': { label: 'Dispositivos e Cargas', icon: '💡' },
};

export function MateriaisFeature({ project }: Props) {
  const canvas = project.canvas;
  const [phase, setPhase] = useState<Phase>('tree');
  const [loadTree, setLoadTree] = useState<LoadTree>(() => buildStarterTree(project.name));

  const baseMaterials = useMemo(() =>
    deriveMaterials(canvas.items, canvas.links, canvas.nodes),
    [canvas.items, canvas.links, canvas.nodes]
  );

  const [overrides, setOverrides] = useState<Record<string, Partial<MaterialItem>>>({});
  const [extraItems, setExtraItems] = useState<MaterialItem[]>([]);
  const [notes, setNotes] = useState('');

  const materials: MaterialItem[] = useMemo(() => {
    const merged = baseMaterials.map(m => ({ ...m, ...overrides[m.code] }));
    return [...merged, ...extraItems];
  }, [baseMaterials, overrides, extraItems]);

  const groups = useMemo(() => groupByCategory(materials), [materials]);
  const total = useMemo(() => calcTotal(materials), [materials]);

  function updateItem(code: string, patch: Partial<MaterialItem>) {
    setOverrides(prev => ({
      ...prev,
      [code]: { ...(prev[code] ?? {}), ...patch },
    }));
  }

  function addExtraItem() {
    const id = `manual-${Date.now()}`;
    setExtraItems(prev => [...prev, {
      id,
      code: `ITEM-${prev.length + 1}`,
      description: 'Novo item',
      unit: 'un',
      quantity: 1,
      unitCost: 0,
      origin: 'manual',
      category: 'instalação',
    }]);
  }

  function updateExtraItem(id: string, patch: Partial<MaterialItem>) {
    setExtraItems(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  function removeExtraItem(id: string) {
    setExtraItems(prev => prev.filter(m => m.id !== id));
  }


  return (
    <div className="materiais-page">
      {/* Phase Tabs + Header Actions */}
      <header className="mat-header">
        <div className="mat-phase-tabs">
          <button
            className={`mat-phase-tab ${phase === 'tree' ? 'active' : ''}`}
            onClick={() => setPhase('tree')}
          >
            📊 Fase 1 — Árvore de Cargas
          </button>
          <button
            className={`mat-phase-tab ${phase === 'report' ? 'active' : ''}`}
            onClick={() => setPhase('report')}
          >
            ⚡ Fase 2 — Circuitos NBR 5410
          </button>
          <button
            className={`mat-phase-tab ${phase === 'bom' ? 'active' : ''}`}
            onClick={() => setPhase('bom')}
          >
            📋 Fase 3 — Lista de Materiais
          </button>
        </div>
        <div className="mat-header-info">
          <strong>{project.name}</strong>
          <span className="mat-client-label">{project.clientName} · {project.city}/{project.state}</span>
        </div>
        <div className="mat-header-actions">
          {phase === 'bom' && (
            <button className="mat-btn secondary" onClick={addExtraItem}>＋ Item Manual</button>
          )}
          <button className="mat-btn primary" onClick={() => window.print()}>🖨️ Relatório PDF</button>
        </div>
      </header>

      {/* Phase 1: Load Tree */}
      {phase === 'tree' && (
        <div className="mat-tree-container">
          <LoadTreeFeature
            tree={loadTree}
            onTreeChange={setLoadTree}
            onGenerateReport={() => setPhase('report')}
          />
        </div>
      )}

      {/* Phase 2: Circuit Report (NBR 5410) */}
      {phase === 'report' && (
        <div className="mat-tree-container">
          <CircuitReportFeature
            project={project}
            tree={loadTree}
            onBack={() => setPhase('tree')}
          />
        </div>
      )}

      {/* Phase 3: Bill of Materials */}
      {phase === 'bom' && (
        <>
          {/* Summary Cards */}
          <div className="mat-summary-row">
        <div className="mat-card">
          <span className="mat-card-label">Total de Itens</span>
          <strong className="mat-card-value">{materials.length}</strong>
        </div>
        <div className="mat-card">
          <span className="mat-card-label">Itens no Canvas</span>
          <strong className="mat-card-value">{canvas.items.length}</strong>
        </div>
        <div className="mat-card">
          <span className="mat-card-label">Paredes / Ramais</span>
          <strong className="mat-card-value">{canvas.links.length}m est.</strong>
        </div>
        <div className="mat-card accent">
          <span className="mat-card-label">Custo Total Estimado</span>
          <strong className="mat-card-value">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>

      {/* Materials Table by Category */}
      <div className="mat-content">
        {Object.entries(groups).map(([cat, items]) => {
          const catInfo = CATEGORY_LABELS[cat] ?? { label: cat, icon: '📦' };
          const catTotal = calcTotal(items);
          return (
            <div key={cat} className="mat-group">
              <div className="mat-group-header">
                <span>{catInfo.icon} {catInfo.label}</span>
                <span className="mat-group-total">
                  {catTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <table className="mat-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Un.</th>
                    <th className="num">Qtd</th>
                    <th className="num">Vl. Unit (R$)</th>
                    <th className="num">Total (R$)</th>
                    <th className="action-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className={item.origin === 'manual' ? 'manual-row' : ''}>
                      <td>
                        <input
                          className="mat-input code-input"
                          value={item.code}
                          onChange={e => item.origin === 'manual'
                            ? updateExtraItem(item.id, { code: e.target.value })
                            : updateItem(item.code, { code: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="mat-input desc-input"
                          value={item.description}
                          onChange={e => item.origin === 'manual'
                            ? updateExtraItem(item.id, { description: e.target.value })
                            : updateItem(item.code, { description: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="mat-input unit-input"
                          value={item.unit}
                          onChange={e => item.origin === 'manual'
                            ? updateExtraItem(item.id, { unit: e.target.value as MaterialItem['unit'] })
                            : updateItem(item.code, { unit: e.target.value as MaterialItem['unit'] })
                          }
                        >
                          <option value="un">un</option>
                          <option value="m">m</option>
                          <option value="cx">cx</option>
                          <option value="rolo">rolo</option>
                          <option value="par">par</option>
                        </select>
                      </td>
                      <td className="num">
                        <input
                          className="mat-input num-input"
                          type="number"
                          min={0}
                          step={0.5}
                          value={item.quantity}
                          onChange={e => {
                            const v = parseFloat(e.target.value) || 0;
                            item.origin === 'manual'
                              ? updateExtraItem(item.id, { quantity: v })
                              : updateItem(item.code, { quantity: v });
                          }}
                        />
                      </td>
                      <td className="num">
                        <input
                          className="mat-input num-input"
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitCost}
                          onChange={e => {
                            const v = parseFloat(e.target.value) || 0;
                            item.origin === 'manual'
                              ? updateExtraItem(item.id, { unitCost: v })
                              : updateItem(item.code, { unitCost: v });
                          }}
                        />
                      </td>
                      <td className="num total-cell">
                        {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="action-col">
                        {item.origin === 'manual' && (
                          <button className="mat-del-btn" onClick={() => removeExtraItem(item.id)} title="Remover">✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Notes */}
        <div className="mat-notes-section">
          <label className="mat-notes-label">Observações Técnicas / Memória de Cálculo</label>
          <textarea
            className="mat-notes-input"
            placeholder="Descreva considerações especiais, marcas especificadas, condições do local, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
          />
        </div>

        {/* Grand Total Footer */}
        <div className="mat-total-footer">
          <div className="mat-total-label">TOTAL GERAL ESTIMADO</div>
          <div className="mat-total-value">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="mat-disclaimer">
            * Valores estimados baseados em referência de mercado. Sujeito a variação conforme cotação local e especificação de projeto.
          </p>
        </div>
      </div>
    </>
  )}
  </div>
  );
}
