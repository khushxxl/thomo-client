import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { ThomoAvatarIcon } from "@/components/icons/thomo-avatar-icon";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle, Line } from "react-native-svg";
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
  type Conversation,
  type ChatMessage,
} from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

interface HistoryGroup {
  label: string;
  items: Conversation[];
}

function groupConversations(conversations: Conversation[]): HistoryGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);

  const groups: Record<string, Conversation[]> = {};

  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    let label: string;
    if (d >= today) label = "Today";
    else if (d >= yesterday) label = "Yesterday";
    else label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Line x1={3} y1={6} x2={19} y2={6} stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={3} y1={11} x2={19} y2={11} stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={3} y1={16} x2={19} y2={16} stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx={8} cy={8} r={6} stroke="#999" strokeWidth={1.5} />
      <Path d="M12.5 12.5L16 16" stroke="#999" strokeWidth={1.5} strokeLinecap="round" />
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

export default function ThomoChatScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const drawerAnim = useRef(new RNAnimated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  // Load conversation history on mount
  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch((err) => console.error("Failed to load conversations:", err));
  }, []);

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConversationId(convId);
    try {
      const msgs = await fetchMessages(convId);
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          text: m.content,
          isUser: m.role === "user",
        })),
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
    RNAnimated.parallel([
      RNAnimated.spring(drawerAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }),
      RNAnimated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    RNAnimated.parallel([
      RNAnimated.spring(drawerAnim, {
        toValue: DRAWER_WIDTH,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }),
      RNAnimated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
      setSearchText("");
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    // Add user message to UI immediately
    const userMsg: Message = { id: `user-${Date.now()}`, text, isUser: true };
    setMessages((prev) => [...prev, userMsg]);

    // Show typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: "", isUser: false, isTyping: true },
    ]);

    try {
      // Create conversation if this is the first message
      let convId = activeConversationId;
      if (!convId) {
        const conv = await createConversation();
        convId = conv.id;
        setActiveConversationId(convId);
      }

      // Send message and get AI response
      const reply = await sendMessage(convId, text);

      // Replace typing indicator with real response
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== typingId);
        return [
          ...withoutTyping,
          { id: reply.id, text: reply.content, isUser: false },
        ];
      });

      // Refresh conversation list
      fetchConversations()
        .then(setConversations)
        .catch(() => {});
    } catch (err) {
      console.error("Send failed:", err);
      // Remove typing indicator and show error
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== typingId);
        return [
          ...withoutTyping,
          {
            id: `error-${Date.now()}`,
            text: "Sorry, something went wrong. Please try again.",
            isUser: false,
          },
        ];
      });
    } finally {
      setSending(false);
    }
  };

  const handleHistoryTap = (conv: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeDrawer();
    loadConversation(conv.id);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const historyGroups = groupConversations(conversations);

  const filteredHistory = searchText.trim()
    ? historyGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            (item.title ?? "").toLowerCase().includes(searchText.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0)
    : historyGroups;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={{ paddingTop: 70, paddingBottom: 16, paddingHorizontal: 20 }}>
          <View className="flex-row items-center justify-center" style={{ position: "relative" }}>
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={{ position: "absolute", left: 0 }}
            >
              <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.5} />
            </Pressable>
            <TextWrapper weight="medium" style={{ fontSize: 17, color: "#1A1A1A" }}>
              Thomo Chat
            </TextWrapper>
            <Pressable
              onPress={openDrawer}
              hitSlop={12}
              style={{ position: "absolute", right: 0 }}
            >
              <MenuIcon size={22} />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View className="items-center" style={{ paddingBottom: 60 }}>
              <Image
                source={require("../assets/images/logo.png")}
                style={{ width: 64, height: 64, borderRadius: 16 }}
              />
              <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1A1A1A", marginTop: 12 }}>
                Hey, I'm Thomo
              </TextWrapper>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 4, textAlign: "center" }}>
                Your AI CFO. Ask me anything about your finances.
              </TextWrapper>
            </View>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.isUser ? "flex-end" : "flex-start",
                marginBottom: 12,
                maxWidth: "80%",
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              {!msg.isUser && <ThomoAvatarIcon size={28} />}
              <View
                style={{
                  backgroundColor: msg.isUser ? "#F0F0F0" : "#1A1A1A",
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                {msg.isTyping ? (
                  <TextWrapper weight="regular" style={{ fontSize: 15, color: "#999" }}>
                    ...
                  </TextWrapper>
                ) : (
                  <TextWrapper
                    weight="regular"
                    style={{
                      fontSize: 15,
                      color: msg.isUser ? "#1A1A1A" : "#fff",
                      lineHeight: 21,
                    }}
                  >
                    {msg.text}
                  </TextWrapper>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12 }}>
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
              style={{
                fontSize: 15,
                color: "#1A1A1A",
                fontFamily: "NeueMontreal-Regular",
                paddingVertical: 0,
                marginBottom: 12,
              }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 16 }}>
                <GlobeIcon size={20} />
                <AttachIcon size={20} />
                <MicIcon size={20} />
              </View>
              <Pressable onPress={handleSend} hitSlop={8}>
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

      {/* History Drawer Overlay */}
      {drawerOpen && (
        <RNAnimated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            opacity: overlayAnim,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </RNAnimated.View>
      )}

      {/* History Drawer */}
      <RNAnimated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: "#fff",
          transform: [{ translateX: drawerAnim }],
          shadowColor: "#000",
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: 70, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search */}
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                gap: 8,
              }}
            >
              <SearchIcon size={18} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search"
                placeholderTextColor="#999"
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: "#1A1A1A",
                  fontFamily: "NeueMontreal-Regular",
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>

          {/* New Chat button */}
          <Pressable
            onPress={() => {
              startNewChat();
              closeDrawer();
            }}
            style={{
              marginHorizontal: 16,
              marginBottom: 16,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: "#1A1A1A",
              alignItems: "center",
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 14, color: "#fff" }}>
              New Chat
            </TextWrapper>
          </Pressable>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#F0F0F0" }} />

          {/* History groups */}
          {filteredHistory.map((group) => (
            <View key={group.label}>
              <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
                <TextWrapper weight="regular" style={{ fontSize: 13, color: "#999" }}>
                  {group.label}
                </TextWrapper>
              </View>
              {group.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleHistoryTap(item)}
                  style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                >
                  <TextWrapper
                    weight="regular"
                    style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 22 }}
                  >
                    {item.title ?? "New conversation"}
                  </TextWrapper>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </RNAnimated.View>
    </View>
  );
}
