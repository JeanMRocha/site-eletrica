import type { CanvasTool, DesignerStage } from './canvasModel';
import { getAvailableToolsForStage } from './canvasModel';

type Props = {
  activeStage: DesignerStage;
  selectedTool: CanvasTool;
  onChooseTool: (tool: CanvasTool) => void;
  isReady?: boolean;
  readinessMessage?: string;
};

export function DesignerToolbar({ activeStage, selectedTool, onChooseTool, isReady = true, readinessMessage }: Props) {
  const tools = getAvailableToolsForStage(activeStage);
  
  return (
    <aside className="designer-tools-modern-container">
      <div className={`designer-tools-modern ${!isReady ? 'locked' : ''}`}>
        {tools.map((tool) => (
          <button
            key={tool.key}
            type="button"
            className={`tool-strip-button ${selectedTool === tool.key ? 'active' : ''}`}
            onClick={() => isReady && onChooseTool(tool.key)}
            title={!isReady ? readinessMessage : `${tool.label} (${tool.group})`}
            disabled={!isReady}
          >
            <span className="icon">{tool.icon}</span>
          </button>
        ))}
      </div>

      {!isReady && (
        <div className="toolbar-lock-message">
           <span className="icon">⚠️</span>
           {readinessMessage}
        </div>
      )}
    </aside>
  );
}
