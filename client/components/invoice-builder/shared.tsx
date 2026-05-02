import type { ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { TextWrapper } from "@/components/text-wrapper";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";

export function PlusIcon({ size = 16, color = "#171717" }: { size?: number; color?: string }) {
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

export function CalendarIcon({ size = 18, color = "#666B74" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5.5 2.75V5.25M14.5 2.75V5.25M3.25 7H16.75M4.5 4H15.5C16.605 4 17.5 4.895 17.5 6V15C17.5 16.105 16.605 17 15.5 17H4.5C3.395 17 2.5 16.105 2.5 15V6C2.5 4.895 3.395 4 4.5 4Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 16, color = "#8A8A8F" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6 6H14M7.5 6V15M10 6V15M12.5 6V15M5.5 6H14.5V16C14.5 16.552 14.052 17 13.5 17H6.5C5.948 17 5.5 16.552 5.5 16V6ZM8 3H12V6H8V3Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  editable = true,
  suffix,
  helper,
  autoCapitalize = "sentences",
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: TextInput["props"]["keyboardType"];
  editable?: boolean;
  suffix?: ReactNode;
  helper?: string;
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  error?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <TextWrapper
        weight="medium"
        style={{
          fontSize: 12,
          color: "#7B7B81",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </TextWrapper>
      <View
        style={{
          borderRadius: INVOICE_RADIUS.control,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: error ? "#FCA5A5" : "#ECECEC",
          minHeight: multiline ? 96 : 52,
          justifyContent: "center",
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          multiline={multiline}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize={autoCapitalize}
          textAlignVertical={multiline ? "top" : "center"}
          style={{
            minHeight: multiline ? 94 : 50,
            borderRadius: INVOICE_RADIUS.control,
            paddingHorizontal: 16,
            paddingVertical: multiline ? 14 : 0,
            paddingRight: suffix ? 96 : 16,
            fontSize: 16,
            color: editable ? "#171717" : "#666B74",
            fontFamily: "NeueMontreal-Regular",
          }}
        />
      </View>
      {suffix ? (
        <View
          pointerEvents="none"
          style={{ position: "absolute", right: 16, bottom: multiline ? 16 : 17 }}
        >
          {suffix}
        </View>
      ) : null}
      {error ? (
        <TextWrapper
          weight="regular"
          style={{ fontSize: 12, color: "#B91C1C", marginTop: 6 }}
        >
          {error}
        </TextWrapper>
      ) : helper ? (
        <TextWrapper
          weight="regular"
          style={{ fontSize: 12, color: "#8A8A8F", marginTop: 6 }}
        >
          {helper}
        </TextWrapper>
      ) : null}
    </View>
  );
}

export function DateField({
  label,
  value,
  onPress,
  helper,
  error,
}: {
  label: string;
  value: string;
  onPress: () => void;
  helper?: string;
  error?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <TextWrapper
        weight="medium"
        style={{
          fontSize: 12,
          color: "#7B7B81",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </TextWrapper>
      <Pressable
        onPress={onPress}
        style={{
          minHeight: 52,
          borderRadius: INVOICE_RADIUS.control,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: error ? "#FCA5A5" : "#ECECEC",
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextWrapper weight="regular" style={{ fontSize: 16, color: "#171717" }}>
          {value}
        </TextWrapper>
        <CalendarIcon />
      </Pressable>
      {error ? (
        <TextWrapper
          weight="regular"
          style={{ fontSize: 12, color: "#B91C1C", marginTop: 6 }}
        >
          {error}
        </TextWrapper>
      ) : helper ? (
        <TextWrapper
          weight="regular"
          style={{ fontSize: 12, color: "#8A8A8F", marginTop: 6 }}
        >
          {helper}
        </TextWrapper>
      ) : null}
    </View>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <TextWrapper weight="medium" style={{ fontSize: 18, color: "#171717" }}>
        {title}
      </TextWrapper>
      {subtitle ? (
        <TextWrapper
          weight="regular"
          style={{ fontSize: 14, color: "#8A8A8F", marginTop: 4 }}
        >
          {subtitle}
        </TextWrapper>
      ) : null}
    </View>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <View
      style={{
        borderRadius: INVOICE_RADIUS.surface,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 13, color: "#B91C1C" }}>
        {message}
      </TextWrapper>
    </View>
  );
}

export function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: strong ? 0 : 10,
      }}
    >
      <TextWrapper
        weight={strong ? "medium" : "regular"}
        style={{ fontSize: strong ? 16 : 14, color: strong ? "#171717" : "#8A8A8F" }}
      >
        {label}
      </TextWrapper>
      <TextWrapper
        weight="medium"
        style={{ fontSize: strong ? 18 : 14, color: "#171717" }}
      >
        {value}
      </TextWrapper>
    </View>
  );
}
