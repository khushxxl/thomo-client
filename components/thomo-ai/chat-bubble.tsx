import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { TextWrapper } from "@/components/text-wrapper";
import { ChatTriangleIcon } from "@/components/icons";

interface ThomoAiBubbleProps {
  text: string;
  loadingText?: string;
  showAvatar?: boolean;
  isTyping?: boolean;
  animateText?: boolean;
}

function TypingDots() {
  const dotOne = useRef(new Animated.Value(0.35)).current;
  const dotTwo = useRef(new Animated.Value(0.35)).current;
  const dotThree = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(360 - delay),
        ]),
      );

    const animation = Animated.parallel([
      createPulse(dotOne, 0),
      createPulse(dotTwo, 120),
      createPulse(dotThree, 240),
    ]);

    animation.start();
    return () => animation.stop();
  }, [dotOne, dotThree, dotTwo]);

  return (
    <View style={styles.typingRow}>
      <TextWrapper weight="medium" style={styles.typingText}>
        Typing
      </TextWrapper>
      <View style={styles.dotsRow}>
        {[dotOne, dotTwo, dotThree].map((opacity, index) => (
          <Animated.View key={index} style={[styles.dot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

export function ThomoAiBubble({
  text,
  loadingText,
  showAvatar = true,
  isTyping = false,
  animateText = false,
}: ThomoAiBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const showTyping = isTyping || text.trim().length === 0;

  useEffect(() => {
    if (showTyping) {
      setDisplayedText("");
      return;
    }

    if (!animateText) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const nextCharacter = text.charAt(index);
        setDisplayedText((prev) => prev + nextCharacter);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [animateText, showTyping, text]);

  return (
    <View style={styles.container}>
      {showAvatar && (
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            contentFit="contain"
          />
        </View>
      )}
      
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, showTyping && styles.typingBubble]}>
          {showTyping ? (
            <TypingDots />
          ) : (
            <TextWrapper weight="medium" style={styles.text}>
              {displayedText}
            </TextWrapper>
          )}
          
          {!showTyping && loadingText && (
            <TextWrapper 
              weight="regular" 
              style={[
                styles.loadingText, 
                !displayedText && { marginTop: 0 }
              ]}
            >
              {loadingText}
            </TextWrapper>
          )}
        </View>
        
        <View style={styles.triangleContainer}>
          <ChatTriangleIcon size={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
    maxWidth: "85%",
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  bubbleWrapper: {
    flexShrink: 1,
    position: "relative",
    marginBottom: 20,
    maxWidth: "100%",
  },
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1F1F1F",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  typingBubble: {
    borderRadius: 18,
    minWidth: 88,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    color: "#FFFFFFB2",
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 15,
    color: "#838383",
    marginTop: 12,
  },
  triangleContainer: {
    position: "absolute",
    bottom: -10,
    left: 10,
    zIndex: -1,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typingText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFFFFF",
  },
});
