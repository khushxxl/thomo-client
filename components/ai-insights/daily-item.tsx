import React, { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { TextWrapper } from "@/components/text-wrapper";
import { type AiInsights } from "@/lib/api";
import { formatMoney, formatDelta, formatAverageDelta } from "./helpers";
import { Icon } from "./shared";
import { ThomoAdvice } from "./thomo-advice";

export function DailyItem({
  day,
  defaultExpanded = false,
}: {
  day: AiInsights["daily_intelligence"][number];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isHigh = day.percentage_vs_usual >= 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <Pressable
        onPress={toggle}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#09090B" }}>
            {day.date}
          </TextWrapper>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#71717A" }}>
              {formatMoney(day.spent)} spent
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#71717A", marginHorizontal: 6 }}>
              •
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 13, color: isHigh ? "#F2A41B" : "#00A281" }}>
              {formatDelta(day.percentage_vs_usual)}
            </TextWrapper>
          </View>
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <Icon name="chevronDown" color="#777777" />
        </View>
      </Pressable>

      {expanded ? (
        <View style={{ marginTop: 16 }}>
          <View
            style={{
              height: 2,
              width: "100%",
              borderBottomWidth: 1,
              borderColor: "#E8E8E8",
              borderStyle: "dashed",
              marginBottom: 20,
            }}
          />
          {day.breakdown.map((item) => (
            <View
              key={item.category}
              style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#555555" }}>
                {item.category}
              </TextWrapper>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#555555" }}>
                {formatMoney(item.amount, true)}
              </TextWrapper>
            </View>
          ))}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 2,
              marginBottom: 18,
            }}
          >
            <Icon name="arrowUp" color={isHigh ? "#F2A41B" : "#00A281"} />
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
              <TextWrapper weight="regular" style={{ color: isHigh ? "#F2A41B" : "#00A281" }}>
                {Math.abs(Math.round(day.percentage_vs_usual))}%
              </TextWrapper>{" "}
              {isHigh ? "higher" : "lower"} than your average {day.date.split(",")[0]}
            </TextWrapper>
          </View>
          <ThomoAdvice text={day.thomo_advice} />
        </View>
      ) : (
        <View
          style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EFEFEF" }}
        >
          <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777" }}>
            Biggest Spend: {day.breakdown[0]?.category || "Uncategorised"}
          </TextWrapper>
        </View>
      )}
    </View>
  );
}
