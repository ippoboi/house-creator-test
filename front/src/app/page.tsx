"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import ToolBar from "@/components/ToolBar";
import { Tool } from "@/types";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import Link from "next/link";

const Canvas = dynamic(() => import("@/components/Canvas"), {
  ssr: false,
});

const ColoredRect = dynamic(() => import("@/components/ColoredRectangle"), {
  ssr: false,
});

type RoomData = {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export default function Home() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const roomCountRef = useRef(0);
  const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
  const [isPanning, setIsPanning] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (currentTool === "drag") {
      setIsPanning(true);
      return;
    }

    // Don't create new room if clicking on an existing one
    if (e.target !== e.target.getStage()) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    const relativePos = {
      x: (point.x - stagePos.x) / stageScale,
      y: (point.y - stagePos.y) / stageScale,
    };

    setIsDrawing(true);
    setDrawStart(relativePos);

    const newRoom: RoomData = {
      name: `Room ${roomCountRef.current + 1}`,
      width: 0,
      height: 0,
      x: relativePos.x,
      y: relativePos.y,
    };
    setCurrentRoom(newRoom);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (currentTool === "drag") {
      return; // The Canvas component will handle dragging
    }

    if (!isDrawing || !currentRoom) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // Convert point to relative coordinates
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    const relativePos = {
      x: (point.x - stagePos.x) / stageScale,
      y: (point.y - stagePos.y) / stageScale,
    };

    const width = Math.abs(relativePos.x - drawStart.x);
    const height = Math.abs(relativePos.y - drawStart.y);
    const x = Math.min(relativePos.x, drawStart.x);
    const y = Math.min(relativePos.y, drawStart.y);

    setCurrentRoom({
      ...currentRoom,
      width,
      height,
      x,
      y,
    });
  };

  const handleMouseUp = () => {
    if (currentTool === "drag") {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !currentRoom) return;

    setRooms((prev) => [...prev, currentRoom]);
    setIsDrawing(false);
    setCurrentRoom(null);
    roomCountRef.current += 1;
  };

  const handleRoomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const roomData: RoomData = {
      name: formData.get("name") as string,
      width: Number(formData.get("width")),
      height: Number(formData.get("height")),
      x: 50,
      y: 50,
    };

    try {
      const response = await fetch("http://localhost:8000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: {
            id: roomData.name,
            type: "rectangle",
            position: { x: roomData.x, y: roomData.y },
            dimensions: { width: roomData.width, height: roomData.height },
            walls: {
              north: { height: 50, style: "solid" },
              east: { height: 50, style: "solid" },
              south: { height: 50, style: "solid" },
              west: { height: 50, style: "solid" },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save room");
      }

      setRooms((prev) => [...prev, roomData]);
      (e.target as HTMLFormElement).reset();

      toast.success("Room added successfully", {
        description: `Room "${roomData.name}" has been created with walls and branding.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to add room", {
        description: "There was an error creating the room.",
        duration: 4000,
      });
    }
  };

  const handlePositionChange = (id: string, newX: number, newY: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.name === id ? { ...room, x: newX, y: newY } : room
      )
    );
  };

  const handleRoomResize = (
    id: string,
    newWidth: number,
    newHeight: number
  ) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.name === id
          ? { ...room, width: newWidth, height: newHeight }
          : room
      )
    );
  };

  const handleSaveRoom = async (selectedRoomId: string | null) => {
    if (!selectedRoomId) return;

    const roomToSave = rooms.find((room) => room.name === selectedRoomId);
    if (!roomToSave) return;

    try {
      const response = await fetch("http://localhost:8000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: {
            id: roomToSave.name,
            type: "rectangle",
            position: { x: roomToSave.x, y: roomToSave.y },
            dimensions: { width: roomToSave.width, height: roomToSave.height },
            walls: {
              north: { height: 25, style: "primary" },
              east: { height: 25, style: "secondary" },
              south: { height: 25, style: "primary" },
              west: { height: 25, style: "secondary" },
            },
          },
          branding: {
            colors: {
              primary: "#E0E0E0",
              secondary: "#fff",
              background: "#D0D0D0",
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save room");
      }

      toast.success("Room saved successfully", {
        description: `Room "${roomToSave.name}" has been saved with walls and branding.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room", {
        description: "There was an error saving the room to the database.",
        duration: 4000,
      });
    }
  };

  const handleRoomDelete = (roomId: string) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.name !== roomId));
    setSelectedRoom(null);
    toast.success("Room deleted", {
      description: `Room "${roomId}" has been deleted.`,
      duration: 3000,
    });
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleRoomRename = (id: string, newName: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.name === id ? { ...room, name: newName } : room
      )
    );
  };

  return (
    <div className="p-20 flex flex-col h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between mb-4">
        <div className="max-w-64 space-y-2">
          <h1 className="text-2xl font-bold">Room Designer</h1>
          <p className="text-sm text-gray-600">Use the form to add rooms</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/visualization"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            View 3D
          </Link>
          <form onSubmit={handleRoomSubmit} className="space-x-2">
            <input
              type="text"
              name="name"
              placeholder="Room name"
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="width"
              placeholder="Width"
              className="border p-2 rounded w-20"
              required
            />
            <input
              type="number"
              name="height"
              placeholder="Height"
              className="border p-2 rounded w-20"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Room
            </button>
          </form>
        </div>
      </div>
      <div className="flex-1 border border-gray-200 rounded-lg">
        <ToolBar currentTool={currentTool} onToolChange={setCurrentTool} />
        <Canvas
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          isPanning={isPanning}
          setIsPanning={setIsPanning}
          currentTool={currentTool}
          onSaveRoom={handleSaveRoom}
        >
          {rooms.map((room) => {
            const otherRooms = rooms.filter((r) => r.name !== room.name);
            return (
              <ColoredRect
                key={room.name}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                name={room.name}
                onPositionChange={handlePositionChange}
                onResize={handleRoomResize}
                onDelete={handleRoomDelete}
                onClick={handleRoomSelect}
                onRename={handleRoomRename}
                isSelected={selectedRoom === room.name}
                otherRooms={otherRooms}
              />
            );
          })}
          {currentRoom && (
            <ColoredRect
              key="drawing"
              {...currentRoom}
              name="Drawing..."
              otherRooms={rooms}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
}
