import Svg, { Path } from "react-native-svg";

export function AlertIcon({ size = 20, color = "#F2A41B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 7.5V10.625M2.248 13.438C1.526 14.688 2.429 16.25 3.871 16.25H16.129C17.571 16.25 18.474 14.688 17.753 13.438L11.624 2.815C10.903 1.565 9.098 1.565 8.376 2.815L2.248 13.438ZM10 13.125H10.006V13.132H10V13.125Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
