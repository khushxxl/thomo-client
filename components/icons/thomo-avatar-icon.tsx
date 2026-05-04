import { View } from "react-native";
import { Image } from "expo-image";

export function ThomoAvatarIcon({ size = 32 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </View>
  );
}
