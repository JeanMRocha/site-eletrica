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
    <aside className="designer-tools-modern glass-panel">
      <header className="toolbar-header">
        <p className="eyebrow">Etapa Atual</p>
        <strong>{stage}</strong>
      </header>
      
      <div className="tool-groups-container scroll-thin">
        {groupTools(tools).map((group) => (
          <div className="tool-group-modern" key={group.name}>
            <span className="group-label">{group.name}</span>
            <div className="tool-grid-modern">
              {group.items.map((tool) => (
                <button 
                  key={tool.key} 
                  className={`tool-button ${selectedTool === tool.key ? 'active' : ''}`} 
                  type="button" 
                  onClick={() => onChooseTool(tool.key)}
                  title={tool.label}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-label-text">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
