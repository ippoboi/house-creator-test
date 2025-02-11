import { Layer, Stage } from "react-konva";
import { useEffect, useState } from "react";

type CanvasProps = {
  children: React.ReactNode;
  onMouseDown?: (e: any) => void;
  onMouseMove?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onTouchStart?: (e: any) => void;
  onTouchMove?: (e: any) => void;
  onTouchEnd?: (e: any) => void;
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
};

function Canvas(props: CanvasProps) {
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lastDist, setLastDist] = useState<number | null>(null);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale({ x: newScale, y: newScale });
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
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

  const handleTouchStart = (e: any) => {
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

  const handleTouchMove = (e: any) => {
    const touches = e.evt.touches;
    if (touches.length === 2 && lastCenter && lastDist !== null) {
      e.evt.preventDefault();

      const center = getCenter(touches[0], touches[1]);
      const dist = getDistance(touches[0], touches[1]);

      // Handle pinch zoom
      const stage = e.target.getStage();
      const oldScale = stageScale.x;
      const newScale = oldScale * (dist / lastDist);

      const mousePointTo = {
        x: (lastCenter.x - stagePosition.x) / oldScale,
        y: (lastCenter.y - stagePosition.y) / oldScale,
      };

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

  const handleTouchEnd = (e: any) => {
    const touches = e.evt.touches;
    if (touches.length < 2) {
      setLastCenter(null);
      setLastDist(null);
      props.setIsPanning(false);
    }
    props.onTouchEnd?.(e);
  };

  return (
    <Stage
      width={window.innerWidth - 200}
      height={window.innerHeight - 200}
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      scaleX={stageScale.x}
      scaleY={stageScale.y}
      x={stagePosition.x}
      y={stagePosition.y}
    >
      <Layer>{props.children}</Layer>
    </Stage>
  );
}

export default Canvas;
