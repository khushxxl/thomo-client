import { View } from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { TextWrapper } from "./text-wrapper";
import { Image } from "expo-image";
import { Icon } from "./ai-insights/shared";

export function CalendarIcon({ size = 18, color = "#000000" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x={2.5}
        y={4}
        width={15}
        height={13}
        rx={2}
        stroke={color}
        strokeWidth={1.25}
      />
      <Line x1={2.5} y1={8} x2={17.5} y2={8} stroke={color} strokeWidth={1.25} />
      <Line
        x1={6.5}
        y1={2.5}
        x2={6.5}
        y2={5.5}
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Line
        x1={13.5}
        y1={2.5}
        x2={13.5}
        y2={5.5}
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 4V16M4 10H16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DocIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={2}
        width={16}
        height={20}
        rx={2}
        stroke="#999"
        strokeWidth={1.5}
      />
      <Path
        d="M8 7H16M8 11H16M8 15H12"
        stroke="#999"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ThomoSmallIcon({ size = 28 }: { size?: number }) {
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
     <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: 32, height: 32, borderRadius: 8 }}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
    </View>
  );
}
export function EyeIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


export function CategoryIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M13.963 1.667H6.038c-.966 0-1.449 0-1.839.136a2.542 2.542 0 00-1.567 1.613c-.132.402-.132.898-.132 1.892v11.67c0 .715.82 1.095 1.34.62a.788.788 0 011.07 0l.402.369a1.38 1.38 0 001.875 0 1.381 1.381 0 011.875 0 1.38 1.38 0 001.876 0 1.381 1.381 0 011.874 0 1.38 1.38 0 001.876 0l.402-.369a.788.788 0 011.07 0c.52.475 1.34.095 1.34-.62V5.308c0-.994 0-1.491-.132-1.891a2.54 2.54 0 00-1.567-1.614c-.39-.136-.873-.136-1.838-.136z"
        stroke={color}
        strokeWidth={1.25}
      />
      <Path
        d="M8.749 9.167h5.416m-8.333 0h.417M5.832 6.25h.417m-.417 5.834h.417m2.5-5.834h5.416M8.75 12.084h5.416"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GraphIcon({ size = 20, color = "#171717" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M2.5 12.917l3.214-2.678c1.362-1.135 2.257-1.018 3.433.158l.005.005c1.281 1.281 2.2 1.228 3.476.11L17.5 6.25"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 17.5H7.833c-1.866 0-2.8 0-3.513-.363a3.333 3.333 0 01-1.457-1.457c-.363-.713-.363-1.647-.363-3.513V2.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatTriangleIcon({ size = 10, color = "#171717" }: { size?: number; color?: string }) {
  return (
     <Svg
      width={size}
      height={size}
      viewBox="0 0 12 13"
      fill="none"
    >
      <Path
        d="M8.776 7.166c1.695-1.895 2.718-6.75 2.718-6.75H1.969s.829 1.2.829 5.25c0 2.429-2.104 6.75-2.104 6.75s3.656-.3 8.082-5.25z"
        fill="#1F1F1F"
        stroke="#1F1F1F"
        strokeWidth={0.832174}
      />
    </Svg>
  );
}

export function ManualIcon({ size = 20 }: { size?: number }) {
  return (
   <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      
    >
      <Path
        d="M8 18h8m-8-4h4m-8 7.4V2.6a.6.6 0 01.6-.6h11.652a.6.6 0 01.424.176l3.148 3.148A.6.6 0 0120 5.75V21.4a.6.6 0 01-.6.6H4.6a.6.6 0 01-.6-.6z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 2v3.4a.6.6 0 00.6.6H20"
        stroke="#000"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DisconnectIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.597 3.322c-1.873-1.763-4.903-1.763-6.773 0L8.679 5.34l1.129 1.062 2.145-2.019c1.19-1.12 3.2-1.24 4.515 0 1.317 1.24 1.19 3.13 0 4.25l-2.145 2.02 1.131 1.064L17.6 9.7c1.868-1.762 1.868-4.614-.002-6.377zM9.051 15.618c-1.19 1.121-3.2 1.24-4.516 0-1.317-1.24-1.19-3.129 0-4.25L6.68 9.35 5.55 8.285l-2.146 2.018c-1.872 1.763-1.872 4.615 0 6.376 1.873 1.76 4.903 1.762 6.774 0l2.144-2.019-1.128-1.063-2.143 2.021zM4.929 3.697a.184.184 0 00-.125-.048.184.184 0 00-.125.048l-.876.825a.162.162 0 00-.052.118c0 .044.019.086.052.117l12.271 11.551a.186.186 0 00.25 0l.877-.825a.16.16 0 000-.236L4.929 3.697z"
        fill="#1F1F1F"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.26 17l4.116-4.116a1.254 1.254 0 000-1.768L9.26 7"
        stroke="#1F1F1F"
        strokeOpacity={0.6}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M15.714 2.286a2.685 2.685 0 00-3.795 0L2.955 11.25c-.305.305-.519.688-.619 1.107l-.821 3.452a.562.562 0 00.678.677l3.45-.822c.42-.1.804-.314 1.109-.619l8.962-8.962a2.685 2.685 0 000-3.795m-3 .795a1.56 1.56 0 012.205 2.205l-.669.666-2.205-2.204.669-.667zM11.25 4.547l2.205 2.203-7.5 7.5a1.204 1.204 0 01-.572.32l-2.562.61.61-2.562c.051-.217.162-.415.32-.573l7.499-7.498z"
        fill="#1F1F1F"
      />
    </Svg>
  );
}

export function BankIcon({ size = 20 }: { size?: number }) {
  return (
     <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M17.142 15.655V8.441a1.418 1.418 0 001.322-1.065 1.4 1.4 0 00-.666-1.6l-7.09-4.09a1.446 1.446 0 00-1.417 0l-7.09 4.09a1.399 1.399 0 00-.665 1.6 1.418 1.418 0 001.38 1.065h.123v7.204h-.114a1.428 1.428 0 000 2.855h14.15a1.427 1.427 0 00.067-2.845zM2.916 7.49a.48.48 0 01-.238-.895l7.089-4.081a.447.447 0 01.466 0l7.094 4.081a.476.476 0 01-.238.895H2.916zm13.274.951v7.204h-3.43V8.44h3.43zm-4.387 0v7.204H8.368V8.44h3.435zm-4.387 0v7.204H3.991V8.44h3.425zm9.659 9.107H2.925a.476.476 0 110-.952h14.15a.476.476 0 010 .952z"
        fill="#1F1F1F"
      />
    </Svg>
  );
}

export function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.97 8.222V6.444C6.97 3.99 8.065 2 10.5 2s3.53 1.99 3.53 4.444v1.778M3 15.156v-4.09c0-.995 0-1.493.192-1.872.17-.335.44-.607.772-.778.377-.193.871-.193 1.86-.193h9.353c.988 0 1.482 0 1.86.193.332.17.602.442.77.777.193.38.193.878.193 1.874v4.089c0 .995 0 1.493-.192 1.873a1.77 1.77 0 01-.771.777c-.378.194-.872.194-1.86.194H5.824c-.989 0-1.483 0-1.86-.194a1.771 1.771 0 01-.772-.777C3 16.65 3 16.152 3 15.156z"
        stroke="#1F1F1F"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DeleteIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.906 5.178l1.76 10.635a2.083 2.083 0 002.056 1.744h2.79m5.581-12.38l-1.76 10.636a2.083 2.083 0 01-2.055 1.744h-2.79M8.352 9.264v4.207m3.296-4.207v4.207M2.292 5.178h15.416m-5.394 0V3.694a1.25 1.25 0 00-1.25-1.25H8.936a1.25 1.25 0 00-1.25 1.25v1.484h4.628z"
        stroke="#1F1F1F"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LogoutIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.546 1.042c1.14 0 2.058 0 2.78.097.75.1 1.382.317 1.884.818.437.437.658.975.774 1.606.113.615.134 1.365.14 2.267a.625.625 0 11-1.25.007c-.006-.911-.029-1.557-.119-2.048-.087-.471-.227-.746-.43-.948-.23-.23-.554-.38-1.166-.463-.629-.085-1.463-.086-2.659-.086h-.833c-1.197 0-2.031.001-2.66.086-.612.082-.935.233-1.167.463-.23.23-.38.554-.462 1.167-.085.628-.086 1.463-.086 2.659v6.666c0 1.196 0 2.03.086 2.66.082.612.232.935.463 1.166.23.231.554.381 1.166.464.629.084 1.463.085 2.66.085H7.5c1.196 0 2.03-.001 2.66-.085.61-.083.935-.234 1.166-.464.202-.203.342-.476.43-.948.09-.49.112-1.137.117-2.048a.623.623 0 01.629-.621.627.627 0 01.621.628c-.005.902-.026 1.653-.139 2.267-.116.631-.337 1.169-.775 1.606-.5.502-1.133.717-1.883.819-.722.096-1.64.096-2.78.096H6.62c-1.14 0-2.058 0-2.78-.096-.75-.102-1.383-.317-1.884-.819-.502-.501-.717-1.133-.819-1.883-.096-.722-.096-1.642-.096-2.78V6.62c0-1.138 0-2.057.096-2.78.101-.75.317-1.382.819-1.883.501-.502 1.133-.717 1.883-.818.723-.097 1.642-.097 2.78-.097h.926z"
        fill="#F02E24"
      />
      <Path
        d="M7.5 9.375a.625.625 0 000 1.25h9.144l-1.634 1.4a.625.625 0 10.813.95l2.917-2.5a.625.625 0 000-.95l-2.917-2.5a.626.626 0 00-.813.95l1.633 1.4H7.5z"
        fill="#F02E24"
      />
    </Svg>
  );
}

    