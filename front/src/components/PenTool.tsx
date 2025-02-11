import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useState } from "react";
import { Circle, Line } from "react-konva";

type Point = { x: number; y: number };

type PenToolProps = {
  isActive: boolean;
  onShapeComplete: (points: Point[]) => void;
};

const PenTool = ({ isActive, onShapeComplete }: PenToolProps) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastMidPoint, setLastMidPoint] = useState<Point | null>(null);

  const snapToOrtho = (start: Point, end: Point): Point => {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    if (dx > dy) {
      return { x: end.x, y: start.y };
    } else {
      return { x: start.x, y: end.y };
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!isActive) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    console.log("Mouse down at:", pos);

    if (!isDrawing) {
      setPoints([pos]);
      setIsDrawing(true);
      setLastMidPoint(pos);
    } else {
      setPoints((prev) => {
        const newPoints = [...prev, pos];
        if (prev.length > 2) {
          const startPoint = prev[0];
          const distance = Math.sqrt(
            Math.pow(pos.x - startPoint.x, 2) +
              Math.pow(pos.y - startPoint.y, 2)
          );
          if (distance < 20) {
            onShapeComplete(newPoints);
            setIsDrawing(false);
            setLastMidPoint(null);
            return [];
          }
        }
        return newPoints;
      });
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !isActive || !lastMidPoint) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    console.log("Mouse move at:", pos);
    const snappedPos = snapToOrtho(lastMidPoint, pos);
    setLastMidPoint(snappedPos);
  };

  useEffect(() => {
    if (!isActive) {
      setPoints([]);
      setIsDrawing(false);
      setLastMidPoint(null);
    }
  }, [isActive]);

  return (
    <>
      {points.length > 0 && (
        <Line
          points={points.flatMap((p) => [p.x, p.y])}
          stroke="#333"
          strokeWidth={2}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      )}
      {lastMidPoint && points.length > 0 && (
        <Line
          points={[
            points[points.length - 1].x,
            points[points.length - 1].y,
            lastMidPoint.x,
            lastMidPoint.y,
          ]}
          stroke="#999"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}
      {points.map((point, i) => (
        <Circle
          key={i}
          x={point.x}
          y={point.y}
          radius={4}
          fill={i === 0 ? "#f00" : "#333"}
        />
      ))}
    </>
  );
};

export default PenTool;
