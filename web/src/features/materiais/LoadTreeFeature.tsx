import { useState, useMemo, useCallback } from 'react';
import type { LoadNode, LoadNodeType, LoadTree } from './loadTreeModel';
import { makeNode, DEFAULT_DEMAND_FACTORS } from './loadTreeModel';
import type {
  RoomFunction, MoistureClass, LocationClass,
  FireRiskClass, TempClass, InstallationMethod,
  LoadUsageClass, GroundingSystem, SupplyType, DPSClass,
} from './nbrCatalog';
import {
  ROOM_FUNCTION_LABELS, MOISTURE_CLASS_LABELS, LOCATION_LABELS,
  FIRE_RISK_LABELS, INSTALLATION_METHOD_LABELS, SUPPLY_TYPE_LABELS,
  GROUNDING_LABELS, LOAD_USAGE_LABELS, requiresDR, minOutlets,
} from './nbrCatalog';
import { calcTree, getChildren, validateNode } from './loadTreeCalc';
import './loadTree.css';

type Props = {
  project?: any;
  tree: LoadTree;
  onTreeChange: (tree: LoadTree) => void;
  onGenerateReport?: () => void;
};

const TYPE_ICONS: Record<LoadNodeType, string> = {
  terrain:  '🗺️',
  building: '🏠',
  room:     '🚪',
  circuit:  '⚡',
  load:     '🔌',
};

const TYPE_LABELS: Record<LoadNodeType, string> = {
  terrain:  'Terreno',
  building: 'Edificação',
  room:     'Cômodo',
  circuit:  'Circuito',
  load:     'Carga',
};

const CHILD_TYPES: Partial<Record<LoadNodeType, LoadNodeType[]>> = {
  terrain:  ['building'],
  building: ['room'],
  room:     ['room', 'circuit', 'load'],
  circuit:  ['load'],
};

function conductorBadgeColor(drop: number): string {
  if (drop === 0) return 'badge-neutral';
  if (drop <= 3)  return 'badge-ok';
  if (drop <= 4)  return 'badge-warn';
  return 'badge-error';
}

