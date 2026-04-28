import { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle } from "react-native-svg";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

function ThomoAvatar({ size = 32 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 10, color: "#fff" }}>
        th.
      </TextWrapper>
    </View>
  );
}

function SendIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4L12 20M12 4L6 10M12 4L18 10"
        stroke="#1A1A1A"
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
      <Path
        d="M10 15V18.5"
        stroke="#999"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ThomoInvoiceChatScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setHasStarted(true);

    // Simulate Thomo typing then responding
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `typing-${Date.now()}`,
          text: "",
          isUser: false,
          isTyping: true,
        },
      ]);
    }, 500);

    setTimeout(() => {
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.isTyping);
        return [
          ...withoutTyping,
          {
            id: `reply-${Date.now()}`,
            text: `Got it. Invoice for John — £883 due Friday.`,
            isUser: false,
          },
        ];
      });

      // After a beat, show "Creating invoice for..." then navigate
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `creating-${Date.now()}`,
            text: "Creating invoice for...",
            isUser: false,
          },
        ]);

        setTimeout(() => {
          router.replace({
            pathname: "/invoice-created",
            params: {
              clientName: "Normal Kyne",
              amount: "£437.60",
              status: "paid",
            },
          });
        }, 1500);
      }, 1000);
    }, 2000);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{ paddingTop: 70, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View
          className="flex-row items-center justify-center"
          style={{ position: "relative" }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={{ position: "absolute", left: 0 }}
          >
            <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.5} />
          </Pressable>
          <TextWrapper
            weight="medium"
            style={{ fontSize: 17, color: "#1A1A1A" }}
          >
            Thomo Chat
          </TextWrapper>
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
            <ThomoAvatar size={48} />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: "#1A1A1A", marginTop: 12 }}
            >
              Create an invoice
            </TextWrapper>
            <TextWrapper
              weight="regular"
              style={{
                fontSize: 14,
                color: "#999",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Tell Thomo who to invoice and how much
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
              flexDirection: msg.isUser ? "row" : "row",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {!msg.isUser && <ThomoAvatar size={28} />}
            <View
              style={{
                backgroundColor: msg.isUser ? "#F0F0F0" : "#1A1A1A",
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              {msg.isTyping ? (
                <TextWrapper
                  weight="regular"
                  style={{ fontSize: 15, color: "#999" }}
                >
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
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 36,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View
            className="flex-row items-center"
            style={{ gap: 12, marginRight: 12 }}
          >
            <GlobeIcon size={20} />
            <AttachIcon size={20} />
            <MicIcon size={20} />
          </View>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Analyze my expenses..."
            placeholderTextColor="#999"
            style={{
              flex: 1,
              fontSize: 15,
              color: "#1A1A1A",
              fontFamily: "NeueMontreal-Regular",
              paddingVertical: 0,
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable onPress={handleSend} hitSlop={8} style={{ marginLeft: 8 }}>
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
              <SendIcon size={16} />
            </View>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
