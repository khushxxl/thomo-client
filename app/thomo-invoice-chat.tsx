import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { TextWrapper } from "@/components/text-wrapper";
import { getErrorMessage } from "@/lib/api";
import {
  buildInvoiceClientSuggestions,
  buildInvoiceDraftFromSuggestion,
  buildManualClientDraft,
  type InvoiceClientSuggestion,
} from "@/lib/invoice-ai";
import type { InvoiceDraft } from "@/lib/invoice-draft";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import { listInvoices } from "@/lib/invoices";
import { useThomo } from "@/lib/thomo-context";

type Message = {
  id: string;
  text: string;
  role: "user" | "assistant";
  typing?: boolean;
};

type Stage = "booting" | "choose-client" | "manual-client" | "draft-ready";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function responseDelay(text: string) {
  return Math.min(Math.max(720, 460 + text.length * 9), 1400);
}

function ThomoAvatar({ size = 32 }: { size?: number }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.12);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1,
      true,
    );
    glow.value = withRepeat(
      withSequence(withTiming(0.22, { duration: 1200 }), withTiming(0.12, { duration: 1200 })),
      -1,
      true,
    );
  }, [glow, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#171717",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <TextWrapper weight="medium" style={{ fontSize: 10, color: "#FFFFFF" }}>
        th.
      </TextWrapper>
    </Animated.View>
  );
}

function SendIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4L12 20M12 4L6 10M12 4L18 10"
        stroke="#171717"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={8} stroke="#999" strokeWidth={1.3} />
      <Path
        d="M2 10H18M10 2C12.5 4.5 13 7 13 10C13 13 12.5 15.5 10 18M10 2C7.5 4.5 7 7 7 10C7 13 7.5 15.5 10 18"
        stroke="#999"
        strokeWidth={1.3}
      />
    </Svg>
  );
}

function AttachIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15 6.5V14.5C15 16.71 13.21 18.5 11 18.5C8.79 18.5 7 16.71 7 14.5V5C7 3.62 8.12 2.5 9.5 2.5C10.88 2.5 12 3.62 12 5V13.5C12 14.05 11.55 14.5 11 14.5C10.45 14.5 10 14.05 10 13.5V6.5"
        stroke="#999"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5C8.62 1.5 7.5 2.62 7.5 4V10C7.5 11.38 8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10V4C12.5 2.62 11.38 1.5 10 1.5Z"
        stroke="#999"
        strokeWidth={1.3}
      />
      <Path
        d="M5 9V10C5 12.76 7.24 15 10 15C12.76 15 15 12.76 15 10V9"
        stroke="#999"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <Path d="M10 15V18.5" stroke="#999" strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

function TypingDot({ index }: { index: number }) {
  const opacity = useSharedValue(0.25);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withDelay(
        index * 120,
        withSequence(
          withTiming(1, { duration: 260 }),
          withTiming(0.25, { duration: 260 }),
        ),
      ),
      -1,
      false,
    );
    translateY.value = withRepeat(
      withDelay(
        index * 120,
        withSequence(
          withTiming(-2, { duration: 260 }),
          withTiming(0, { duration: 260 }),
        ),
      ),
      -1,
      false,
    );
  }, [index, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    />
  );
}

function TypingBubble() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 22 }}>
      <TypingDot index={0} />
      <TypingDot index={1} />
      <TypingDot index={2} />
    </View>
  );
}

function extractManualClient(input: string): { name: string; email?: string } {
  const emailMatch = input.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const email = emailMatch?.[0];
  const name = input.replace(email ?? "", "").replace(/[,|-]+/g, " ").trim();
  return {
    name: name || input.trim(),
    email: email || undefined,
  };
}

function SuggestionCard({
  suggestion,
  onPress,
}: {
  suggestion: InvoiceClientSuggestion;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(220)} layout={LinearTransition.duration(220)}>
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: INVOICE_RADIUS.surface,
          borderWidth: 1,
          borderColor: "#ECECEC",
          backgroundColor: "#FFFFFF",
          padding: 14,
          marginBottom: 10,
        }}
      >
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <TextWrapper weight="medium" style={{ fontSize: 15, color: "#171717" }}>
              {suggestion.name}
            </TextWrapper>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 13, color: "#71717A", marginTop: 4 }}
            >
              {suggestion.company || suggestion.email || suggestion.note || "Recent client"}
            </TextWrapper>
          </View>
          <View
            style={{
              borderRadius: INVOICE_RADIUS.control,
              backgroundColor: "#F4F4F5",
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 11, color: "#171717" }}>
              {suggestion.source === "combined"
                ? "History"
                : suggestion.source === "invoice"
                  ? "Invoice"
                  : "Txn"}
            </TextWrapper>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(220)} layout={LinearTransition.duration(220)}>
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: INVOICE_RADIUS.control,
          backgroundColor: primary ? "#171717" : "#FFFFFF",
          borderWidth: primary ? 0 : 1,
          borderColor: "#ECECEC",
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TextWrapper
          weight="medium"
          style={{ fontSize: 15, color: primary ? "#FFFFFF" : "#171717" }}
        >
          {label}
        </TextWrapper>
      </Pressable>
    </Animated.View>
  );
}

