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
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  otherRooms?: Array<{ x: number; y: number; width: number; height: number }>;
  onClick?: (id: string) => void;
  isSelected?: boolean;
};

const ColoredRect = (props: RectangleProps) => {
  const [isSelected, setIsSelected] = useState(props.isSelected || false);
  const [editText, setEditText] = useState(props.name);
  const [isEditingText, setIsEditingText] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: props.width,
    height: props.height,
  });
  const shapeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const textRef = useRef<Konva.Text>(null);
  const SNAP_THRESHOLD = 10;

  // Update dimensions when props change
  useEffect(() => {
    setDimensions({ width: props.width, height: props.height });
  }, [props.width, props.height]);

  useEffect(() => {
    if (shapeRef.current && transformerRef.current) {
      if (isSelected) {
        // Attach transformer only when selected
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
          anchorStyleHandler: (anchor: string) => {
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
      } else {
        // Remove transformer when deselected
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  useEffect(() => {
    if (props.isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          props.onDelete?.(props.name);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [props.isSelected, props.name, props.onDelete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditingText) {
        if (isSelected && (e.key === "Delete" || e.key === "Backspace")) {
          props.onDelete?.(props.name);
        }
        return;
      }

      // Handle CMD/CTRL + A for text selection
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault(); // Prevent default select all behavior
        setEditText((prev) => {
          // Simulate text selection by adding special characters
          // These will be removed when editing is done
          return `§${prev}§`;
        });
        return;
      }

      if (e.key === "Enter") {
        setIsEditingText(false);
        // Remove selection markers before saving
        props.onRename?.(props.name, editText.replace(/§/g, ""));
      } else if (e.key === "Escape") {
        setIsEditingText(false);
        setEditText(props.name);
      } else if (e.key === "Backspace") {
        setEditText((prev) => {
          // If text is selected (has § markers), delete all selected text
          if (prev.startsWith("§") && prev.endsWith("§")) {
            return "";
          }
          return prev.slice(0, -1);
        });
      } else if (e.key.length === 1) {
        setEditText((prev) => {
          // If text is selected (has § markers), replace it with new character
          if (prev.startsWith("§") && prev.endsWith("§")) {
            return e.key;
          }
          return prev + e.key;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditingText,
    isSelected,
    props.name,
    props.onDelete,
    props.onRename,
    editText,
  ]);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    let newX = e.target.x();
    let newY = e.target.y();

    if (props.otherRooms) {
      props.otherRooms.forEach((room) => {
        if (Math.abs(newX - room.x) < SNAP_THRESHOLD) {
          newX = room.x;
        }
        if (
          Math.abs(newX + props.width - (room.x + room.width)) < SNAP_THRESHOLD
        ) {
          newX = room.x + room.width - props.width;
        }
        if (Math.abs(newY - room.y) < SNAP_THRESHOLD) {
          newY = room.y;
        }
        if (
          Math.abs(newY + props.height - (room.y + room.height)) <
          SNAP_THRESHOLD
        ) {
          newY = room.y + room.height - props.height;
        }
      });
    }

    e.target.position({ x: newX, y: newY });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    props.onPositionChange?.(props.name, e.target.x(), e.target.y());
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

    // Update the node size and local dimensions
    node.width(newWidth);
    node.height(newHeight);
    setDimensions({ width: newWidth, height: newHeight });

    props.onResize?.(props.name, newWidth, newHeight);
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent event from bubbling up
    props.onClick?.(props.name);
    setIsSelected(true);
  };

  const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only deselect if clicking the stage background
    if (e.target === e.target.getStage()) {
      setIsSelected(false);
    }
  };

  useEffect(() => {
    // Add stage click listener for deselection
    const stage = shapeRef.current?.getStage();
    if (stage) {
      stage.on("click", handleDeselect);
    }
    return () => {
      if (stage) {
        stage.off("click", handleDeselect);
      }
    };
  }, []);

  const handleTextClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent the click from bubbling to the rectangle
    setIsEditingText(true);
  };

  if (props.points && props.points.length > 2) {
    // Render custom shape
    return (
      <Group
        draggable
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        x={props.x}
        y={props.y}
        onClick={handleClick}
      >
        <Line
          points={props.points.flatMap((p) => [p.x, p.y])}
          closed={true}
          fill="#90caf9"
          stroke="#666"
          strokeWidth={2}
          onClick={handleClick}
        />
        <Text
          ref={textRef}
          x={props.width / 2 - 50}
          y={(props.height - 20) / 2}
          text={editText + (isEditingText ? "|" : "")}
          fontSize={16}
          fill="black"
          width={100}
          height={20}
          align="center"
          onClick={handleTextClick}
        />
      </Group>
    );
  }

  // Render regular rectangle
  return (
    <Group
      x={props.x}
      y={props.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <Rect
        ref={shapeRef}
        width={dimensions.width}
        height={dimensions.height}
        fill="#fff"
        onClick={handleClick}
        onTap={handleClick}
        onTransform={handleTransform}
        strokeWidth={2}
        stroke="#666"
      />
      {/* Preview rectangle while drawing */}
      {props.name === "Drawing..." && (
        <Rect
          x={props.x}
          y={props.y}
          width={dimensions.width}
          height={dimensions.height}
          stroke="#0096FF"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}
      <Text
        ref={textRef}
        x={dimensions.width / 2 - 50}
        y={(dimensions.height - 20) / 2}
        text={editText + (isEditingText ? "|" : "")}
        fontSize={16}
        fill="black"
        width={100}
        height={20}
        align="center"
        onClick={handleTextClick}
        onTap={handleTextClick}
      />
      {isSelected && <Transformer ref={transformerRef} />}
    </Group>
  );
};

export default ColoredRect;
