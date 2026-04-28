import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { TextWrapper } from "@/components/text-wrapper";

/**
 * OAuth callback landing screen.
 * Handles thomoai://auth/callback redirects from Google OAuth.
 * The actual token extraction is done in auth-context.tsx's deep link listener.
 * This screen just shows a spinner and redirects to the dashboard.
 */
export default function AuthCallbackScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/dashboard");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color="#1A1A1A" />
      <TextWrapper
        weight="regular"
        style={{ fontSize: 15, color: "#888" }}
      >
        Signing you in...
      </TextWrapper>
    </View>
  );
}
