import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TextWrapper } from "@/components/text-wrapper";
import { useAuth } from "@/lib/auth-context";
import { useThomo } from "@/lib/thomo-context";

/**
 * Deep link landing screen for `thomoai://bank-connect`.
 *
 * Finexer redirects here after the user completes bank auth in Safari.
 * Only processes the deep link if the user is authenticated.
 */
export default function BankConnectScreen() {
  const params = useLocalSearchParams<{
    fx_consent?: string;
    fx_timestamp?: string;
    fx_signature?: string;
  }>();

  const { user, loading: authLoading } = useAuth();
  const { markConnected } = useThomo();

  useEffect(() => {
    if (authLoading) return;

    // Not signed in — ignore the deep link and go to welcome
    if (!user) {
      router.replace("/welcome");
      return;
    }

    console.log("Bank connect deep link received:", params);

    (async () => {
      await markConnected();
      router.replace("/(tabs)/dashboard");
    })();
  }, [authLoading, user]);

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
        Connecting your bank...
      </TextWrapper>
    </View>
  );
}
