import { useState } from "react";
import { View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { useThomo } from "@/lib/thomo-context";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { connected, balance, disconnect } = useThomo();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect bank?",
      "You'll need to reconnect your bank to see your transactions again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setDisconnecting(true);
            try {
              await disconnect();
            } catch (err) {
              console.error("Disconnect failed:", err);
              Alert.alert("Error", "Could not disconnect. Is the server running?");
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ],
    );
  };

  const accountsLabel = balance
    ? `${balance.accounts.length} ${balance.accounts.length === 1 ? "account" : "accounts"} connected`
    : connected
      ? "Bank connected"
      : "No bank connected";

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-20 pb-4">
          <TextWrapper
            weight="medium"
            style={{ fontSize: 24, color: "#1A1A1A" }}
          >
            Profile
          </TextWrapper>
        </View>

        {/* Bank connection section */}
        <View className="px-5 mt-2">
          <TextWrapper
            weight="medium"
            style={{
              fontSize: 12,
              color: "#888",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 10,
              paddingHorizontal: 4,
            }}
          >
            Bank Connection
          </TextWrapper>

          <View
            className="rounded-2xl bg-white"
            style={{ padding: 18, gap: 4 }}
          >
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: connected ? "#22C55E" : "#D4D4D4",
                }}
              />
              <TextWrapper
                weight="medium"
                style={{ fontSize: 16, color: "#1A1A1A" }}
              >
                {connected ? "Connected" : "Not connected"}
              </TextWrapper>
            </View>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 13, color: "#999", marginLeft: 20 }}
            >
              {accountsLabel}
            </TextWrapper>
          </View>

          {connected && (
            <Pressable
              onPress={handleDisconnect}
              disabled={disconnecting}
              className="rounded-2xl mt-3"
              style={{
                backgroundColor: "#FFFFFF",
                padding: 18,
                borderWidth: 1,
                borderColor: "#FECACA",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: disconnecting ? 0.6 : 1,
              }}
            >
              {disconnecting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <TextWrapper
                  weight="medium"
                  style={{ fontSize: 15, color: "#DC2626" }}
                >
                  Disconnect bank
                </TextWrapper>
              )}
            </Pressable>
          )}
        </View>

        {/* Sign out */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={() => {
              Alert.alert("Sign out?", "You'll need to sign in again.", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: signOut },
              ]);
            }}
            className="rounded-2xl"
            style={{
              backgroundColor: "#FFFFFF",
              padding: 18,
              alignItems: "center",
            }}
          >
            <TextWrapper
              weight="medium"
              style={{ fontSize: 15, color: "#DC2626" }}
            >
              Sign out
            </TextWrapper>
          </Pressable>

          {user?.email && (
            <TextWrapper
              weight="regular"
              style={{
                fontSize: 12,
                color: "#BBB",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Signed in as {user.email}
            </TextWrapper>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
