import { View, Dimensions, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { useRef, useState, useCallback } from "react";
import { updateProfile } from "@/lib/api";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BenefitSlide {
  id: string;
  stat: string;
  description: string;
}

const SLIDES: BenefitSlide[] = [
  {
    id: "1",
    stat: "5x",
    description: "Get paid quicker with automatic\ninvoice chasing",
  },
  {
    id: "2",
    stat: "£2,400",
    description: "Average tax savings found in\nthe first 90 days",
  },
  {
    id: "3",
    stat: "92%",
    description: "Of users say Thomo reduced\ntheir financial stress",
  },
];

function Dot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [8, 28, 8],
      "clamp",
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      ["#D1D5DB", "#1A1A1A", "#D1D5DB"],
    );
    return { width, backgroundColor };
  });

  return <Animated.View style={[{ height: 8, borderRadius: 4 }, style]} />;
}

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: BenefitSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [
        (index - 0.5) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 0.5) * SCREEN_WIDTH,
      ],
      [0.8, 1, 0.8],
      "clamp",
    );
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 0.5) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 0.5) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      "clamp",
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-8"
    >
      <Animated.View style={animStyle} className="items-center">
        <TextWrapper
          weight="bold"
          style={{ fontSize: 72, color: "#1A1A1A", textAlign: "center" }}
        >
          {item.stat}
        </TextWrapper>
        <TextWrapper
          weight="regular"
          style={{
            fontSize: 17,
            lineHeight: 26,
            color: "#888",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {item.description}
        </TextWrapper>
      </Animated.View>
    </View>
  );
}

export default function BenefitsScreen() {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const finishOnboarding = async () => {
    try {
      await updateProfile({ onboarded: true });
    } catch (err) {
      console.error("Failed to mark onboarded:", err);
    }
    router.replace("/(tabs)/dashboard" as never);
  };

  const handleContinue = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <Animated.FlatList
        ref={flatListRef as never}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Bottom */}
      <View className="px-6 pb-10" style={{ gap: 20 }}>
        {/* Dots */}
        <View
          className="flex-row items-center justify-center"
          style={{ gap: 6 }}
        >
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Continue */}
        <Pressable3D
          className="items-center justify-center rounded-2xl bg-[#1A1A1A] py-5"
          shadowColor="#000"
          onPress={handleContinue}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#fff" }}>
            {isLastSlide ? "Get Started" : "Continue"}
          </TextWrapper>
        </Pressable3D>

        {/* Skip */}
      </View>
    </View>
  );
}
