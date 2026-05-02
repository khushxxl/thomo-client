import { View } from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { TextWrapper } from "./text-wrapper";

export function CalendarIcon({ size = 18, color = "#000000" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x={2.5}
        y={4}
        width={15}
        height={13}
        rx={2}
        stroke={color}
        strokeWidth={1.25}
      />
      <Line x1={2.5} y1={8} x2={17.5} y2={8} stroke={color} strokeWidth={1.25} />
      <Line
        x1={6.5}
        y1={2.5}
        x2={6.5}
        y2={5.5}
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Line
        x1={13.5}
        y1={2.5}
        x2={13.5}
        y2={5.5}
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 4V16M4 10H16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DocIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={2}
        width={16}
        height={20}
        rx={2}
        stroke="#999"
        strokeWidth={1.5}
      />
      <Path
        d="M8 7H16M8 11H16M8 15H12"
        stroke="#999"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ThomoSmallIcon({ size = 28 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 11, color: "#fff" }}>
        th.
      </TextWrapper>
    </View>
  );
}
export function EyeIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
