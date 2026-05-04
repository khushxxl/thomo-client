import Svg, { Path, Circle } from "react-native-svg";

export function TaxIcon({ size = 20, color = "#292D32" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10.308 1.791L17.808 4.791C18.1 4.908 18.333 5.258 18.333 5.566V8.333C18.333 8.791 17.958 9.166 17.5 9.166H2.5C2.042 9.166 1.667 8.791 1.667 8.333V5.566C1.667 5.258 1.9 4.908 2.192 4.791L9.692 1.791C9.858 1.725 10.142 1.725 10.308 1.791Z" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.333 18.333H1.667V15.833C1.667 15.375 2.042 15 2.5 15H17.5C17.958 15 18.333 15.375 18.333 15.833V18.333Z" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.333 15V9.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.667 15V9.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 15V9.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.333 15V9.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16.667 15V9.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M.833 18.333H19.167" stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={10} cy={5.833} r={1.25} stroke={color} strokeWidth={1.25} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
