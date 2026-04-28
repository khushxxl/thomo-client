import { type ReactNode } from "react";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 300, mass: 0.6 };

export function Pressable3D({
  children,
  style,
  className,
  onPress,
  shadowColor,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  shadowColor?: string;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    shadowOffset: { width: 0, height: 4 - translateY.value },
    shadowOpacity: 0.15 - translateY.value * 0.03,
    shadowRadius: 8 - translateY.value,
    shadowColor,
    elevation: 4 - translateY.value,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSpring(0.97, SPRING_CONFIG);
        translateY.value = withSpring(3, SPRING_CONFIG);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }}
      style={[animatedStyle, style]}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
}
