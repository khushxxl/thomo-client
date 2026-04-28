import { View } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

const Y_LABELS = ["£1.5k", "£1.0k", "£500", "£0"];
const CHART_LEFT = 44;
const CHART_RIGHT = 10;
const CHART_TOP = 10;
const CHART_BOTTOM = 20;

export function PredictionChart({
  width = 300,
  height = 160,
}: {
  width?: number;
  height?: number;
}) {
  const chartW = width - CHART_LEFT - CHART_RIGHT;
  const chartH = height - CHART_TOP - CHART_BOTTOM;

  const gridYs = [0, 1, 2, 3].map(
    (i) => CHART_TOP + (i / 3) * chartH,
  );

  const points = [
    { x: 0, y: 0.55 },
    { x: 0.12, y: 0.38 },
    { x: 0.24, y: 0.25 },
    { x: 0.4, y: 0.6 },
    { x: 0.55, y: 0.78 },
    { x: 0.7, y: 0.5 },
    { x: 0.82, y: 0.28 },
    { x: 0.95, y: 0.32 },
  ];

  const toSvg = (p: { x: number; y: number }) => ({
    cx: CHART_LEFT + p.x * chartW,
    cy: CHART_TOP + p.y * chartH,
  });

  const svgPoints = points.map(toSvg);

  // Build smooth cubic bezier path
  let pathD = `M${svgPoints[0].cx} ${svgPoints[0].cy}`;
  for (let i = 0; i < svgPoints.length - 1; i++) {
    const curr = svgPoints[i];
    const next = svgPoints[i + 1];
    const cpx = (curr.cx + next.cx) / 2;
    pathD += ` C${cpx} ${curr.cy}, ${cpx} ${next.cy}, ${next.cx} ${next.cy}`;
  }

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {/* Y axis labels + horizontal grid lines */}
      {gridYs.map((y, i) => (
        <SvgText
          key={`yl-${i}`}
          x={CHART_LEFT - 8}
          y={y + 4}
          textAnchor="end"
          fontSize={10}
          fontFamily="NeueMontreal-Regular"
          fill="#BBB"
        >
          {Y_LABELS[i]}
        </SvgText>
      ))}

      {gridYs.map((y, i) => (
        <Line
          key={`gl-${i}`}
          x1={CHART_LEFT}
          y1={y}
          x2={width - CHART_RIGHT}
          y2={y}
          stroke="#E8E8E8"
          strokeWidth={0.8}
          strokeDasharray="4 4"
        />
      ))}

      {/* Main curve */}
      <Path
        d={pathD}
        stroke="#1A1A1A"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Data points */}
      {svgPoints.map((p, i) => (
        <Circle
          key={`pt-${i}`}
          cx={p.cx}
          cy={p.cy}
          r={4}
          fill="#fff"
          stroke="#1A1A1A"
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}
