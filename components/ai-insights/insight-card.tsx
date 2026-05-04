import React from "react";
import { View } from "react-native";
import { TextWrapper } from "@/components/text-wrapper";
import { Icon } from "./shared";

export function InsightCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: "receipt" | "chart";
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        minHeight: 86,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name={icon} />
        <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777" }}>
          {title}
        </TextWrapper>
      </View>
      <TextWrapper
        weight="regular"
        style={{ fontSize: 17, color: "#1F1F1F", lineHeight: 24 }}
        numberOfLines={1}
      >
        {value}
      </TextWrapper>
    </View>
  );
}
