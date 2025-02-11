import Konva from "konva";
import { useState, useRef, useEffect } from "react";
import { Group, Rect, Text, Line, Transformer } from "react-konva";

type RectangleProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  points?: { x: number; y: number }[];
  onPositionChange?: (id: string, newX: number, newY: number) => void;
  onResize?: (id: string, newWidth: number, newHeight: number) => void;
  otherRooms?: Array<{ x: number; y: number; width: number; height: number }>;
};

const ColoredRect = (props: RectangleProps) => {
  const [color, setColor] = useState("green");
  const [position, setPosition] = useState({ x: props.x, y: props.y });
  const shapeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const SNAP_THRESHOLD = 10; // Distance in pixels for snapping

  useEffect(() => {
    if (shapeRef.current && transformerRef.current) {
      // Always attach transformer
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();

      // Configure transformer
      transformerRef.current.setAttrs({
        enabledAnchors: [
          "top-left",
          "top-center",
          "top-right",
          "middle-right",
          "middle-left",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ],
        rotateEnabled: false,
        borderStroke: "#0096FF",
        borderStrokeWidth: 2,
        anchorFill: "#fff",
        anchorStroke: "#0096FF",
        anchorStrokeWidth: 2,
        anchorSize: 8,
        keepRatio: false,
        // Custom cursors for different anchors
        anchorStyleHandler: (anchor) => {
          switch (anchor) {
            case "top-left":
            case "bottom-right":
              return { cursor: "nwse-resize" };
            case "top-right":
            case "bottom-left":
              return { cursor: "nesw-resize" };
            case "top-center":
            case "bottom-center":
              return { cursor: "ns-resize" };
            case "middle-left":
            case "middle-right":
              return { cursor: "ew-resize" };
            default:
              return { cursor: "pointer" };
          }
        },
      });
    }
  }, []);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    let newX = e.target.x();
    let newY = e.target.y();

    // Check for snapping with other rooms
    if (props.otherRooms) {
      props.otherRooms.forEach((room) => {
        // Snap horizontally
        if (Math.abs(newX - room.x) < SNAP_THRESHOLD) {
          newX = room.x; // Snap to left edge
        }
        if (
          Math.abs(newX + props.width - (room.x + room.width)) < SNAP_THRESHOLD
        ) {
          newX = room.x + room.width - props.width; // Snap to right edge
        }

        // Snap vertically
        if (Math.abs(newY - room.y) < SNAP_THRESHOLD) {
          newY = room.y; // Snap to top edge
        }
        if (
          Math.abs(newY + props.height - (room.y + room.height)) <
          SNAP_THRESHOLD
        ) {
          newY = room.y + room.height - props.height; // Snap to bottom edge
        }
      });
    }

    setPosition({ x: newX, y: newY });
    e.target.position({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    props.onPositionChange?.(props.name, position.x, position.y);
  };

  const handleTransform = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update width/height
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(50, node.width() * scaleX);
    const newHeight = Math.max(50, node.height() * scaleY);

    // Update the node size
    node.width(newWidth);
    node.height(newHeight);

    props.onResize?.(props.name, newWidth, newHeight);
  };

  const handleClick = () => {
    setColor(Konva.Util.getRandomColor());
  };

  if (props.points && props.points.length > 2) {
    // Render custom shape
    return (
      <Group
        draggable
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        x={position.x}
        y={position.y}
      >
        <Line
          points={props.points.flatMap((p) => [p.x, p.y])}
          closed={true}
          fill={color}
          stroke="#666"
          strokeWidth={2}
          onClick={handleClick}
        />
        <Text
          x={props.width / 2 - 50}
          y={props.height / 2}
          text={props.name}
          fontSize={16}
          fill="black"
          width={100}
          align="center"
        />
      </Group>
    );
  }

  // Render regular rectangle
  return (
    <Group>
      <Rect
        ref={shapeRef}
        x={position.x}
        y={position.y}
        width={props.width}
        height={props.height}
        fill={color}
        onClick={handleClick}
        onTap={handleClick}
        draggable
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        strokeWidth={2}
        stroke="#666"
      />
      <Text
        x={position.x}
        y={position.y + props.height / 2}
        text={props.name}
        fontSize={16}
        fill="black"
        width={props.width}
        align="center"
      />
      <Transformer ref={transformerRef} />
    </Group>
  );
};

export default ColoredRect;
