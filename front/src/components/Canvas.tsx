import { Layer, Stage } from "react-konva";
import { useState, useEffect } from "react";
import Konva from "konva";
import GridBackground from "./GridBackground";
import SaveButton from "./SaveButton";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";

type CanvasProps = {
  children: React.ReactNode;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTouchStart?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  onTouchMove?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  onTouchEnd?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
  onSaveRoom?: (selectedRoom: string | null) => void;
  onCanvasClick?: () => void;
  currentTool: string;
};

function Canvas(props: CanvasProps) {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 1000, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth - 160,
        height: window.innerHeight - 200,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (props.currentTool === "drag") {
      setIsDragging(true);
      const stage = e.target.getStage();
      const pointerPos = stage?.getPointerPosition();
      if (pointerPos) {
        setLastPointerPosition(pointerPos);
      }
      return;
    }
    props.onMouseDown?.(e);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isDragging && props.currentTool === "drag" && lastPointerPosition) {
      const stage = e.target.getStage();
      const pointerPos = stage?.getPointerPosition();
      if (!pointerPos) return;

      // Calculate how far the mouse has moved
      const dx = pointerPos.x - lastPointerPosition.x;
      const dy = pointerPos.y - lastPointerPosition.y;

      // Update the stage position based on the mouse movement
      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy,
      });

      // Update the last pointer position
      setLastPointerPosition(pointerPos);
      return;
    }
    props.onMouseMove?.(e);
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (isDragging) {
      setIsDragging(false);
      setLastPointerPosition(null);
      return;
    }
    props.onMouseUp?.(e);
  };

  const handleMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    props.onMouseUp?.(e);
  };

  const getDistance = (p1: Touch, p2: Touch) => {
    return Math.sqrt(
      Math.pow(p2.clientX - p1.clientX, 2) +
        Math.pow(p2.clientY - p1.clientY, 2)
    );
  };

  const getCenter = (p1: Touch, p2: Touch) => {
    return {
      x: (p1.clientX + p2.clientX) / 2,
      y: (p1.clientY + p2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      e.evt.preventDefault();
      const center = getCenter(touches[0], touches[1]);
      const dist = getDistance(touches[0], touches[1]);

      props.setIsPanning(true);
      return;
    }

    if (!props.isPanning) {
      props.onTouchStart?.(e);
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      e.evt.preventDefault();

      const center = getCenter(touches[0], touches[1]);
      const dist = getDistance(touches[0], touches[1]);

      // Handle pinch zoom
      const stage = e.target.getStage();
      if (!stage) return;

      const oldScale = stageScale;
      const newScale = oldScale * (dist / dist);

      // Handle pan
      const dx = center.x - stagePosition.x;
      const dy = center.y - stagePosition.y;

      setStageScale(newScale);
      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy,
      });

      return;
    }

    props.onTouchMove?.(e);
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length < 2) {
      props.setIsPanning(false);
    }
    props.onTouchEnd?.(e);
  };

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedRoom(null);
      props.onCanvasClick?.();
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  // Clone children and add selection handler
  const childrenWithProps = React.Children.map(props.children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (id: string) => {
          handleRoomSelect(id);
          child.props.onClick?.(id);
        },
        isSelected: child.props.name === selectedRoom,
      });
    }
    return child;
  });

  return (
    <div className="relative rounded-md w-full h-full overflow-hidden">
      <SaveButton
        onClick={() => props.onSaveRoom?.(selectedRoom)}
        disabled={!selectedRoom || !props.onSaveRoom}
      />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={props.currentTool === "drag" && isDragging}
        onDragEnd={(e) => {
          setStagePosition(e.target.position());
        }}
        onClick={handleCanvasClick}
      >
        <Layer>
          <GridBackground
            spacing={50}
            stageScale={stageScale}
            stagePosition={stagePosition}
            stageSize={stageSize}
          />
        </Layer>
        <Layer>{childrenWithProps}</Layer>
      </Stage>
    </div>
  );
}

export default Canvas;
