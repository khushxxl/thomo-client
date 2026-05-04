import { Image } from "expo-image";
import { useEffect } from "react";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";

const AnimatedTextWrapper = Animated.createAnimatedComponent(TextWrapper);

export default function HomeScreen() {
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo fades in and scales up with a subtle bounce
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 500, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 12, stiffness: 150 }),
    );

    // Text slides up and fades in after logo
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );

    // After 2s, fade out and navigate to welcome
    screenOpacity.value = withDelay(2000, withTiming(0, { duration: 400 }));

    const timeout = setTimeout(() => {
      router.replace("/welcome" as never);
    }, 2400);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View
      style={[{ flex: 1 }, screenAnimatedStyle]}
      className="items-center justify-center bg-white"
    >
      <Animated.View style={logoAnimatedStyle}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 60, height: 60, borderRadius: 0 }}
        />
      </Animated.View>
      <AnimatedTextWrapper
        weight="bold"
        style={[{ fontSize: 24 }, textAnimatedStyle]}
        className="mt-4 text-black tracking-wide"
      >
        Thomo AI
      </AnimatedTextWrapper>
    </Animated.View>
  );
}
