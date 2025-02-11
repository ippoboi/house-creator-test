"use client";

import { KonvaEventObject } from "konva/lib/Node";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Stage = dynamic(() => import("react-konva").then((mod) => mod.Stage), {
  ssr: false,
});
const Layer = dynamic(() => import("react-konva").then((mod) => mod.Layer), {
  ssr: false,
});
const Rect = dynamic(() => import("react-konva").then((mod) => mod.Rect), {
  ssr: false,
});
const Transformer = dynamic(
  () => import("react-konva").then((mod) => mod.Transformer),
  { ssr: false }
);

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  selected: boolean;
  doors: { x: number; y: number }[];
  windows: { x: number; y: number }[];
}

interface RoomCanvasProps {
  rooms: Room[];
  onRoomUpdate: (rooms: Room[]) => void;
}

export default function RoomCanvas({ rooms, onRoomUpdate }: RoomCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.75,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const newRooms = rooms.map((room) => {
      if (room.id === id) {
        return {
          ...room,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return room;
    });
    onRoomUpdate(newRooms);
  };

  return (
    <div className="flex-1 p-4">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <Layer>
          {rooms.map((room) => (
            <Rect
              key={room.id}
              id={room.id}
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.selected ? "#9EC2E6" : "#ddd"}
              stroke="#666"
              strokeWidth={1}
              draggable
              onClick={() => setSelectedId(room.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
          {selectedId && <Transformer />}
        </Layer>
      </Stage>
    </div>
  );
}
