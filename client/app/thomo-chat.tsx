import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { ThomoAvatarIcon } from "@/components/icons/thomo-avatar-icon";
import {
  createConversation,
  deleteConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
  type Conversation,
} from "@/lib/api";

const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Expense analysis for April",
    updated_at: new Date().toISOString(),
  },
  {
    id: "conv-2",
    title: "Tax deductions for 2024",
    updated_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: "conv-3",
    title: "Freelance income tracking",
    updated_at: new Date(Date.now() - 86_400_000 * 2).toISOString(),
  },
];

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
};

type HistoryGroup = {
  label: string;
  items: Conversation[];
};

function groupConversations(conversations: Conversation[]): HistoryGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const groups: Record<string, Conversation[]> = {};

  for (const conv of conversations) {
    const date = new Date(conv.updated_at);
    let label = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    if (date >= today) label = "Today";
    else if (date >= yesterday) label = "Yesterday";

    groups[label] = [...(groups[label] ?? []), conv];
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function MenuIcon({ size = 24, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={7} x2={20} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={17} x2={20} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ size = 20, color = "#8D8D8D" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={9} cy={9} r={6} stroke={color} strokeWidth={1.7} />
      <Path d="M13.5 13.5L18 18" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

function MessageIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6.5C5 5.12 6.12 4 7.5 4H16.5C17.88 4 19 5.12 19 6.5V13.5C19 14.88 17.88 16 16.5 16H10L6 20V16.2C5.41 15.91 5 15.31 5 14.6V6.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={8} stroke="#999" strokeWidth={1.3} />
      <Path d="M2 10H18M10 2C12.5 4.5 13 7 13 10C13 13 12.5 15.5 10 18M10 2C7.5 4.5 7 7 7 10C7 13 7.5 15.5 10 18" stroke="#999" strokeWidth={1.3} />
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
      <Path d="M10 1.5C8.62 1.5 7.5 2.62 7.5 4V10C7.5 11.38 8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10V4C12.5 2.62 11.38 1.5 10 1.5Z" stroke="#999" strokeWidth={1.3} />
      <Path d="M5 9V10C5 12.76 7.24 15 10 15C12.76 15 15 12.76 15 10V9" stroke="#999" strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M10 15V18.5" stroke="#999" strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

function SendArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="#1A1A1A"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NewChatIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M10 11V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M14 11V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M6 7L7 20H17L18 7" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M9 7V4H15V7" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function isInvoiceIntent(text: string): boolean {
  return /\b(invoice|invoices|bill client|billing|create bill|raise invoice|send invoice)\b/i.test(
    text,
  );
}

const EmptyChatState = memo(function EmptyChatState() {
  return (
    <View className="items-center" style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28, paddingBottom: 60 }}>
      <Image
        source={require("../assets/images/logo.png")}
        style={{ width: 64, height: 64, borderRadius: 16 }}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1A1A1A", marginTop: 12 }}>
        Hey, I&apos;m Thomo
      </TextWrapper>
      <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 4, textAlign: "center" }}>
        Your AI CFO. Ask me anything about your finances.
      </TextWrapper>
    </View>
  );
});

const TypingDots = memo(function TypingDots() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((value) => (value >= 3 ? 1 : value + 1));
    }, 230);

    return () => clearInterval(interval);
  }, []);

  return (
    <TextWrapper weight="medium" style={{ fontSize: 18, color: "#6F6F6F", minWidth: 34, letterSpacing: 1.5 }}>
      {".".repeat(count)}
    </TextWrapper>
  );
});

