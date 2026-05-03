import { Image, View } from "react-native";
import { TextWrapper } from "@/components/text-wrapper";

export function ThomoAdvice({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "#F9F9F9",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <Image
        source={require("@/assets/images/logo.png")}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#111111",
        }}
      />
      <View style={{ flex: 1 }}>
        <TextWrapper weight="medium" style={{ fontSize: 15, color: "#333333", marginBottom: 4 }}>
          Thomo Advice
        </TextWrapper>
        <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777", lineHeight: 17 }}>
          {`"${text}"`}
        </TextWrapper>
      </View>
    </View>
  );
}
