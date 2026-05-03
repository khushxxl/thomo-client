import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { TextWrapper } from "@/components/text-wrapper";
import { ChatTriangleIcon } from "@/components/icons";

interface ThomoAiBubbleProps {
  text: string;
  loadingText?: string;
  showAvatar?: boolean;
}

export function ThomoAiBubble({ text, loadingText, showAvatar = true }: ThomoAiBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.container}>
      {showAvatar && (
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 32, height: 32, borderRadius: 8 }}
            contentFit="contain"
          />
        </View>
      )}
      
      <View style={styles.bubbleWrapper}>
        <View style={styles.bubble}>
          <TextWrapper weight="medium" style={styles.text}>
            {displayedText}
          </TextWrapper>
          
          {loadingText && (
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
          <ChatTriangleIcon size={40} />
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
    flex: 1,
    position: "relative",
    marginBottom: 20,
  },
  bubble: {
    backgroundColor: "#1F1F1F",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  text: {
    fontSize: 16,
    color: "#FFFFFF",
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
});
