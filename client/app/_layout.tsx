import "../global.css";

import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "expo-dev-client";
import { AuthProvider } from "@/lib/auth-context";
import { ThomoProvider } from "@/lib/thomo-context";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "NeueMontreal-Light": require("../assets/fonts/NeueMontreal-Light.otf"),
    "NeueMontreal-Regular": require("../assets/fonts/NeueMontreal-Regular.otf"),
    "NeueMontreal-Medium": require("../assets/fonts/NeueMontreal-Medium.otf"),
    "NeueMontreal-Bold": require("../assets/fonts/NeueMontreal-Bold.otf"),
    "NeueMontreal-LightItalic": require("../assets/fonts/NeueMontreal-LightItalic.otf"),
    "NeueMontreal-Italic": require("../assets/fonts/NeueMontreal-Italic.otf"),
    "NeueMontreal-MediumItalic": require("../assets/fonts/NeueMontreal-MediumItalic.otf"),
    "NeueMontreal-BoldItalic": require("../assets/fonts/NeueMontreal-BoldItalic.otf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const LightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#FFFFFF",
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ThomoProvider>
            <ThemeProvider value={LightTheme}>
              <Stack
                screenOptions={{ contentStyle: { backgroundColor: "#FFFFFF" } }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="welcome"
                  options={{
                    headerShown: false,
                    animation: "fade",
                    gestureEnabled: false,
                  }}
                />

                <Stack.Screen
                  name="bank-connect"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="auth/callback"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="intro"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="onboarding"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="analyzing"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="benefits"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="transaction-detail"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="create-invoice"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="invoice-detail"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="thomo-chat"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="magic-forecast"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="thomo-invoice-chat"
                  options={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="invoice-created"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </ThomoProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
