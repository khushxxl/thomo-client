import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { TemplatePreviewCard } from "@/components/invoice-builder/template-preview-card";
import { SectionTitle } from "@/components/invoice-builder/shared";
import type { InvoiceTemplateId } from "@/lib/invoice-draft";
import {
  INVOICE_TEMPLATE_OPTIONS,
  invoiceTemplateMeta,
  type InvoiceTemplateOption,
} from "@/lib/invoice-templates";

type Props = {
  selectedTemplate: InvoiceTemplateId;
  onSelect: (templateId: InvoiceTemplateId) => void;
  onNext: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TemplateStep({ selectedTemplate, onSelect, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const isSmallScreen = windowHeight < 720;
  const cardWidth = Math.min(windowWidth - 100, 280);
  const gap = 14;
  const snapInterval = cardWidth + gap;
  const sidePadding = Math.max((windowWidth - cardWidth) / 2, 20);

  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        INVOICE_TEMPLATE_OPTIONS.findIndex((option) => option.id === selectedTemplate),
      ),
    [selectedTemplate],
  );

  const scrollToIndex = (index: number, animated: boolean) => {
    scrollRef.current?.scrollTo({ x: index * snapInterval, y: 0, animated });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: selectedIndex * snapInterval, y: 0, animated: false });
    scrollX.value = selectedIndex * snapInterval;
  }, [selectedIndex, snapInterval, scrollX]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / snapInterval);
      const template = INVOICE_TEMPLATE_OPTIONS[index];
      if (template) {
        runOnJS(onSelect)(template.id);
      }
    },
  });

  const handleSelect = (id: InvoiceTemplateId, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
    scrollToIndex(index, true);
  };

  const current = invoiceTemplateMeta(selectedTemplate);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <SectionTitle
            title="Invoice Style"
            subtitle="Swipe to pick the one that fits your brand."
          />
        </View>

        <View style={{ height: isSmallScreen ? 340 : 420 }}>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            snapToAlignment="start"
            disableIntervalMomentum
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: sidePadding,
              alignItems: "center",
            }}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {INVOICE_TEMPLATE_OPTIONS.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                scrollX={scrollX}
                snapInterval={snapInterval}
                cardWidth={cardWidth}
                selectedTemplate={selectedTemplate}
                isLast={index === INVOICE_TEMPLATE_OPTIONS.length - 1}
                gap={gap}
                onSelect={() => handleSelect(template.id, index)}
              />
            ))}
          </Animated.ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {INVOICE_TEMPLATE_OPTIONS.map((_, index) => (
              <PaginationDot
                key={index}
                index={index}
                scrollX={scrollX}
                snapInterval={snapInterval}
                accent={current.accent}
              />
            ))}
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "#ECECEC",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: current.accent,
                }}
              />
              <TextWrapper weight="medium" style={{ fontSize: 18, color: "#171717" }}>
                {current.name}
              </TextWrapper>
            </View>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 14, color: "#666B74", marginTop: 4, lineHeight: 20 }}
            >
              {current.subtitle}
            </TextWrapper>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: "#F7F7F5",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.04)",
        }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
        >
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
                Continue with {current.name}
              </TextWrapper>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function TemplateCard({
  template,
  index,
  scrollX,
  snapInterval,
  selectedTemplate,
  onSelect,
  cardWidth,
  isLast,
  gap,
}: {
  template: InvoiceTemplateOption;
  index: number;
  scrollX: SharedValue<number>;
  snapInterval: number;
  selectedTemplate: InvoiceTemplateId;
  onSelect: () => void;
  cardWidth: number;
  isLast: boolean;
  gap: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    return {
      transform: [
        {
          scale: interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolate.CLAMP),
        },
      ],
      opacity: interpolate(scrollX.value, inputRange, [0.72, 1, 0.72], Extrapolate.CLAMP),
    };
  });

  const isSelected = selectedTemplate === template.id;

  return (
    <AnimatedPressable
      onPress={onSelect}
        style={[
          {
            width: cardWidth,
            marginRight: isLast ? 0 : gap,
          },
        animatedStyle,
      ]}
    >
      <View
        style={{
          borderRadius: 18,
          borderWidth: 2,
          borderColor: isSelected ? template.accent : "transparent",
          padding: 4,
          backgroundColor: isSelected ? `${template.accent}12` : "transparent",
        }}
      >
        <TemplatePreviewCard templateId={template.id} />
      </View>
    </AnimatedPressable>
  );
}

function PaginationDot({
  index,
  scrollX,
  snapInterval,
  accent,
}: {
  index: number;
  scrollX: SharedValue<number>;
  snapInterval: number;
  accent: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    return {
      width: interpolate(scrollX.value, inputRange, [8, 22, 8], Extrapolate.CLAMP),
      opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolate.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 999,
          backgroundColor: accent,
        },
        animatedStyle,
      ]}
    />
  );
}
