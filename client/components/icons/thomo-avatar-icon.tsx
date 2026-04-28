import { View } from "react-native";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";

export function ThomoAvatarIcon({ size = 32 }: { size?: number }) {
  const scale = size / 32;

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          position: "absolute",
        }}
      />
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Path
          d="M12.7459 15.7997H11.1478V19.6064C11.1478 20.6478 11.5249 20.6478 12.7459 20.6478V22.8025C12.2251 22.9102 11.7762 23 10.9682 23C8.8674 23 8.27486 21.8867 8.27486 19.8218V15.7997H7V13.645H8.27486V11.0773H11.1478V13.645H12.7459V15.7997Z"
          fill="white"
        />
        <Path
          d="M19.9207 13.3577C21.86 13.3577 23.063 14.5249 23.063 16.6257V22.8384H20.1901V17.5414C20.1901 16.1588 19.7412 15.692 18.6997 15.692C17.784 15.692 17.0299 16.2486 17.0299 17.5235V22.8384H14.1569V10H17.0299V14.9738H17.0658C17.5506 14.1298 18.4484 13.3577 19.9207 13.3577Z"
          fill="white"
        />
        <Path
          d="M26.157 23C25.2951 23 24.6308 22.4075 24.6308 21.4738C24.6308 20.558 25.2951 19.9475 26.157 19.9475C27.0009 19.9475 27.6833 20.558 27.6833 21.4738C27.6833 22.4075 27.0009 23 26.157 23Z"
          fill="white"
        />
      </Svg>
    </View>
  );
}