import { ThomoAiBubble } from "@/components/thomo-ai/chat-bubble";

function MessageRow({ message }: { message: Message }) {
  if (message.role === "assistant") {
    return (
      <ThomoAiBubble
        text={message.text}
        loadingText={message.typing ? "Creating invoice for..." : undefined}
      />
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      layout={LinearTransition.duration(220)}
      style={{
        alignSelf: "flex-end",
        marginBottom: 16,
        maxWidth: "80%",
      }}
    >
      <View
        style={{
          backgroundColor: "#F4F4F5",
          borderRadius: 18,
          borderBottomRightRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TextWrapper weight="regular" style={{ fontSize: 15, color: "#171717", lineHeight: 22 }}>
          {message.text}
        </TextWrapper>
      </View>
    </Animated.View>
  );
}

export default function ThomoInvoiceChatScreen() {
  const { transactions, profile } = useThomo();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("booting");
  const [screenError, setScreenError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<InvoiceClientSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<InvoiceClientSuggestion | null>(
    null,
  );
  const [pendingDraft, setPendingDraft] = useState<InvoiceDraft | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];
  }, []);

  const queueAssistantReply = useCallback(
    (text: string, onDone?: () => void, delay = responseDelay(text)) => {
      const typingId = makeId("typing");
      setMessages((prev) => [{ id: typingId, role: "assistant", text: "", typing: true }, ...prev]);

      const timer = setTimeout(() => {
        setMessages((prev) => [
          { id: makeId("assistant"), role: "assistant", text },
          ...prev.filter((message) => message.id !== typingId),
        ]);
        onDone?.();
      }, delay);

      timerIds.current.push(timer);
    },
    [],
  );

  useEffect(() => {
    setMessages([
      {
        id: makeId("boot_user"),
        role: "user",
        text: "Can you please help me create an invoice?",
      },
    ]);

    let cancelled = false;

    const boot = async () => {
      setStage("booting");
      setScreenError(null);
      clearTimers();

      try {
        const invoices = await listInvoices();
        if (cancelled) return;

        const nextSuggestions = buildInvoiceClientSuggestions(invoices, transactions, profile);
        setSuggestions(nextSuggestions);

        queueAssistantReply(
          nextSuggestions.length > 0
            ? "Yeah, sure. Choose a client from your recent history, or enter one manually. I’ll prepare the draft first, then you can add optional branding, payment details, and review the final invoice template."
            : "Yeah, sure. I couldn't find recent clients yet, so enter the client manually. I’ll prepare the draft first, then you can add optional branding, payment details, and review the final invoice template.",
          () => {
            if (!cancelled) {
              setStage(nextSuggestions.length > 0 ? "choose-client" : "manual-client");
            }
          },
        );
      } catch (err) {
        if (cancelled) return;

        queueAssistantReply(
          "I can still help you create it manually. Type the client name or paste their email, and I’ll prepare the invoice draft.",
          () => {
            if (!cancelled) setStage("manual-client");
          },
        );
        setScreenError(getErrorMessage(err, "Could not load invoice history."));
      }
    };

    void boot();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [clearTimers, profile, queueAssistantReply, transactions]);

  const composerPlaceholder = useMemo(() => {
    if (stage === "booting") return "Thomo is preparing the invoice flow...";
    if (stage === "manual-client") return "Type the client name or add an email...";
    return "Reply here...";
  }, [stage]);

  const openDraft = useCallback((draft: InvoiceDraft) => {
    router.replace({
      pathname: "/create-invoice",
      params: {
        source: "thomo",
        draft: JSON.stringify(draft),
      },
    });
  }, []);

  const appendUserMessage = useCallback((text: string) => {
    setMessages((prev) => [{ id: makeId("user"), role: "user", text }, ...prev]);
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion: InvoiceClientSuggestion) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      appendUserMessage(suggestion.name);

      const draft = buildInvoiceDraftFromSuggestion(suggestion, profile);
      setSelectedSuggestion(suggestion);
      setPendingDraft(draft);
      setStage("booting");

      queueAssistantReply(
        suggestion.source === "invoice" || suggestion.source === "combined"
          ? `Perfect. I pulled the latest invoice context for ${suggestion.name} and prepared a draft. The next screen keeps the required fields up front, then lets you add logo branding and payment information only if you want them.`
          : `Perfect. I found recent activity for ${suggestion.name} and prepared a draft. The next screen keeps the required fields up front, then lets you add logo branding and payment information only if you want them.`,
        () => setStage("draft-ready"),
      );
    },
    [appendUserMessage, profile, queueAssistantReply],
  );

  const handleManualIntent = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    appendUserMessage("Enter manually");
    setStage("booting");
    queueAssistantReply(
      "No problem. Send me the client name, and if you already have it, include their email too.",
      () => setStage("manual-client"),
      680,
    );
  }, [appendUserMessage, queueAssistantReply]);

  const handleSend = useCallback(() => {
    if (!input.trim() || stage === "booting") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const content = input.trim();
    appendUserMessage(content);
    setInput("");
    setStage("booting");

    const manual = extractManualClient(content);
    const draft = buildManualClientDraft(manual.name, profile);
    if (manual.email) {
      draft.client_email = manual.email;
    }

    setPendingDraft(draft);
    setSelectedSuggestion(null);

    queueAssistantReply(
      `Done. I prepared a draft for ${draft.client_name}. Review it now, add optional logo/payment details if needed, and check the final invoice template before creating it.`,
      () => setStage("draft-ready"),
    );
  }, [appendUserMessage, input, profile, queueAssistantReply, stage]);

  const blankDraftFromSuggestion = selectedSuggestion
    ? buildManualClientDraft(selectedSuggestion.name, profile)
    : null;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages, stage]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 18 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: 60,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#F5F5F5",
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 44 }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/(tabs)/invoices");
            }}
            hitSlop={12}
            style={{
              position: "absolute",
              left: 0,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F9F9F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeftIcon size={20} color="#171717" strokeWidth={2.5} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <TextWrapper weight="bold" style={{ fontSize: 17, color: "#171717" }}>
              Thomo AI
            </TextWrapper>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#22C55E",
                  marginRight: 4,
                }}
              />
              <TextWrapper weight="medium" style={{ fontSize: 11, color: "#71717A" }}>
                Online
              </TextWrapper>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageRow message={item} />}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 10,
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        {screenError ? (
          <Animated.View entering={FadeInUp.duration(220)}>
            <View
              style={{
                borderRadius: INVOICE_RADIUS.surface,
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 12,
              }}
            >
              <TextWrapper weight="medium" style={{ fontSize: 13, color: "#B91C1C" }}>
                {screenError}
              </TextWrapper>
            </View>
          </Animated.View>
        ) : null}

        {stage === "choose-client" ? (
          <Animated.View entering={FadeInUp.duration(220)} layout={LinearTransition.duration(220)}>
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onPress={() => handleSuggestionSelect(suggestion)}
              />
            ))}
            <ActionButton label="Enter client manually" onPress={handleManualIntent} />
          </Animated.View>
        ) : null}

        {stage === "draft-ready" && pendingDraft ? (
          <Animated.View entering={FadeInUp.duration(220)} layout={LinearTransition.duration(220)}>
            <ActionButton label="Review draft" primary onPress={() => openDraft(pendingDraft)} />
            {blankDraftFromSuggestion ? (
              <ActionButton
                label="Start blank instead"
                onPress={() => openDraft(blankDraftFromSuggestion)}
              />
            ) : null}
          </Animated.View>
        ) : null}
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 28,
        }}
      >
        <View
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: INVOICE_RADIUS.surface,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={composerPlaceholder}
            placeholderTextColor="#999999"
            editable={stage !== "booting"}
            style={{
              fontSize: 15,
              color: "#171717",
              fontFamily: "NeueMontreal-Regular",
              paddingVertical: 0,
              marginBottom: 12,
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <View
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <GlobeIcon size={20} />
              <AttachIcon size={20} />
              <MicIcon size={20} />
            </View>
            <Pressable onPress={handleSend} hitSlop={8} disabled={stage === "booting"}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  borderWidth: 1.5,
                  borderColor: "#171717",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FFFFFF",
                  opacity: stage === "booting" ? 0.45 : 1,
                }}
              >
                <SendIcon size={14} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
