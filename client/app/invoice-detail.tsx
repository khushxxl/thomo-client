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

const STATUS_CONFIG = {
  overdue: { label: "Overdue", color: "#F2A41B", bg: "rgba(242, 164, 27, 0.1)" },
  paid: { label: "Paid", color: "#00A281", bg: "rgba(0, 162, 129, 0.1)" },
  pending: { label: "Pending", color: "#F2A41B", bg: "rgba(242, 164, 27, 0.1)" },
};

export default function InvoiceDetailScreen() {
  const params = useLocalSearchParams<{
    clientName: string;
    amount: string;
    status: string;
    invoiceNumber: string;
    date: string;
  }>();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const status = (params.status || "pending") as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isPaid = status === "paid";

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
              {params.clientName || "Invoice"}
            </TextWrapper>
          </View>
        </View>

        {/* Status badge */}
        <View className="items-center mt-4">
          <View
            style={{
              backgroundColor: config.bg,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 13, color: config.color }}>
              {config.label}
            </TextWrapper>
          </View>
        </View>

        {/* Amount */}
        <View className="items-center mt-6">
          <TextWrapper weight="medium" style={{ fontSize: 46, color: "#1A1A1A" }}>
            {params.amount || "£0.00"}
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 6 }}>
            {isPaid ? "3 Invoices Paid" : "3 Invoices Unpaid"}
          </TextWrapper>
        </View>

        {/* Details card */}
        <View
          className="mx-5 mt-10 rounded-2xl bg-[#F9F9F9]"
          style={{ paddingHorizontal: 18, paddingVertical: 4 }}
        >
          <DetailRow label="Invoice Number" value={params.invoiceNumber || "#Invoice 0028"} />
          <DetailRow label="Person name" value={params.clientName || "—"} />
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

      {/* Bottom button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {isPaid ? (
          <Pressable
            style={{
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
        ) : (
          <Pressable
            style={{
              backgroundColor: "rgba(0, 162, 129, 0.1)",
              borderWidth: 1.5,
              borderColor: "#00A281",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 16, color: "#00A281" }}>
              Remainder Sent
            </TextWrapper>
          </Pressable>
        )}
      </View>
    </View>
  );
}
