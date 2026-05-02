import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextWrapper } from "@/components/text-wrapper";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/api";
import { useThomo } from "@/lib/thomo-context";

function PencilIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M10.667 2L14 5.333M2 14H5.333L13.057 6.276C13.369 5.964 13.544 5.541 13.544 5.1C13.544 4.659 13.369 4.236 13.057 3.924L12.076 2.943C11.764 2.631 11.341 2.456 10.9 2.456C10.459 2.456 10.036 2.631 9.724 2.943L2 10.667V14Z"
        stroke="#111111"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M5.25 2.917L9.333 7L5.25 11.083"
        stroke="#A1A1AA"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SafeDot() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Circle cx={5} cy={5} r={5} fill="#D9FFF5" />
      <Circle cx={5} cy={5} r={2.5} fill="#10B981" />
    </Svg>
  );
}

function SectionIcon({
  type,
}: {
  type: "bank" | "lock" | "disconnect" | "delete";
}) {
  if (type === "lock") {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Path
          d="M4.5 8.25H13.5V14.25H4.5V8.25Z"
          stroke="#111111"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Path
          d="M6.375 8.25V6.75C6.375 5.3 7.55 4.125 9 4.125C10.45 4.125 11.625 5.3 11.625 6.75V8.25"
          stroke="#111111"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (type === "disconnect") {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Path
          d="M11.625 4.125L13.875 6.375M13.875 4.125L11.625 6.375"
          stroke="#111111"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <Path
          d="M7.125 5.25H5.625C4.382 5.25 3.375 6.257 3.375 7.5V12.375C3.375 13.618 4.382 14.625 5.625 14.625H10.5C11.743 14.625 12.75 13.618 12.75 12.375V10.875"
          stroke="#111111"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (type === "delete") {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Path
          d="M5.25 5.25H12.75M7.125 5.25V3.75H10.875V5.25M6 5.25V13.125M9 5.25V13.125M12 5.25V13.125M4.5 5.25H13.5V14.25C13.5 14.664 13.164 15 12.75 15H5.25C4.836 15 4.5 14.664 4.5 14.25V5.25Z"
          stroke="#111111"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M2.625 7.125H15.375M4.125 7.125V12.75M7.5 7.125V12.75M10.5 7.125V12.75M13.875 7.125V12.75M1.5 14.25H16.5M9 2.625L15.75 5.625H2.25L9 2.625Z"
        stroke="#111111"
        strokeWidth={1.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ActionRow({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  destructive?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 17,
      }}
    >
      <View style={{ width: 22, alignItems: "center" }}>{icon}</View>
      <TextWrapper
        weight="regular"
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 16,
          color: destructive ? "#FF453A" : "#171717",
        }}
      >
        {label}
      </TextWrapper>
      <ChevronRightIcon />
    </Pressable>
  );
}

function AccountAvatar({
  label,
  index,
}: {
  label: string;
  index: number;
}) {
  const themes = [
    { bg: "#EF4444", fg: "#FFFFFF" },
    { bg: "#2563EB", fg: "#FFFFFF" },
    { bg: "#0F172A", fg: "#FFFFFF" },
  ];
  const theme = themes[index % themes.length];
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 10, color: theme.fg }}>
        {label.slice(0, 2).toUpperCase()}
      </TextWrapper>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { profile, connected, balance, transactions, disconnect } = useThomo();
  const [disconnecting, setDisconnecting] = useState(false);
  const [notifications, setNotifications] = useState({
    cashWarnings: true,
    overdueAlerts: true,
    taxReminders: true,
    weeklySummary: false,
  });

  const avatarUrl =
    profile?.avatar_url ??
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  const accountRows = useMemo(() => {
    return (balance?.accounts ?? []).slice(0, 2).map((account, index) => ({
      id: account.account_id,
      name: account.account_name,
      masked: `•••• ${account.account_id.slice(-4)}`,
      tag: index === 0 ? "Selected" : "Secondary",
      color: index === 0 ? "#10B981" : "#71717A",
      index,
    }));
  }, [balance]);

  const weeklyExpenses = useMemo(() => {
    const debitTotal = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return transactions.length > 0 ? debitTotal / 6 : 0;
  }, [transactions]);

  const safeWeeks =
    weeklyExpenses > 0 && balance ? Math.floor(balance.total_available / weeklyExpenses) : null;

  const safetyCopy = safeWeeks && Number.isFinite(safeWeeks)
    ? `Cash covers next ${safeWeeks} week${safeWeeks === 1 ? "" : "s"} of estimated expenses.`
    : connected
      ? "We will estimate your runway as more account activity comes in."
      : "Connect your bank to see your cash coverage and risk position.";

  const displayName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Your profile";

  const subtitleParts = [
    profile?.business_type || "Freelancer",
    profile?.business_name || "Business",
  ];

  const details = [
    ["Business name", profile?.business_name || "Not added"],
    ["VAT number", profile?.phone || "Not added"],
    ["Business type", profile?.business_type || "Not added"],
  ];

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect bank?",
      "You'll need to reconnect your bank to see transactions and cash insights again.",
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
              Alert.alert("Couldn't disconnect", getErrorMessage(err));
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F5" }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 10, 22),
          paddingBottom: Math.max(insets.bottom + 28, 36),
          paddingHorizontal: 16,
        }}
      >
        <TextWrapper
          weight="medium"
          style={{ fontSize: 22, color: "#171717", marginBottom: 20 }}
        >
          Profile
        </TextWrapper>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              overflow: "hidden",
              backgroundColor: "#E7E5E4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 42, height: 42 }}
                contentFit="cover"
              />
            ) : (
              <TextWrapper weight="medium" style={{ fontSize: 15, color: "#171717" }}>
                {displayName.slice(0, 1).toUpperCase()}
              </TextWrapper>
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
              {displayName}
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 14, color: "#8A8A8F", marginTop: 2 }}>
              {subtitleParts.join(" · ")}
            </TextWrapper>
          </View>

          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <PencilIcon />
            <TextWrapper weight="regular" style={{ fontSize: 15, color: "#171717" }}>
              Edit
            </TextWrapper>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SafeDot />
            <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
              {connected ? "You’re in a safe position" : "Connect your bank"}
            </TextWrapper>
          </View>
          <TextWrapper
            weight="regular"
            style={{ fontSize: 14, color: "#8A8A8F", lineHeight: 20, marginTop: 10 }}
          >
            {safetyCopy}
          </TextWrapper>
        </View>

        <TextWrapper weight="regular" style={{ fontSize: 14, color: "#7B7B81", marginBottom: 10 }}>
          Connected Accounts
        </TextWrapper>
        <View style={{ gap: 12, marginBottom: 20 }}>
          {accountRows.length > 0 ? (
            accountRows.map((account) => (
              <View
                key={account.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AccountAvatar label={account.name} index={account.index} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                    {account.name}
                  </TextWrapper>
                  <TextWrapper weight="regular" style={{ fontSize: 14, color: "#8A8A8F", marginTop: 3 }}>
                    {account.masked}
                  </TextWrapper>
                </View>
                <TextWrapper weight="regular" style={{ fontSize: 14, color: account.color }}>
                  {account.tag}
                </TextWrapper>
              </View>
            ))
          ) : (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 18,
              }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 15, color: "#8A8A8F" }}>
                No connected account yet
              </TextWrapper>
            </View>
          )}
        </View>

        <TextWrapper weight="regular" style={{ fontSize: 14, color: "#7B7B81", marginBottom: 10 }}>
          Business Details
        </TextWrapper>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 20,
          }}
        >
          {details.map(([label, value]) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 15, color: "#171717" }}>
                {label}
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 15, color: "#8A8A8F", maxWidth: "56%", textAlign: "right" }}
              >
                {value}
              </TextWrapper>
            </View>
          ))}
        </View>

        <TextWrapper weight="regular" style={{ fontSize: 14, color: "#7B7B81", marginBottom: 10 }}>
          Notifications
        </TextWrapper>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 6,
            marginBottom: 20,
          }}
        >
          {[
            ["Cash warnings", "cashWarnings"],
            ["Invoice overdue alert", "overdueAlerts"],
            ["Tax reminders", "taxReminders"],
            ["Weekly summary", "weeklySummary"],
          ].map(([label, key]) => (
            <View
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 11,
              }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 15, color: "#171717" }}>
                {label}
              </TextWrapper>
              <Switch
                value={notifications[key as keyof typeof notifications]}
                onValueChange={(value) =>
                  setNotifications((current) => ({ ...current, [key]: value }))
                }
                trackColor={{ false: "#D4D4D8", true: "#171717" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D4D4D8"
              />
            </View>
          ))}
        </View>

        <TextWrapper weight="regular" style={{ fontSize: 14, color: "#7B7B81", marginBottom: 10 }}>
          Others
        </TextWrapper>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <ActionRow
            icon={<SectionIcon type="bank" />}
            label={connected ? "Bank connection status" : "Connect bank"}
          />
          <View style={{ height: 1, backgroundColor: "#F1F1F2", marginLeft: 50 }} />
          <ActionRow icon={<SectionIcon type="lock" />} label="Data security info" />
          <View style={{ height: 1, backgroundColor: "#F1F1F2", marginLeft: 50 }} />
          <ActionRow
            icon={
              disconnecting ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <SectionIcon type="disconnect" />
              )
            }
            label="Disconnect bank"
            onPress={handleDisconnect}
          />
          <View style={{ height: 1, backgroundColor: "#F1F1F2", marginLeft: 50 }} />
          <ActionRow icon={<SectionIcon type="delete" />} label="Delete Account" />
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <ActionRow
            icon={<SectionIcon type="disconnect" />}
            label="Log out"
            destructive
            onPress={() => {
              Alert.alert("Sign out?", "You'll need to sign in again.", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: signOut },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
