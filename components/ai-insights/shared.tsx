import React from "react";
import Svg, { Path } from "react-native-svg";
import { CalendarIcon, CategoryIcon, GraphIcon } from "@/components/icons";

export function Icon({ name, color = "#515151" }: { name: string; color?: string }) {
  if (name === "receipt") {
    return <CategoryIcon size={18} color={color} />;
  }

  if (name === "chart") {
    return <GraphIcon size={18} color={color} />;
  }

  if (name === "calendar") {
    return <CalendarIcon size={18} color={color} />;
  }

  if (name === "arrowUp") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M12 19V5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path
          d="M6 11L12 5L18 11"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "chevronDown") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 9L12 15L18 9"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return null;
}
