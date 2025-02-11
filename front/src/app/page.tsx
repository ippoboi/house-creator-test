"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import ToolBar from "@/components/ToolBar";
import { Tool } from "@/types";

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

  const handleMouseDown = (e: any) => {
    if (isPanning) return;

    if (currentTool === "delete") {
      const clickedShape = e.target;
      if (clickedShape && clickedShape !== e.target.getStage()) {
        const roomName =
          clickedShape.parent?.attrs?.name || clickedShape.attrs?.name;
        if (roomName) {
          setRooms((prev) => prev.filter((room) => room.name !== roomName));
        }
      }
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

  const handleMouseMove = (e: any) => {
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
    if (!isDrawing || !currentRoom) return;

    setRooms((prev) => [...prev, currentRoom]);
    setIsDrawing(false);
    setCurrentRoom(null);
    roomCountRef.current += 1;
  };

  const handleRoomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const roomData: RoomData = {
      name: formData.get("name") as string,
      width: Number(formData.get("width")),
      height: Number(formData.get("height")),
      x: 50,
      y: 50,
    };
    setRooms((prev) => [...prev, roomData]);
    (e.target as HTMLFormElement).reset();
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

  return (
    <div className="p-20 flex flex-col h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between mb-4">
        <div className="max-w-64 space-y-2">
          <h1 className="text-2xl font-bold">Room Designer</h1>
          <p className="text-sm text-gray-600">
            Click and drag on the canvas to draw rooms or use the form
          </p>
        </div>
        <form onSubmit={handleRoomSubmit} className="space-x-2">
          <input
            type="text"
            name="name"
            placeholder="Room name"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="width"
            placeholder="Width"
            className="border p-2 rounded w-20"
          />
          <input
            type="number"
            name="height"
            placeholder="Height"
            className="border p-2 rounded w-20"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Room
          </button>
        </form>
      </div>
      <div className="flex-1 border border-gray-200 rounded-lg">
        <ToolBar currentTool={currentTool} onToolChange={setCurrentTool} />
        <Canvas
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          isPanning={isPanning}
          setIsPanning={setIsPanning}
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
