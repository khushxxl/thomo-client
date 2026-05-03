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


export function CategoryIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M13.963 1.667H6.038c-.966 0-1.449 0-1.839.136a2.542 2.542 0 00-1.567 1.613c-.132.402-.132.898-.132 1.892v11.67c0 .715.82 1.095 1.34.62a.788.788 0 011.07 0l.402.369a1.38 1.38 0 001.875 0 1.381 1.381 0 011.875 0 1.38 1.38 0 001.876 0 1.381 1.381 0 011.874 0 1.38 1.38 0 001.876 0l.402-.369a.788.788 0 011.07 0c.52.475 1.34.095 1.34-.62V5.308c0-.994 0-1.491-.132-1.891a2.54 2.54 0 00-1.567-1.614c-.39-.136-.873-.136-1.838-.136z"
        stroke={color}
        strokeWidth={1.25}
      />
      <Path
        d="M8.749 9.167h5.416m-8.333 0h.417M5.832 6.25h.417m-.417 5.834h.417m2.5-5.834h5.416M8.75 12.084h5.416"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GraphIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M2.5 12.917l3.214-2.678c1.362-1.135 2.257-1.018 3.433.158l.005.005c1.281 1.281 2.2 1.228 3.476.11L17.5 6.25"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 17.5H7.833c-1.866 0-2.8 0-3.513-.363a3.333 3.333 0 01-1.457-1.457c-.363-.713-.363-1.647-.363-3.513V2.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatTriangleIcon({ size = 10, color = "#171717" }: { size?: number; color?: string }) {
  return (
     <Svg
      width={size}
      height={size}
      viewBox="0 0 12 13"
      fill="none"
    >
      <Path
        d="M8.776 7.166c1.695-1.895 2.718-6.75 2.718-6.75H1.969s.829 1.2.829 5.25c0 2.429-2.104 6.75-2.104 6.75s3.656-.3 8.082-5.25z"
        fill="#1F1F1F"
        stroke="#1F1F1F"
        strokeWidth={0.832174}
      />
    </Svg>
  );
}