import { Text, type TextProps, StyleSheet } from "react-native";

type FontWeight = "light" | "regular" | "medium" | "bold";

const fontMap: Record<FontWeight, { normal: string; italic: string }> = {
  light: {
    normal: "NeueMontreal-Light",
    italic: "NeueMontreal-LightItalic",
  },
  regular: {
    normal: "NeueMontreal-Regular",
    italic: "NeueMontreal-Italic",
  },
  medium: {
    normal: "NeueMontreal-Medium",
    italic: "NeueMontreal-MediumItalic",
  },
  bold: {
    normal: "NeueMontreal-Bold",
    italic: "NeueMontreal-BoldItalic",
  },
};

export type TextWrapperProps = TextProps & {
  weight?: FontWeight;
  italic?: boolean;
};

export function TextWrapper({
  weight = "regular",
  italic = false,
  style,
  ...rest
}: TextWrapperProps) {
  const fontFamily = fontMap[weight][italic ? "italic" : "normal"];

  return <Text style={[styles.base, { fontFamily }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
});
