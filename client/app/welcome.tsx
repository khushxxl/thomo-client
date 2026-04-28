import { View, ImageBackground, Alert } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/lib/auth-context";
import { fetchProfile } from "@/lib/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import { AppleIcon } from "@/components/icons/apple-icon";
import { GoogleIcon } from "@/components/icons/google-icon";

const AnimatedTextWrapper = Animated.createAnimatedComponent(TextWrapper);

export default function WelcomeScreen() {
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();

      // Sign-in succeeded — check onboarding status and route
      try {
        const profile = await fetchProfile();
        if (profile.onboarded) {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/intro" as never);
        }
      } catch {
        router.replace("/intro" as never);
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
      Alert.alert(
        "Sign in failed",
        "Could not sign in with Google. Please try again.",
      );
    } finally {
      setSigningIn(false);
    }
  };
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(16);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });

    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );

    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonsTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  return (
    <ImageBackground
      source={require("@/assets/images/welcome-bg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <StatusBar style="dark" />

      {/* Spacer pushes content to bottom */}
      <View className="flex-1" />

      {/* Bottom content */}
      <View
        className="items-center px-6 pb-10 gap-3"
        style={{ paddingTop: 24 }}
      >
        {/* Logo */}
        <Animated.View style={logoStyle}>
          <Image
            contentFit="contain"
            source={require("@/assets/images/logo.png")}
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
            }}
          />
        </Animated.View>

        {/* Title */}
        <AnimatedTextWrapper
          weight="medium"
          style={[
            {
              fontSize: 28,
              lineHeight: 36,
              textAlign: "center",
              marginTop: 20,
            },
            titleStyle,
          ]}
          className="text-black"
        >
          Get started with{"\n"}Thomo AI
        </AnimatedTextWrapper>

        {/* Subtitle */}
        <AnimatedTextWrapper
          weight="regular"
          style={[
            {
              fontSize: 15,
              lineHeight: 22,
              textAlign: "center",
              marginTop: 12,
              color: "#888",
            },
            subtitleStyle,
          ]}
        >
          A finance tool built for someone who hates{"\n"}the financial side of
          running a business.
        </AnimatedTextWrapper>

        {/* Buttons */}
        <Animated.View
          style={[{ width: "100%", marginTop: 28, gap: 12 }, buttonsStyle]}
        >
          {/* Continue with Apple */}
          <Pressable3D
            className="flex-row items-center justify-center rounded-2xl bg-[#1A1A1A] py-5"
            shadowColor="#000"
            onPress={() => router.push("/(tabs)/dashboard")}
          >
            <AppleIcon size={20} color="#fff" />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: "#fff", marginLeft: 10 }}
            >
              Continue with Apple
            </TextWrapper>
          </Pressable3D>

          {/* Continue with Google */}
          <Pressable3D
            className="flex-row items-center justify-center rounded-2xl border border-gray-200 bg-white py-5"
            // shadowColor="#999"
            onPress={handleGoogleSignIn}
            style={{ opacity: signingIn ? 0.6 : 1 }}
          >
            <GoogleIcon size={20} />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: "#1A1A1A", marginLeft: 10 }}
            >
              {signingIn ? "Signing in..." : "Continue with Google"}
            </TextWrapper>
          </Pressable3D>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}