const ChatMessageBubble = memo(function ChatMessageBubble({ msg }: { msg: Message }) {
  return (
    <View
      style={{
        alignSelf: msg.isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        maxWidth: "85%",
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {!msg.isUser && <ThomoAvatarIcon size={28} />}
      <View
        style={{
          backgroundColor: msg.isUser ? "#F4F4F5" : "#1A1A1A",
          borderRadius: 18,
          borderBottomRightRadius: msg.isUser ? 4 : 18,
          borderBottomLeftRadius: !msg.isUser ? 4 : 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 44,
          justifyContent: "center",
        }}
      >
        {msg.isTyping ? (
          <TypingDots />
        ) : (
          <TextWrapper
            weight="regular"
            style={{
              fontSize: 15,
              color: msg.isUser ? "#1A1A1A" : "#FFFFFF",
              lineHeight: 22,
            }}
          >
            {msg.text}
          </TextWrapper>
        )}
      </View>
    </View>
  );
});

const HistoryRow = memo(function HistoryRow({
  item,
  onPress,
  onDelete,
}: {
  item: Conversation;
  onPress: () => void;
  onDelete: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={36}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          onPress={() => {
            swipeRef.current?.close();
            onDelete();
          }}
          style={{
            width: 72,
            marginVertical: 3,
            borderRadius: 12,
            backgroundColor: "#EF4444",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrashIcon />
        </Pressable>
      )}
    >
      <Pressable onPress={onPress} style={{ paddingVertical: 10, width: "100%" }}>
        <TextWrapper
          weight="regular"
          numberOfLines={1}
          style={{ fontSize: 15, color: "#737373", lineHeight: 22 }}
        >
          {item.title ?? "New conversation"}
        </TextWrapper>
      </Pressable>
    </Swipeable>
  );
});

export default function ThomoChatScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const sidebarWidth = screenWidth * 0.82;
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const sidebarTranslateX = useRef(new RNAnimated.Value(sidebarWidth)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    fetchConversations()
      .then((data) => setConversations(data))
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        setConversations(DUMMY_CONVERSATIONS);
      });
  }, []);

  useEffect(() => {
    if (!sidebarMounted) {
      sidebarTranslateX.setValue(sidebarWidth);
    }
  }, [sidebarMounted, sidebarTranslateX, sidebarWidth]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages]);

  const toggleSidebar = useCallback(
    (open: boolean, afterClose?: () => void) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      sidebarTranslateX.stopAnimation();
      overlayOpacity.stopAnimation();

      const config = {
        duration: 400,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      };

      if (open) {
        Keyboard.dismiss();
        setSidebarMounted(true);
        sidebarTranslateX.setValue(sidebarWidth);
        overlayOpacity.setValue(0);
        RNAnimated.parallel([
          RNAnimated.timing(sidebarTranslateX, {
            toValue: 0,
            ...config,
            useNativeDriver: true,
          }),
          RNAnimated.timing(overlayOpacity, {
            toValue: 1,
            ...config,
            useNativeDriver: true,
          }),
        ]).start();
        return;
      }

      RNAnimated.parallel([
        RNAnimated.timing(sidebarTranslateX, {
          toValue: sidebarWidth,
          ...config,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayOpacity, {
          toValue: 0,
          ...config,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSidebarMounted(false);
        setSearchText("");
        afterClose?.();
      });
    },
    [overlayOpacity, sidebarTranslateX, sidebarWidth],
  );

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConversationId(convId);
    try {
      const msgs = await fetchMessages(convId);
      setMessages(
        msgs.map((message) => ({
          id: message.id,
          text: message.content,
          isUser: message.role === "user",
        })),
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([
        { id: "m1", text: "Hello! I'm Thomo, your AI CFO.", isUser: false },
        { id: "m2", text: "I can help you with your expense analysis or tax questions.", isUser: false },
        { id: "m3", text: "What's on your mind today?", isUser: false },
      ]);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInputText("");
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const text = inputText.trim();
    const userMsg: Message = { id: `user-${Date.now()}`, text, isUser: true };
    setInputText("");
    setSending(true);

    if (isInvoiceIntent(text)) {
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `invoice-route-${Date.now()}`,
          text: "I'll open the invoice flow so we can choose a client, create the draft, and review the professional template.",
          isUser: false,
        },
      ]);
      setSending(false);
      setTimeout(() => router.push("/thomo-invoice-chat"), 650);
      return;
    }

    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: typingId, text: "", isUser: false, isTyping: true }]);

    try {
      let convId = activeConversationId;
      if (!convId) {
        const conv = await createConversation();
        convId = conv.id;
        setActiveConversationId(convId);
      }

      const reply = await sendMessage(convId, text);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === typingId
            ? { id: reply.id, text: reply.content, isUser: false }
            : message,
        ),
      );
      fetchConversations().then(setConversations).catch(() => {});
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === typingId
            ? { id: `error-${Date.now()}`, text: "Sorry, something went wrong. Please try again.", isUser: false }
            : message,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const handleHistoryTap = (conv: Conversation) => {
    toggleSidebar(false, () => {
      setInputText("");
      loadConversation(conv.id);
    });
  };

  const handleDeleteConversation = useCallback(
    async (conv: Conversation) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const previous = conversations;
      setConversations((current) => current.filter((item) => item.id !== conv.id));
      if (activeConversationId === conv.id) {
        startNewChat();
      }

      try {
        await deleteConversation(conv.id);
      } catch (err) {
        console.error("Failed to delete conversation:", err);
        setConversations(previous);
      }
    },
    [activeConversationId, conversations, startNewChat],
  );

  const filteredHistory = useMemo(() => {
    const groups = groupConversations(conversations);
    const query = searchText.trim().toLowerCase();
    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (item.title ?? "").toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [conversations, searchText]);

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => <ChatMessageBubble msg={item} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            paddingTop: Math.max(insets.top, 16) + 20,
            paddingBottom: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#F5F5F5",
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={12}
            style={{
              position: "absolute",
              left: 20,
              bottom: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F9F9F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeftIcon size={20} color="#1A1A1A" strokeWidth={2.5} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <TextWrapper weight="bold" style={{ fontSize: 17, color: "#1A1A1A" }}>
              Thomo AI
            </TextWrapper>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E", marginRight: 4 }} />
              <TextWrapper weight="medium" style={{ fontSize: 11, color: "#71717A" }}>
                Online
              </TextWrapper>
            </View>
          </View>
          <Pressable
            onPress={() => toggleSidebar(true)}
            hitSlop={12}
            style={{
              position: "absolute",
              right: 20,
              bottom: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F9F9F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuIcon size={20} />
          </Pressable>
        </View>

        {messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
          }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <View
            style={{
              backgroundColor: "#F5F5F5",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 14,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Analyze my expenses..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              style={{
                fontSize: 15,
                color: "#1A1A1A",
                fontFamily: "NeueMontreal-Regular",
                paddingVertical: 0,
                marginBottom: 12,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <GlobeIcon size={20} />
                <AttachIcon size={20} />
                <MicIcon size={20} />
              </View>
              <Pressable
                onPress={handleSend}
                disabled={sending || !inputText.trim()}
                hitSlop={8}
                style={{
                  opacity: sending || !inputText.trim() ? 0.45 : 1,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: "#1A1A1A",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SendArrowIcon />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {sidebarMounted ? (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} pointerEvents="box-none">
          <RNAnimated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(255,255,255,0.78)",
              opacity: overlayOpacity,
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => toggleSidebar(false)} />
          </RNAnimated.View>

          <RNAnimated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: sidebarWidth,
              backgroundColor: "#F8F8F6",
              paddingTop: insets.top,
              transform: [{ translateX: sidebarTranslateX }],
              shadowColor: "#171717",
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: Platform.OS === "ios" ? 20 : 40,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#E8E8E8",
                marginBottom: 10,
              }}
            >
              <Image
                source={require("../assets/images/logo.png")}
                style={{ width: 42, height: 42, borderRadius: 12 }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <TextWrapper weight="bold" style={{ fontSize: 22, color: "#171717", marginTop: 14 }}>
                Thomo AI
              </TextWrapper>
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}
              >
                <MessageIcon />
                <TextWrapper weight="regular" style={{ fontSize: 17, color: "#171717", lineHeight: 24 }}>
                  Chats
                </TextWrapper>
              </Pressable>
              <Pressable
                onPress={() => {
                  startNewChat();
                  toggleSidebar(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <NewChatIcon />
                <TextWrapper weight="regular" style={{ fontSize: 17, color: "#171717", lineHeight: 24 }}>
                  New chat
                </TextWrapper>
              </Pressable>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <SearchIcon />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search"
                  placeholderTextColor="#8C8C8C"
                  style={{
                    flex: 1,
                    fontSize: 17,
                    color: "#171717",
                    fontFamily: "NeueMontreal-Regular",
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>

            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => item.label}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 24) }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <TextWrapper
                  weight="regular"
                  style={{ fontSize: 14, color: "#9A9A9A", marginBottom: 8, lineHeight: 20 }}
                >
                  Recents
                </TextWrapper>
              }
              renderItem={({ item: group }) => (
                <View>
                  <TextWrapper
                    weight="regular"
                    style={{ fontSize: 12, color: "#B2B2B2", marginTop: 10, marginBottom: 4 }}
                  >
                    {group.label}
                  </TextWrapper>
                  {group.items.map((item) => (
                    <HistoryRow
                      key={item.id}
                      item={item}
                      onPress={() => handleHistoryTap(item)}
                      onDelete={() => void handleDeleteConversation(item)}
                    />
                  ))}
                </View>
              )}
            />
          </RNAnimated.View>
        </View>
      ) : null}
    </View>
  );
}
