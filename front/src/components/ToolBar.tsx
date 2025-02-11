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
          currentTool === "pen" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
        onClick={() => onToolChange("pen")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        </svg>
      </button>
      <button
        className={`p-2 rounded ${
          currentTool === "delete" ? "bg-red-100" : "hover:bg-gray-100"
        }`}
        onClick={() => onToolChange("delete")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
};

export default ToolBar;
