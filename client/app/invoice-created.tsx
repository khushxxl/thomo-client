import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import * as Haptics from "expo-haptics";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between" style={{ paddingVertical: 12 }}>
      <TextWrapper weight="regular" style={{ fontSize: 15, color: "#999" }}>
        {label}
      </TextWrapper>
      <TextWrapper weight="medium" style={{ fontSize: 15, color: "#1A1A1A" }}>
        {value}
      </TextWrapper>
    </View>
  );
}

export default function InvoiceCreatedScreen() {
  const params = useLocalSearchParams<{
    clientName: string;
    amount: string;
    status: string;
  }>();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
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
              {params.clientName || "Invoice Details"}
            </TextWrapper>
          </View>
        </View>

        {/* Status badge */}
        <View className="items-center mt-4">
          <View
            style={{
              backgroundColor: "rgba(0, 162, 129, 0.1)",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 13, color: "#00A281" }}>
              Paid
            </TextWrapper>
          </View>
        </View>

        {/* Amount */}
        <View className="items-center mt-6">
          <TextWrapper weight="medium" style={{ fontSize: 46, color: "#1A1A1A" }}>
            {params.amount || "£437.60"}
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 6 }}>
            3 Invoices Paid
          </TextWrapper>
        </View>

        {/* Details card */}
        <View
          className="mx-5 mt-10 rounded-2xl bg-[#F9F9F9]"
          style={{ paddingHorizontal: 18, paddingVertical: 4 }}
        >
          <DetailRow label="Invoice number" value="#Invoice 0028" />
          <DetailRow label="Person name" value={params.clientName || "Normal Kyne"} />
          <DetailRow label="Company" value="AirAsia" />
          <DetailRow label="Invoice date" value="17 March 2020" />
          <DetailRow label="Viewed" value="19 March 2020" />
          <DetailRow label="Income tax" value="$15.00" />
          <DetailRow label="Total Due" value="$920.00" />
        </View>

        {/* Download PDF card */}
        <View
          className="mx-5 mt-3 rounded-2xl bg-[#F9F9F9]"
          style={{ paddingHorizontal: 18, paddingVertical: 14 }}
        >
          <View className="flex-row items-center justify-between">
            <TextWrapper weight="regular" style={{ fontSize: 15, color: "#999" }}>
              Invoice #8821
            </TextWrapper>
            <TextWrapper weight="medium" style={{ fontSize: 15, color: "#1A1A1A" }}>
              Download PDF
            </TextWrapper>
          </View>
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View
        className="flex-row"
        style={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={{
            flex: 1,
            borderWidth: 1.5,
            borderColor: "#1A1A1A",
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1A1A1A" }}>
            Edit Invoice
          </TextWrapper>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={{
            flex: 1,
            backgroundColor: "#1A1A1A",
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#fff" }}>
            Send Email
          </TextWrapper>
        </Pressable>
      </View>
    </View>
  );
}
