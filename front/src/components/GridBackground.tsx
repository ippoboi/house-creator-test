import { Circle } from "react-konva";

type GridBackgroundProps = {
  spacing: number;
  dotSize: number;
  stageScale: number;
  stagePosition: { x: number; y: number };
  stageSize: { width: number; height: number };
};

const GridBackground = ({
  spacing = 50,
  dotSize = 1,
  stageScale,
  stagePosition,
  stageSize,
}: GridBackgroundProps) => {
  // Calculate the range of dots to render based on stage position and scale
  const startX = Math.floor(-stagePosition.x / (spacing * stageScale)) - 1;
  const endX =
    Math.ceil((stageSize.width - stagePosition.x) / (spacing * stageScale)) + 1;
  const startY = Math.floor(-stagePosition.y / (spacing * stageScale)) - 1;
  const endY =
    Math.ceil((stageSize.height - stagePosition.y) / (spacing * stageScale)) +
    1;

  const dots = [];

  // Generate dots within the visible area
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      dots.push(
        <Circle
          key={`${x}-${y}`}
          x={x * spacing}
          y={y * spacing}
          radius={dotSize / stageScale}
          fill="#E0e0e0"
          perfectDrawEnabled={false}
        />
      );
    }
  }

  return <>{dots}</>;
};

export default GridBackground;
