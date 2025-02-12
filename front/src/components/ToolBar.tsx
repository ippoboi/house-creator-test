import { Tool } from "@/types";

type ToolBarProps = {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
};

const ToolBar = ({ currentTool, onToolChange }: ToolBarProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-50">
      <button
        className={`p-2 rounded ${
          currentTool === "rectangle" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
        onClick={() => onToolChange("rectangle")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </button>
      <button
        className={`p-2 rounded ${
          currentTool === "drag" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
        onClick={() => onToolChange("drag")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
          <path d="M8 8l4-4 4 4M8 16l4 4 4-4" />
          <path d="M16 8l4 4-4 4M8 8L4 12l4 4" />
        </svg>
      </button>
    </div>
  );
};

export default ToolBar;
