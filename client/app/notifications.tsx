import { View } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";

const AnimatedTextWrapper = Animated.createAnimatedComponent(TextWrapper);

export default function NotificationsScreen() {
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(16);
  const subtitleOpacity = useSharedValue(0);
  const phoneOpacity = useSharedValue(0);
  const phoneScale = useSharedValue(0.9);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
    titleY.value = withSpring(0, { damping: 14, stiffness: 120 });

    subtitleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

    phoneOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    phoneScale.value = withDelay(
      300,
      withSpring(1, { damping: 14, stiffness: 120 }),
    );

    buttonsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    buttonsY.value = withDelay(
      500,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const phoneStyle = useAnimatedStyle(() => ({
    opacity: phoneOpacity.value,
    transform: [{ scale: phoneScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  const handleEnable = () => {
    // TODO: request notification permissions
    router.replace("/analyzing" as never);
  };

  const handleSkip = () => {
    router.replace("/analyzing" as never);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-8">
        {/* Title */}
        <AnimatedTextWrapper
          weight="medium"
          style={[
            {
              fontSize: 28,
              lineHeight: 36,
              textAlign: "center",
              color: "#1A1A1A",
            },
            titleStyle,
          ]}
        >
          Never Miss What Matters
        </AnimatedTextWrapper>

        {/* Subtitle */}
        <AnimatedTextWrapper
          weight="regular"
          style={[
            {
              fontSize: 16,
              lineHeight: 24,
              textAlign: "center",
              color: "#888",
              marginTop: 12,
            },
            subtitleStyle,
          ]}
        >
          Thomo tells you before problems{"\n"}happen not after.
        </AnimatedTextWrapper>

        {/* Phone mockup */}
        <Animated.View style={[{ marginTop: 40 }, phoneStyle]}>
          <Image
            source={require("@/assets/images/notifications-asset.png")}
            style={{ width: 300, height: 260 }}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom buttons */}
      <Animated.View className="px-6 pb-10" style={[{ gap: 16 }, buttonsStyle]}>
        <Pressable3D
          className="items-center justify-center rounded-2xl bg-[#1A1A1A] py-5"
          shadowColor="#000"
          onPress={handleEnable}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#fff" }}>
            Turn on notifications
          </TextWrapper>
        </Pressable3D>

        <Pressable3D
          className="items-center justify-center py-2"
          onPress={handleSkip}
        >
          <TextWrapper
            weight="medium"
            style={{ fontSize: 15, color: "#1A1A1A" }}
          >
            Skip for now
          </TextWrapper>
        </Pressable3D>
      </Animated.View>
    </View>
  );
}
