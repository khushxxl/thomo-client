import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Linking } from "react-native";
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
import { supabase } from "@/lib/supabase";
import { fetchProfile } from "@/lib/api";

const AnimatedTextWrapper = Animated.createAnimatedComponent(TextWrapper);

const SPLASH_DURATION = 2400;

export default function HomeScreen() {
  const mountTime = useRef(Date.now());
  const hasNavigated = useRef(false);

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const screenOpacity = useSharedValue(1);

  // Animate splash
  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 500, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 12, stiffness: 150 }),
    );
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );
    screenOpacity.value = withDelay(2000, withTiming(0, { duration: 400 }));
  }, []);

  // Single routing decision
  useEffect(() => {
    let cancelled = false;

    const decide = async () => {
      // Check auth first — deep links should only be honored if signed in
      const {
        data: { session: earlySession },
      } = await supabase.auth.getSession();

      if (earlySession?.user) {
        const initialUrl = await Linking.getInitialURL();
        if (
          initialUrl &&
          !initialUrl.endsWith("//") &&
          !initialUrl.endsWith("://")
        ) {
          return; // Deep link route handles navigation
        }
      }

      // Wait for splash animation to finish
      const elapsed = Date.now() - mountTime.current;
      const remaining = Math.max(0, SPLASH_DURATION - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      if (cancelled || hasNavigated.current) return;
      hasNavigated.current = true;

      // Check auth state fresh — don't rely on context which may be stale
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/welcome");
        return;
      }

      // Signed in — check onboarding
      try {
        const profile = await fetchProfile();
        if (profile.onboarded) {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/intro" as never);
        }
      } catch {
        router.replace("/(tabs)/dashboard");
      }
    };

    decide();

    return () => {
      cancelled = true;
    };
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
