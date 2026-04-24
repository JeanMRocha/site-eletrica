import type { CanvasTool } from '../../domain/residential-projects';
import { groupTools, type ToolDefinition } from './canvasModel';

type Props = {
  stage: string;
  tools: ToolDefinition[];
  selectedTool: CanvasTool;
  onChooseTool: (tool: CanvasTool) => void;
};

export function DesignerToolbar({ stage, tools, selectedTool, onChooseTool }: Props) {
  return (
    <aside className="designer-tools">
      <div className="tool-stage">
        <span>Etapa</span>
        <strong>{stage}</strong>
      </div>
      {groupTools(tools).map((group) => (
        <div className="tool-group" key={group.name}>
          <span>{group.name}</span>
          <div className="tool-grid">
            {group.items.map((tool) => (
              <button key={tool.key} className={`tool-chip ${selectedTool === tool.key ? 'active' : ''}`} type="button" onClick={() => onChooseTool(tool.key)} title={tool.label}>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
