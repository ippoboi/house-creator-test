"use client";

import Link from "next/link";
import React, { useState } from "react";

// Types for our room data
interface RoomData {
  room: {
    id: string;
    type: string;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    walls: {
      north: { height: number; style: string };
      east: { height: number; style: string };
      south: { height: number; style: string };
      west: { height: number; style: string };
    };
  };
  branding: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
    shadows: boolean;
  };
}

const RoomVisualization = ({ roomData }: { roomData: RoomData }) => {
  const { room } = roomData;
  const wallHeight = 50;

  const colors = {
    walls: "#F0F0F0",
    ceiling: "#FFFFFF",
    edges: "#E0E0E0",
  };

  const [isRoomSelected, setIsRoomSelected] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Calculate corner points with isometric projection (30° angle)
  const generateCornerPoints = () => {
    const halfWidth = room.dimensions.width / 2;
    const halfHeight = room.dimensions.height / 2;
    const centerX = room.position.x;
    const centerY = room.position.y;

    // Isometric projection matrix
    const isoAngle = Math.PI / 6; // 30 degrees
    const isoMatrix = {
      x: Math.cos(isoAngle),
      y: Math.sin(isoAngle),
    };

    return {
      topLeft: {
        x: (centerX - halfWidth - (centerY - halfHeight)) * isoMatrix.x,
        y: ((centerX - halfWidth + (centerY - halfHeight)) * isoMatrix.y) / 2,
      },
      topRight: {
        x: (centerX + halfWidth - (centerY - halfHeight)) * isoMatrix.x,
        y: ((centerX + halfWidth + (centerY - halfHeight)) * isoMatrix.y) / 2,
      },
      bottomLeft: {
        x: (centerX - halfWidth - (centerY + halfHeight)) * isoMatrix.x,
        y: ((centerX - halfWidth + (centerY + halfHeight)) * isoMatrix.y) / 2,
      },
      bottomRight: {
        x: (centerX + halfWidth - (centerY + halfHeight)) * isoMatrix.x,
        y: ((centerX + halfWidth + (centerY + halfHeight)) * isoMatrix.y) / 2,
      },
    };
  };

  const corners = generateCornerPoints();

  // Add ceiling points (shifted up by wallHeight)
  const ceilingCorners = {
    topLeft: { x: corners.topLeft.x, y: corners.topLeft.y - wallHeight },
    topRight: { x: corners.topRight.x, y: corners.topRight.y - wallHeight },
    bottomLeft: {
      x: corners.bottomLeft.x,
      y: corners.bottomLeft.y - wallHeight,
    },
    bottomRight: {
      x: corners.bottomRight.x,
      y: corners.bottomRight.y - wallHeight,
    },
  };

  // Ceiling path (top face)
  const ceilingPath = `
    M ${ceilingCorners.topLeft.x},${ceilingCorners.topLeft.y}
    L ${ceilingCorners.topRight.x},${ceilingCorners.topRight.y}
    L ${ceilingCorners.bottomRight.x},${ceilingCorners.bottomRight.y}
    L ${ceilingCorners.bottomLeft.x},${ceilingCorners.bottomLeft.y}
    Z
  `;

  // Back wall (North)
  const backWallPath = `
    M ${corners.topLeft.x},${corners.topLeft.y}
    L ${corners.topRight.x},${corners.topRight.y}
    L ${corners.topRight.x},${corners.topRight.y - wallHeight}
    L ${corners.topLeft.x},${corners.topLeft.y - wallHeight}
    Z
  `;

  // Front wall (South)
  const frontWallPath = `
    M ${corners.bottomLeft.x},${corners.bottomLeft.y}
    L ${corners.bottomRight.x},${corners.bottomRight.y}
    L ${corners.bottomRight.x},${corners.bottomRight.y - wallHeight}
    L ${corners.bottomLeft.x},${corners.bottomLeft.y - wallHeight}
    Z
  `;

  // Left wall (West)
  const leftWallPath = `
    M ${corners.bottomLeft.x},${corners.bottomLeft.y}
    L ${corners.topLeft.x},${corners.topLeft.y}
    L ${corners.topLeft.x},${corners.topLeft.y - wallHeight}
    L ${corners.bottomLeft.x},${corners.bottomLeft.y - wallHeight}
    Z
  `;

  // Right wall (East)
  const rightWallPath = `
    M ${corners.bottomRight.x},${corners.bottomRight.y}
    L ${corners.topRight.x},${corners.topRight.y}
    L ${corners.topRight.x},${corners.topRight.y - wallHeight}
    L ${corners.bottomRight.x},${corners.bottomRight.y - wallHeight}
    Z
  `;

  const handleRoomClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsRoomSelected(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleBackgroundClick = () => {
    setIsRoomSelected(false);
    setMenuPosition(null);
  };

  return (
    <div onClick={handleBackgroundClick}>
      <svg
        viewBox="-200 -200 1000 800"
        style={{ width: "100%", height: "100%" }}
      >
        <g
          className="room-group"
          onClick={handleRoomClick}
          style={{ cursor: "pointer" }}
        >
          {/* Walls */}
          <path
            className="back-wall"
            d={backWallPath}
            fill={colors.walls}
            stroke={isRoomSelected ? "#3B82F6" : colors.edges}
            strokeWidth={isRoomSelected ? "2" : "1"}
            opacity={isRoomSelected ? 1 : 0.9}
          />
          <path
            className="left-wall"
            d={leftWallPath}
            fill={colors.walls}
            stroke={isRoomSelected ? "#3B82F6" : colors.edges}
            strokeWidth={isRoomSelected ? "2" : "1"}
            opacity={isRoomSelected ? 1 : 0.9}
          />
          <path
            className="right-wall"
            d={rightWallPath}
            fill={colors.walls}
            stroke={isRoomSelected ? "#3B82F6" : colors.edges}
            strokeWidth={isRoomSelected ? "2" : "1"}
            opacity={isRoomSelected ? 1 : 0.9}
          />
          <path
            className="front-wall"
            d={frontWallPath}
            fill={colors.walls}
            stroke={isRoomSelected ? "#3B82F6" : colors.edges}
            strokeWidth={isRoomSelected ? "2" : "1"}
            opacity={isRoomSelected ? 1 : 0.9}
          />

          {/* Ceiling */}
          <path
            className="ceiling"
            d={ceilingPath}
            fill={colors.ceiling}
            stroke={isRoomSelected ? "#3B82F6" : colors.edges}
            strokeWidth={isRoomSelected ? "2" : "1"}
          />
        </g>
      </svg>

      {/* Quick Action Menu */}
      {isRoomSelected && menuPosition && (
        <div
          className="absolute bg-white shadow-lg rounded-lg p-2 z-10"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-sm font-medium mb-2">Room Actions</div>
          <div className="flex flex-col gap-1">
            <button
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => console.log("Edit room dimensions")}
            >
              Edit Dimensions
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => console.log("Change room style")}
            >
              Change Style
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => console.log("Add furniture")}
            >
              Add Furniture
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/rooms/${roomName}`
      );
      if (!response.ok) {
        throw new Error(`Room "${roomName}" not found`);
      }
      const data = await response.json();
      setRoomData(data);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError(
        error instanceof Error ? error.message : "Error fetching room data"
      );
      setRoomData(null);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ← Back to Designer
        </Link>
        <h1 className="text-2xl font-bold">3D Room Visualization</h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="roomName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room Name
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room name"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Display Room
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {roomData ? (
        <div style={{ width: "800px", height: "600px" }}>
          <RoomVisualization roomData={roomData} />
        </div>
      ) : !error ? (
        <div className="text-gray-500 text-center">
          Enter a room name and click &quot;Display Room&quot; to view the
          visualization
        </div>
      ) : null}
    </div>
  );
}
