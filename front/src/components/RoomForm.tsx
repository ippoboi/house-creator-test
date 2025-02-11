"use client";

import { useState } from "react";

interface RoomFormProps {
  onSubmit: (roomData: {
    name: string;
    width: number;
    length: number;
    doorPositions: { x: number; y: number }[];
    windowPositions: { x: number; y: number }[];
  }) => void;
}

export default function RoomForm({ onSubmit }: RoomFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    width: 0,
    length: 0,
    doorCount: 0,
    windowCount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate mock positions for doors and windows
    // In a real app, you'd want to let users specify these positions
    const doorPositions = Array(formData.doorCount)
      .fill(null)
      .map(() => ({
        x: Math.random() * formData.width,
        y: Math.random() * formData.length,
      }));

    const windowPositions = Array(formData.windowCount)
      .fill(null)
      .map(() => ({
        x: Math.random() * formData.width,
        y: Math.random() * formData.length,
      }));

    onSubmit({
      name: formData.name,
      width: formData.width,
      length: formData.length,
      doorPositions,
      windowPositions,
    });

    // Reset form
    setFormData({
      name: "",
      width: 0,
      length: 0,
      doorCount: 0,
      windowCount: 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Room Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="width"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Width (meters)
          </label>
          <input
            type="number"
            id="width"
            value={formData.width || ""}
            onChange={(e) =>
              setFormData({ ...formData, width: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="1"
            step="0.1"
            required
          />
        </div>

        <div>
          <label
            htmlFor="length"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Length (meters)
          </label>
          <input
            type="number"
            id="length"
            value={formData.length || ""}
            onChange={(e) =>
              setFormData({ ...formData, length: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="1"
            step="0.1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="doors"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Number of Doors
          </label>
          <input
            type="number"
            id="doors"
            value={formData.doorCount || ""}
            onChange={(e) =>
              setFormData({ ...formData, doorCount: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            required
          />
        </div>

        <div>
          <label
            htmlFor="windows"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Number of Windows
          </label>
          <input
            type="number"
            id="windows"
            value={formData.windowCount || ""}
            onChange={(e) =>
              setFormData({ ...formData, windowCount: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Room
      </button>
    </form>
  );
}
