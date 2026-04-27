import { useState, useMemo, useCallback } from 'react';
import type { LoadNode, LoadNodeType, LoadTree, RoomType, LoadType } from './loadTreeModel';
import { makeNode, DEFAULT_DEMAND_FACTORS } from './loadTreeModel';
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

  return (
    <div className="node-props-content custom-scrollbar">
      {/* Header */}
      <div className="node-props-header">
        <span className="node-type-badge">{TYPE_ICONS[node.type]} {TYPE_LABELS[node.type]}</span>
        {node.parentId && (
          <button className="props-delete-btn" onClick={onDelete} title="Excluir nó e filhos">
            🗑️
          </button>
        )}
      </div>

      {/* Name */}
      <div className="prop-group">
        <label>Nome</label>
        <input
          className="prop-input"
          value={node.name}
          onChange={e => onChange({ name: e.target.value })}
        />
      </div>

      {/* Infrastructure (terrain / building) */}
      {(node.type === 'terrain') && (
        <div className="prop-group">
          <label className="prop-section-label">🔌 Infraestrutura de Entrada</label>
          <div className="prop-row">
            <div className="prop-field">
              <label>Dist. Poste → Medidor (m)</label>
              <input type="number" className="prop-input" value={node.distancePoleToMeterM ?? 0}
                onChange={e => onChange({ distancePoleToMeterM: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="prop-field">
              <label>Dist. Medidor → QDC (m)</label>
              <input type="number" className="prop-input" value={node.distanceMeterToQDCM ?? 0}
                onChange={e => onChange({ distanceMeterToQDCM: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="prop-row">
            <label className="prop-checkbox">
              <input type="checkbox" checked={!!node.hasEnergyMeter}
                onChange={e => onChange({ hasEnergyMeter: e.target.checked })} />
              Possui Relógio Medidor
            </label>
            <label className="prop-checkbox">
              <input type="checkbox" checked={!!node.hasQDC}
                onChange={e => onChange({ hasQDC: e.target.checked })} />
              Possui QDC Principal
            </label>
          </div>
        </div>
      )}

      {/* Room type — critical for DR requirements */}
      {(node.type === 'room') && (
        <div className="prop-group">
          <label className="prop-section-label">🚿 Tipo de Ambiente (NBR 5410 §9.4.2.3)</label>
          <div className="prop-row">
            <div className="prop-field">
              <label>Classificação</label>
              <select className="prop-input" value={node.roomType ?? 'dry'}
                onChange={e => onChange({ roomType: e.target.value as RoomType })}>
                <option value="dry">🏠 Seco (sala, quarto, escritório)</option>
                <option value="wet">🚿 Molhado — DR obrigatório (banheiro, cozinha, lavanderia)</option>
                <option value="outdoor">🌳 Externo — DR obrigatório (garagem, área de serviço externa)</option>
              </select>
            </div>
          </div>
          <div className="prop-field">
            <label>Área (m²) — verificação de mínimo de tomadas</label>
            <input type="number" className="prop-input" min={0} value={node.areaM2 ?? 0}
              onChange={e => onChange({ areaM2: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="prop-field">
            <label>Distância ao QDC (m)</label>
            <input type="number" className="prop-input" value={node.distanceToParentM ?? 0}
              onChange={e => onChange({ distanceToParentM: parseFloat(e.target.value) || 0 })} />
          </div>
          {(node.roomType === 'wet' || node.roomType === 'outdoor') && (
            <div className="prop-warning">⚠️ Ambiente molhado/externo: DR 30mA obrigatório (NBR 5410 §9.4.2.3)</div>
          )}
        </div>
      )}

      {/* Load inputs */}
      {node.type === 'load' && (
        <div className="prop-group">
          <label className="prop-section-label">⚡ Dados da Carga</label>

          <div className="prop-field">
            <label>Tipo de Carga (NBR 5410 agrupamento)</label>
            <select className="prop-input" value={node.loadType ?? 'outlet'}
              onChange={e => onChange({ loadType: e.target.value as LoadType })}>
              <option value="outlet">🔌 Tomada geral</option>
              <option value="lighting">💡 Iluminação</option>
              <option value="dedicated">⚡ Dedicado (circuito exclusivo)</option>
            </select>
          </div>

          <div className="prop-field">
            <label>Comprimento do circuito (m)</label>
            <input type="number" className="prop-input" min={0} value={node.circuitLengthM ?? 0}
              onChange={e => onChange({ circuitLengthM: parseFloat(e.target.value) || 0 })} />
          </div>

          <div className="prop-row">
            <div className="prop-field">
              <label>Potência unitária (W)</label>
              <input type="number" className="prop-input" value={node.powerW ?? 0}
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
                onChange={e => onChange({ voltage: parseInt(e.target.value) as 127 | 220 })}>
                <option value={127}>127V</option>
                <option value={220}>220V</option>
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
          <label className="prop-checkbox">
            <input type="checkbox" checked={!!node.isCritical}
              onChange={e => onChange({ isCritical: e.target.checked })} />
            Circuito dedicado (disjuntor exclusivo)
          </label>
        </div>
      )}

      {/* Demand factor (all types) */}
      <div className="prop-group">
        <label className="prop-section-label">📊 Fator de Demanda</label>
        <div className="prop-field">
          <label>Fator ({Math.round((node.demandFactor ?? 1) * 100)}%)</label>
          <input type="range" min={0.1} max={1} step={0.05}
            className="prop-range"
            value={node.demandFactor ?? DEFAULT_DEMAND_FACTORS[node.type]}
            onChange={e => onChange({ demandFactor: parseFloat(e.target.value) })} />
        </div>
      </div>

      {/* Computed Results */}
      {c && (
        <div className="prop-group computed-section">
          <label className="prop-section-label">✅ Resultados do Cálculo</label>
          <div className="computed-grid">
            <div className="computed-row">
              <span>Potência Instalada</span>
              <strong>{c.installedPowerW < 1000 ? `${c.installedPowerW}W` : `${(c.installedPowerW/1000).toFixed(2)}kW`}</strong>
            </div>
            <div className="computed-row">
              <span>Demanda Calculada</span>
              <strong>{c.demandPowerW < 1000 ? `${c.demandPowerW}W` : `${(c.demandPowerW/1000).toFixed(2)}kW`}</strong>
            </div>
            <div className="computed-row">
              <span>Corrente (I)</span>
              <strong>{c.currentA}A</strong>
            </div>
            <div className="computed-row">
              <span>Bitola Recomendada</span>
              <strong className={c.voltageDrop > 4 ? 'text-warn' : 'text-ok'}>{c.conductorLabel}</strong>
            </div>
            <div className="computed-row">
              <span>Queda de Tensão</span>
              <strong className={c.voltageDrop > 4 ? 'text-error' : c.voltageDrop > 3 ? 'text-warn' : 'text-ok'}>
                {c.voltageDrop}%
              </strong>
            </div>
            <div className="computed-row">
              <span>Disjuntor</span>
              <strong>{c.breakerA}A</strong>
            </div>
            {c.qdcSlotsNeeded > 0 && (
              <div className="computed-row">
                <span>Disjuntores no QDC</span>
                <strong>{c.qdcSlotsNeeded} ({c.qdcSlotsNeeded <= 12 ? 'QDC-12' : c.qdcSlotsNeeded <= 24 ? 'QDC-24' : 'QDC-36+'})</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="prop-group">
          <label className="prop-section-label">⚠️ Alertas Técnicos</label>
          {warnings.map((w, i) => (
            <div key={i} className="prop-warning">{w}</div>
          ))}
        </div>
      )}

      {/* Add child buttons */}
      {CHILD_TYPES[node.type] && (
        <div className="prop-group">
          <label className="prop-section-label">Adicionar Filho</label>
          <div className="prop-add-btns">
            {CHILD_TYPES[node.type]!.map(type => (
              <button
                key={type}
                className="prop-add-btn"
                onClick={() => onAddChild(node.id, type)}
              >
                {TYPE_ICONS[type]} {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
