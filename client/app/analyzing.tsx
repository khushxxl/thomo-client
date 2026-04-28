import { View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";

const AnimatedTextWrapper = Animated.createAnimatedComponent(TextWrapper);

const TIPS = [
  "Thomo is optimizing your financial decisions",
  "Scanning for recurring expenses",
  "Building your cash flow profile",
];

export default function AnalyzingScreen() {
  const progressWidth = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const adviceOpacity = useSharedValue(0);
  const tipOpacity = useSharedValue(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Fade in title
    titleOpacity.value = withTiming(1, { duration: 500 });
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    // Progress bar fills over 4 seconds
    progressWidth.value = withTiming(100, {
      duration: 4000,
      easing: Easing.inOut(Easing.quad),
    });

    // Advice fades in
    adviceOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

    // Tip text
    tipOpacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withDelay(1000, withTiming(0, { duration: 400 })),
        ),
        -1,
      ),
    );

    // Cycle tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 1800);

    // Navigate after 4 seconds
    const timeout = setTimeout(() => {
      router.replace("/benefits" as never);
    }, 4200);

    return () => {
      clearInterval(tipInterval);
      clearTimeout(timeout);
    };
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const adviceStyle = useAnimatedStyle(() => ({
    opacity: adviceOpacity.value,
  }));

  const tipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
  }));

  return (
    <View className="flex-1 bg-[#F9F9F9] items-center justify-center px-8">
      <StatusBar style="dark" />

      <View className="items-center" style={{ gap: 16 }}>
        {/* Title */}
        <AnimatedTextWrapper
          weight="medium"
          style={[
            { fontSize: 24, color: "#1A1A1A", textAlign: "center" },
            titleStyle,
          ]}
        >
          Analyzing ledgers
        </AnimatedTextWrapper>

        {/* Subtitle */}
        <AnimatedTextWrapper
          weight="regular"
          style={[
            { fontSize: 14, color: "#888", textAlign: "center" },
            subtitleStyle,
          ]}
        >
          This could take up to 30 seconds
        </AnimatedTextWrapper>

        {/* Progress bar */}
        <View
          style={{
            width: 220,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#E5E5E5",
            marginTop: 8,
          }}
        >
          <Animated.View
            style={[
              {
                height: 6,
                borderRadius: 3,
                backgroundColor: "#1A1A1A",
              },
              progressStyle,
            ]}
          />
        </View>

        {/* Thomo advice */}
        <Animated.View
          style={[{ marginTop: 32, alignItems: "center", gap: 8 }, adviceStyle]}
        >
          <TextWrapper
            weight="bold"
            style={{
              fontSize: 12,
              color: "#1A1A1A",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            THOMO ADVICE
          </TextWrapper>
          <TextWrapper
            weight="regular"
            style={{
              fontSize: 14,
              color: "#888",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            You could improve cash flow by collecting{"\n"}receivables faster
          </TextWrapper>
        </Animated.View>
      </View>

      {/* Bottom tip */}
      <AnimatedTextWrapper
        weight="regular"
        style={[
          {
            position: "absolute",
            bottom: 60,
            fontSize: 13,
            color: "#B0B0B0",
            textAlign: "center",
          },
          tipStyle,
        ]}
      >
        {TIPS[tipIndex]}
      </AnimatedTextWrapper>
    </View>
  );
}
