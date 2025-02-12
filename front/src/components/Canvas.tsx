import { Layer, Stage } from "react-konva";
import { useState, useEffect } from "react";
import Konva from "konva";
import GridBackground from "./GridBackground";

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
};

function Canvas(props: CanvasProps) {
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lastDist, setLastDist] = useState<number | null>(null);
  const [lastMousePosition, setLastMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector(".konvajs-content");
      if (container) {
        setStageSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale({ x: newScale, y: newScale });
    setStagePosition({
      x: -(mousePointTo.x - pointer.x / newScale) * newScale,
      y: -(mousePointTo.y - pointer.y / newScale) * newScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (props.isPanning) {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setLastMousePosition(pointer);
      return;
    }
    props.onMouseDown?.(e);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (props.isPanning && lastMousePosition) {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const dx = pointer.x - lastMousePosition.x;
      const dy = pointer.y - lastMousePosition.y;

      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy,
      });

      setLastMousePosition(pointer);
      return;
    }
    props.onMouseMove?.(e);
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (props.isPanning) {
      setLastMousePosition(null);
      return;
    }
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

      setLastCenter(center);
      setLastDist(dist);
      props.setIsPanning(true);
      return;
    }

    if (!props.isPanning) {
      props.onTouchStart?.(e);
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2 && lastCenter && lastDist !== null) {
      e.evt.preventDefault();

      const center = getCenter(touches[0], touches[1]);
      const dist = getDistance(touches[0], touches[1]);

      // Handle pinch zoom
      const stage = e.target.getStage();
      if (!stage) return;

      const oldScale = stageScale.x;
      const newScale = oldScale * (dist / lastDist);

      // Handle pan
      const dx = center.x - lastCenter.x;
      const dy = center.y - lastCenter.y;

      setStageScale({ x: newScale, y: newScale });
      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy,
      });

      setLastCenter(center);
      setLastDist(dist);
      return;
    }

    props.onTouchMove?.(e);
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length < 2) {
      setLastCenter(null);
      setLastDist(null);
      props.setIsPanning(false);
    }
    props.onTouchEnd?.(e);
  };

  return (
    <div className="relative rounded-md w-full h-full overflow-hidden">
      <Stage
        width={stageSize.width || window.innerWidth - 40}
        height={stageSize.height || window.innerHeight - 200}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        scaleX={stageScale.x}
        scaleY={stageScale.y}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={false}
      >
        <Layer>
          <GridBackground
            spacing={50}
            dotSize={1.5}
            stageScale={stageScale.x}
            stagePosition={stagePosition}
            stageSize={stageSize}
          />
          {props.children}
        </Layer>
      </Stage>
    </div>
  );
}

export default Canvas;