export function LoadTreeFeature({ tree, onTreeChange, onGenerateReport }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Run calculation engine on every tree change
  const computed = useMemo(() => calcTree(tree), [tree]);

  const computedMap = useMemo(() => {
    const m = new Map<string, LoadNode>();
    for (const n of computed) m.set(n.id, n);
    return m;
  }, [computed]);

  const selectedNode = selectedId ? computedMap.get(selectedId) ?? null : null;

  // ── Tree mutations ──────────────────────────────────────────────────────────

  const updateNode = useCallback((id: string, patch: Partial<LoadNode>) => {
    onTreeChange({
      ...tree,
      nodes: tree.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
    });
  }, [tree, onTreeChange]);

  const addChild = useCallback((parentId: string, type: LoadNodeType) => {
    const labels: Record<LoadNodeType, string> = {
      terrain: 'Novo Terreno', building: 'Nova Edificação',
      room: 'Novo Cômodo', circuit: 'Novo Circuito', load: 'Nova Carga',
    };
    const node = makeNode({ parentId, type, name: labels[type] });
    onTreeChange({ ...tree, nodes: [...tree.nodes, node] });
    setSelectedId(node.id);
  }, [tree, onTreeChange]);

  const deleteNode = useCallback((id: string) => {
    // Also remove all descendants
    const toRemove = new Set<string>();
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift()!;
      toRemove.add(cur);
      for (const n of tree.nodes) {
        if (n.parentId === cur) queue.push(n.id);
      }
    }
    onTreeChange({ ...tree, nodes: tree.nodes.filter(n => !toRemove.has(n.id)) });
    if (selectedId && toRemove.has(selectedId)) setSelectedId(null);
  }, [tree, onTreeChange, selectedId]);

  const toggleExpand = useCallback((id: string) => {
    updateNode(id, { expanded: !tree.nodes.find(n => n.id === id)?.expanded });
  }, [tree, updateNode]);

  // ── Rendering ───────────────────────────────────────────────────────────────

  function renderNode(node: LoadNode, depth: number): React.ReactNode {
    const cn = computedMap.get(node.id);
    const children = getChildren(node.id, computed);
    const hasChildren = children.length > 0;
    const warnings = cn ? validateNode(cn) : [];
    const isSelected = node.id === selectedId;

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-row depth-${Math.min(depth, 5)} ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${8 + depth * 18}px` }}
          onClick={() => setSelectedId(node.id)}
        >
          {/* Expand toggle */}
          <span
            className="tree-toggle"
            onClick={e => { e.stopPropagation(); toggleExpand(node.id); }}
          >
            {hasChildren ? (node.expanded ? '▼' : '▶') : '·'}
          </span>

          {/* Icon + name */}
          <span className="tree-icon">{TYPE_ICONS[node.type]}</span>
          <span className="tree-name">{node.name}</span>

          {/* Badges */}
          <div className="tree-badges">
            {cn?.computed && cn.computed.demandPowerW > 0 && (
              <span className="badge badge-neutral">
                {cn.computed.demandPowerW < 1000
                  ? `${cn.computed.demandPowerW}W`
                  : `${(cn.computed.demandPowerW / 1000).toFixed(2)}kW`}
              </span>
            )}
            {cn?.computed && cn.computed.currentA > 0 && (
              <span className="badge badge-neutral">{cn.computed.currentA}A</span>
            )}
            {cn?.computed && cn.computed.conductorLabel && cn.computed.currentA > 0 && (
              <span className={`badge ${conductorBadgeColor(cn.computed.voltageDrop)}`}>
                {cn.computed.conductorLabel}
              </span>
            )}
            {cn?.computed && cn.computed.breakerA > 0 && cn.computed.currentA > 0 && (
              <span className="badge badge-neutral">DJ {cn.computed.breakerA}A</span>
            )}
            {warnings.length > 0 && (
              <span className="badge badge-error" title={warnings.join(' | ')}>⚠ {warnings.length}</span>
            )}
          </div>

          {/* Quick add child */}
          {CHILD_TYPES[node.type]?.map(childType => (
            <button
              key={childType}
              className="tree-add-btn"
              title={`Adicionar ${TYPE_LABELS[childType]}`}
              onClick={e => { e.stopPropagation(); addChild(node.id, childType); }}
            >
              +{TYPE_ICONS[childType]}
            </button>
          ))}
        </div>

        {node.expanded && hasChildren && (
          <div className="tree-children">
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  const roots = getChildren(null, computed);

  return (
    <div className="load-tree-layout">
      {/* LEFT: Tree */}
      <div className="load-tree-panel">
        <div className="load-tree-header">
          <span>📊 Árvore de Cargas</span>
          <div className="load-tree-header-right">
            <span className="load-tree-subtitle">
              {computed[0]?.computed
                ? `${(computed[0].computed.demandPowerW / 1000).toFixed(2)}kW · ${computed[0].computed.currentA}A`
                : ''}
            </span>
            {onGenerateReport && (
              <button className="generate-report-btn" onClick={onGenerateReport}>
                ⚡ Gerar Relatório NBR 5410
              </button>
            )}
          </div>
        </div>
        <div className="load-tree-content custom-scrollbar">
          {roots.map(r => renderNode(r, 0))}
        </div>
      </div>

      {/* RIGHT: Properties */}
      <div className="load-tree-props">
        {selectedNode ? (
          <NodeProperties
            node={selectedNode}
            tree={tree}
            onChange={patch => updateNode(selectedNode.id, patch)}
            onDelete={() => deleteNode(selectedNode.id)}
            onAddChild={addChild}
          />
        ) : (
          <div className="props-empty">
            <span>📐</span>
            <p>Selecione um nó na árvore para editar suas propriedades</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Node Properties Panel ────────────────────────────────────────────────────

type NodePropsProps = {
  node: LoadNode;
  tree: LoadTree;
  onChange: (patch: Partial<LoadNode>) => void;
  onDelete: () => void;
  onAddChild: (parentId: string, type: LoadNodeType) => void;
};

function NodeProperties({ node, tree, onChange, onDelete, onAddChild }: NodePropsProps) {
  const c = node.computed;
  const warnings = c ? validateNode(node) : [];

  // Derive DR requirement from room classification
  const drInfo = (node.type === 'room' && node.roomFunction && node.moistureClass && node.locationClass)
    ? requiresDR(node.roomFunction, node.moistureClass, node.locationClass)
    : null;

  // Derive minimum outlets
  const minOut = (node.type === 'room' && node.roomFunction)
    ? minOutlets(node.roomFunction, node.areaM2 ?? 0, node.perimeterM ?? 0)
    : null;

  return (
    <div className="node-props-content custom-scrollbar">
      {/* Header */}
      <div className="node-props-header">
        <span className="node-type-badge">{TYPE_ICONS[node.type]} {TYPE_LABELS[node.type]}</span>
        {node.parentId && (
          <button className="props-delete-btn" onClick={onDelete} title="Excluir nó e filhos">🗑️</button>
        )}
      </div>

      {/* Name */}
      <div className="prop-group">
        <label>Nome</label>
        <input className="prop-input" value={node.name} onChange={e => onChange({ name: e.target.value })} />
      </div>

      {/* ── TERRAIN ── */}
      {node.type === 'terrain' && (<>
        <div className="prop-group">
          <label className="prop-section-label">🔌 Fornecimento</label>
          <div className="prop-field">
            <label>Tipo de Fornecimento</label>
            <select className="prop-input" value={node.supplyType ?? 'bi_127_220'}
              onChange={e => onChange({ supplyType: e.target.value as SupplyType })}>
              {Object.entries(SUPPLY_TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-row">
            <div className="prop-field">
              <label>Poste → Medidor (m)</label>
              <input type="number" className="prop-input" value={node.distancePoleToMeterM ?? 5}
                onChange={e => onChange({ distancePoleToMeterM: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="prop-field">
              <label>Medidor → QDC (m)</label>
              <input type="number" className="prop-input" value={node.distanceMeterToQDCM ?? 3}
                onChange={e => onChange({ distanceMeterToQDCM: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="prop-row">
            <label className="prop-checkbox">
              <input type="checkbox" checked={!!node.hasEnergyMeter} onChange={e => onChange({ hasEnergyMeter: e.target.checked })} />
              Relógio Medidor
            </label>
            <label className="prop-checkbox">
              <input type="checkbox" checked={!!node.hasQDC} onChange={e => onChange({ hasQDC: e.target.checked })} />
              QDC Principal
            </label>
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-section-label">🛡️ Proteção e Aterramento</label>
          <div className="prop-field">
            <label>Sistema de Aterramento (NBR 5410 §5.1)</label>
            <select className="prop-input" value={node.groundingSystem ?? 'TT'}
              onChange={e => onChange({ groundingSystem: e.target.value as GroundingSystem })}>
              {Object.entries(GROUNDING_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-field">
            <label>DPS — Proteção contra Surtos (NBR 5410/Emenda 1:2008)</label>
            <select className="prop-input" value={node.dpsClass ?? 'CT2'}
              onChange={e => onChange({ dpsClass: e.target.value as DPSClass })}>
              <option value="none">Sem DPS</option>
              <option value="CT1">Classe I — Entrada (raio)</option>
              <option value="CT2">Classe II — QDC principal ★ recomendado</option>
              <option value="CT1+2">Classes I+II — Coordenado (máx. proteção)</option>
            </select>
          </div>
        </div>
      </>)}

      {/* ── BUILDING ── */}
      {node.type === 'building' && (
        <div className="prop-group">
          <label className="prop-section-label">🏠 Edificação</label>
          <div className="prop-field">
            <label>Distância ao QDC principal (m)</label>
            <input type="number" className="prop-input" value={node.distanceToParentM ?? 0}
              onChange={e => onChange({ distanceToParentM: parseFloat(e.target.value) || 0 })} />
          </div>
          <label className="prop-checkbox">
            <input type="checkbox" checked={!!node.hasQDC} onChange={e => onChange({ hasQDC: e.target.checked })} />
            Possui sub-QDC nesta edificação
          </label>
        </div>
      )}

      {/* ── ROOM ── */}
      {node.type === 'room' && (<>
        <div className="prop-group">
          <label className="prop-section-label">🚪 Identificação do Cômodo</label>
          <div className="prop-field">
            <label>Função do Cômodo (define mínimos NBR 5410 §9.7.2)</label>
            <select className="prop-input" value={node.roomFunction ?? 'other'}
              onChange={e => onChange({ roomFunction: e.target.value as RoomFunction })}>
              {Object.entries(ROOM_FUNCTION_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-row">
            <div className="prop-field">
              <label>Área (m²)</label>
              <input type="number" className="prop-input" min={0} value={node.areaM2 ?? 0}
                onChange={e => onChange({ areaM2: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="prop-field">
              <label>Perímetro (m)</label>
              <input type="number" className="prop-input" min={0} value={node.perimeterM ?? 0}
                onChange={e => onChange({ perimeterM: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="prop-field">
            <label>Distância ao QDC (m)</label>
            <input type="number" className="prop-input" value={node.distanceToParentM ?? 0}
              onChange={e => onChange({ distanceToParentM: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-section-label">🌊 Classificação Ambiental (NBR 5410 §3.3 / IEC 60364-3)</label>
          <div className="prop-field">
            <label>Umidade</label>
            <select className="prop-input" value={node.moistureClass ?? 'dry'}
              onChange={e => onChange({ moistureClass: e.target.value as MoistureClass })}>
              {Object.entries(MOISTURE_CLASS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-field">
            <label>Localização</label>
            <select className="prop-input" value={node.locationClass ?? 'internal'}
              onChange={e => onChange({ locationClass: e.target.value as LocationClass })}>
              {Object.entries(LOCATION_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-field">
            <label>Temperatura Ambiente</label>
            <select className="prop-input" value={node.tempClass ?? 'normal'}
              onChange={e => onChange({ tempClass: e.target.value as TempClass })}>
              <option value="cold">❄️ Frio (&lt;0°C) — câmara frigorífica</option>
              <option value="normal">🌡️ Normal (10–40°C) ★ padrão</option>
              <option value="hot">🔥 Quente (&gt;40°C) — cozinha industrial, casa de máquinas</option>
            </select>
          </div>
          <div className="prop-field">
            <label>Risco de Incêndio (NBR 5418)</label>
            <select className="prop-input" value={node.fireRisk ?? 'normal'}
              onChange={e => onChange({ fireRisk: e.target.value as FireRiskClass })}>
              {Object.entries(FIRE_RISK_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {drInfo?.required && (
            <div className="prop-warning">⚡ DR 30mA tipo {drInfo.drType} obrigatório — {drInfo.reason}</div>
          )}
        </div>

        {minOut && (
          <div className="prop-group computed-section">
            <label className="prop-section-label">✅ Mínimos NBR 5410 para este cômodo</label>
            <div className="computed-grid">
              <div className="computed-row"><span>TUG mínimas</span><strong>{minOut.tugMin} tomada(s)</strong></div>
              {minOut.tueMin.length > 0 && <div className="computed-row"><span>TUE obrigatórias</span><strong>{minOut.tueMin.join(', ')}</strong></div>}
              <div className="computed-row"><span>DR obrigatório</span><strong className={minOut.drRequired ? 'text-error' : 'text-ok'}>{minOut.drRequired ? 'SIM' : 'NÃO'}</strong></div>
              <div className="computed-row"><span>IP mínimo equipamentos</span><strong>{minOut.ipMinRequired}</strong></div>
            </div>
            {minOut.notes.map((n,i) => <div key={i} className="prop-warning">{n}</div>)}
          </div>
        )}
      </>)}

      {/* ── LOAD ── */}
      {node.type === 'load' && (<>
        <div className="prop-group">
          <label className="prop-section-label">⚡ Dados da Carga</label>
          <div className="prop-field">
            <label>Tipo de Carga (agrupamento de circuito NBR 5410 §9.1)</label>
            <select className="prop-input" value={node.loadType ?? 'outlet'}
              onChange={e => onChange({ loadType: e.target.value as any })}>
              <option value="outlet">🔌 Tomada de uso geral (TUG)</option>
              <option value="lighting">💡 Iluminação</option>
              <option value="dedicated">⚡ Tomada de uso específico (TUE) — circuito dedicado</option>
            </select>
          </div>
          <div className="prop-field">
            <label>Regime de Uso</label>
            <select className="prop-input" value={node.usageClass ?? 'intermittent'}
              onChange={e => onChange({ usageClass: e.target.value as LoadUsageClass })}>
              {Object.entries(LOAD_USAGE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-row">
            <div className="prop-field">
              <label>Potência unitária (W)</label>
              <input type="number" className="prop-input" min={0} value={node.powerW ?? 0}
                onChange={e => onChange({ powerW: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="prop-field">
              <label>Quantidade</label>
              <input type="number" className="prop-input" min={1} value={node.quantity ?? 1}
                onChange={e => onChange({ quantity: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="prop-row">
            <div className="prop-field">
              <label>Tensão</label>
              <select className="prop-input" value={node.voltage ?? tree.voltage}
                onChange={e => onChange({ voltage: parseInt(e.target.value) as any })}>
                <option value={127}>127V</option>
                <option value={220}>220V</option>
                <option value={380}>380V (trifásico)</option>
              </select>
            </div>
            <div className="prop-field">
              <label>Fase</label>
              <select className="prop-input" value={node.phase ?? tree.phase}
                onChange={e => onChange({ phase: e.target.value as any })}>
                <option value="1F">Monofásico (1F)</option>
                <option value="2F">Bifásico (2F)</option>
                <option value="3F">Trifásico (3F)</option>
              </select>
            </div>
          </div>
          <div className="prop-field">
            <label>Fator de Potência (cosφ)</label>
            <input type="number" className="prop-input" min={0.5} max={1} step={0.01}
              value={node.powerFactor ?? 0.92}
              onChange={e => onChange({ powerFactor: parseFloat(e.target.value) || 0.92 })} />
          </div>
          <label className="prop-checkbox">
            <input type="checkbox" checked={!!node.isCritical}
              onChange={e => onChange({ isCritical: e.target.checked })} />
            Disjuntor exclusivo / circuito dedicado obrigatório
          </label>
        </div>

        <div className="prop-group">
          <label className="prop-section-label">📏 Instalação</label>
          <div className="prop-field">
            <label>Método de Instalação (NBR 5410 Tab. 33 — afeta bitola)</label>
            <select className="prop-input" value={node.installationMethod ?? 'B1'}
              onChange={e => onChange({ installationMethod: e.target.value as InstallationMethod })}>
              {Object.entries(INSTALLATION_METHOD_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="prop-row">
            <div className="prop-field">
              <label>Comprimento do circuito (m)</label>
              <input type="number" className="prop-input" min={0} value={node.circuitLengthM ?? 0}
                onChange={e => onChange({ circuitLengthM: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="prop-field">
              <label>Circuitos no mesmo eletroduto</label>
              <input type="number" className="prop-input" min={1} max={10} value={node.conductorGrouping ?? 1}
                onChange={e => onChange({ conductorGrouping: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
        </div>
      </>)}

      {/* ── Demand Factor (all) ── */}
      <div className="prop-group">
        <label className="prop-section-label">📊 Fator de Demanda ({Math.round((node.demandFactor ?? DEFAULT_DEMAND_FACTORS[node.type]) * 100)}%)</label>
        <input type="range" min={0.1} max={1} step={0.05} className="prop-range"
          value={node.demandFactor ?? DEFAULT_DEMAND_FACTORS[node.type]}
          onChange={e => onChange({ demandFactor: parseFloat(e.target.value) })} />
      </div>

      {/* ── Computed Results ── */}
      {c && c.currentA > 0 && (
        <div className="prop-group computed-section">
          <label className="prop-section-label">✅ Resultados do Cálculo</label>
          <div className="computed-grid">
            <div className="computed-row"><span>Potência Instalada</span><strong>{c.installedPowerW < 1000 ? `${c.installedPowerW}W` : `${(c.installedPowerW/1000).toFixed(2)}kW`}</strong></div>
            <div className="computed-row"><span>Demanda Calculada</span><strong>{c.demandPowerW < 1000 ? `${c.demandPowerW}W` : `${(c.demandPowerW/1000).toFixed(2)}kW`}</strong></div>
            <div className="computed-row"><span>Corrente (I)</span><strong>{c.currentA}A</strong></div>
            <div className="computed-row"><span>Bitola Recomendada</span><strong className={c.voltageDrop > 4 ? 'text-warn' : 'text-ok'}>{c.conductorLabel}</strong></div>
            <div className="computed-row"><span>Queda de Tensão</span><strong className={c.voltageDrop > 4 ? 'text-error' : c.voltageDrop > 3 ? 'text-warn' : 'text-ok'}>{c.voltageDrop}%</strong></div>
            <div className="computed-row"><span>Disjuntor</span><strong>{c.breakerA}A</strong></div>
            {c.qdcSlotsNeeded > 0 && <div className="computed-row"><span>Slots QDC</span><strong>{c.qdcSlotsNeeded} ({c.qdcSlotsNeeded <= 12 ? 'QDC-12' : c.qdcSlotsNeeded <= 24 ? 'QDC-24' : 'QDC-36+'})</strong></div>}
          </div>
        </div>
      )}

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <div className="prop-group">
          <label className="prop-section-label">⚠️ Alertas Técnicos</label>
          {warnings.map((w,i) => <div key={i} className="prop-warning">{w}</div>)}
        </div>
      )}

      {/* ── Add children ── */}
      {CHILD_TYPES[node.type] && (
        <div className="prop-group">
          <label className="prop-section-label">Adicionar</label>
          <div className="prop-add-btns">
            {CHILD_TYPES[node.type]!.map(type => (
              <button key={type} className="prop-add-btn" onClick={() => onAddChild(node.id, type)}>
                {TYPE_ICONS[type]} {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
