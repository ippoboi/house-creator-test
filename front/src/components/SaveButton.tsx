import React from "react";

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SaveButton({ onClick, disabled }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute z-50 top-4 right-4 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
    >
      Save Room
    </button>
  );
}
