import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { TemplatePreviewCard } from "@/components/invoice-builder/template-preview-card";
import { TextWrapper } from "@/components/text-wrapper";
import type { InvoiceTemplateId } from "@/lib/invoice-draft";
import { invoiceTemplateMeta } from "@/lib/invoice-templates";

type Props = {
  selectedTemplate: InvoiceTemplateId;
  onSelect: (templateId: InvoiceTemplateId) => void;
  onNext: () => void;
};

function CheckIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5L9.5 17L19 7"
        stroke="#12A383"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TemplateStep({ selectedTemplate, onSelect, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const template = invoiceTemplateMeta(selectedTemplate);
  const previewHeight = Math.min(Math.max(windowHeight * 0.58, 430), 610);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 132,
        }}
      >
        <View style={{ marginTop: 12, marginBottom: 24 }}>
          <TextWrapper weight="medium" style={{ fontSize: 28, color: "#111111", letterSpacing: -0.8 }}>
            Choose a template
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 15, color: "#71717A", marginTop: 2 }}>
            Select a style for your invoice
          </TextWrapper>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(template.id);
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E4E4E7",
                borderRadius: 20,
                backgroundColor: "#FFFFFF",
                height: previewHeight,
                overflow: "hidden",
                opacity: pressed ? 0.94 : 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.02,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 2 }}>
                <TemplatePreviewCard templateId={template.id} />
              </View>

              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 10,
                  paddingBottom: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#FFFFFF",
                  borderTopWidth: 1,
                  borderTopColor: "#F4F4F5",
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <TextWrapper weight="medium" style={{ fontSize: 16, color: "#18181B" }}>
                    {template.name}
                  </TextWrapper>
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#71717A", marginTop: 1 }}>
                    {template.subtitle}
                  </TextWrapper>
                </View>
                <CheckIcon />
              </View>
            </View>
          )}
        </Pressable>

        <TextWrapper
          weight="regular"
          style={{ fontSize: 16, color: "#A4A4A4", textAlign: "center", marginTop: 28 }}
        >
          More templates coming soon
        </TextWrapper>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 14),
          backgroundColor: "rgba(247,247,245,0.96)",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.04)",
        }}
      >
        <Pressable onPress={handleContinue}>
          {({ pressed }) => (
            <View
              style={{
                backgroundColor: "#171717",
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }}
            >
              <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
                Continue
              </TextWrapper>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
