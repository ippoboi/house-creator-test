"use client";

import RoomForm from "@/components/RoomForm";
import RoomCanvas from "@/components/RoomCanvas";
import { useState, useCallback } from "react";

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

// Scale factor to convert meters to pixels
const SCALE_FACTOR = 50; // 1 meter = 50 pixels

let roomCounter = 0;
const generateRoomId = () => `room-${++roomCounter}`;

export default function Builder() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const handleRoomSubmit = useCallback(
    (roomData: {
      name: string;
      width: number;
      length: number;
      doorPositions: { x: number; y: number }[];
      windowPositions: { x: number; y: number }[];
    }) => {
      const newRoom: Room = {
        id: generateRoomId(),
        x: 50,
        y: 50,
        width: roomData.width * SCALE_FACTOR,
        height: roomData.length * SCALE_FACTOR,
        name: roomData.name,
        selected: false,
        doors: roomData.doorPositions,
        windows: roomData.windowPositions,
      };
      setRooms((prev) => [...prev, newRoom]);
    },
    []
  );

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-white dark:bg-gray-900 p-4 border-r dark:border-gray-800">
        <RoomForm onSubmit={handleRoomSubmit} />
      </div>
      <RoomCanvas rooms={rooms} onRoomUpdate={setRooms} />
    </div>
  );
}
