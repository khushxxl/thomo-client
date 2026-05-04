import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { TextWrapper } from "@/components/text-wrapper";
import { fetchProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/**
 * OAuth callback landing screen.
 * Handles thomoai://auth/callback redirects from Google OAuth.
 * The actual token extraction is done in auth-context.tsx's deep link listener.
 * This screen waits for the session, then applies the same onboarding routing
 * as the normal app launch.
 */
export default function AuthCallbackScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/welcome");
      return;
    }

    let cancelled = false;

    const routeAfterSignIn = async () => {
      try {
        const profile = await fetchProfile();
        if (cancelled) return;
        router.replace(profile.onboarded ? "/(tabs)/dashboard" : "/intro");
      } catch {
        if (!cancelled) {
          router.replace("/intro");
        }
      }
    };

    routeAfterSignIn();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

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
