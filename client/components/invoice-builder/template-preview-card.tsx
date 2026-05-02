import { View } from "react-native";
import type { InvoiceTemplateId } from "@/lib/invoice-draft";

function StubLine({
  width,
  height = 7,
  dark = false,
}: {
  width: number | `${number}%`;
  height?: number;
  dark?: boolean;
}) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 999,
        backgroundColor: dark ? "#171717" : "#E6E6E6",
      }}
    />
  );
}

function MiniInvoice() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ gap: 4 }}>
          <StubLine width={80} height={6} dark />
          <StubLine width={120} height={4} />
        </View>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#F4F4F5" }} />
      </View>

      <View style={{ marginTop: 24, gap: 12 }}>
        <View style={{ gap: 4 }}>
          <StubLine width={50} height={5} dark />
          <StubLine width="30%" height={4} />
        </View>

        <View style={{ marginTop: 12 }}>
          <View style={{ height: 1, backgroundColor: "#F4F4F5", marginBottom: 8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <StubLine width={60} height={5} dark />
            <StubLine width={40} height={5} dark />
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <StubLine width="40%" height={4} />
              <StubLine width={30} height={4} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <StubLine width="35%" height={4} />
              <StubLine width={30} height={4} />
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: "auto", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F4F4F5" }}>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <StubLine width={50} height={4} />
          <StubLine width={80} height={7} dark />
        </View>
      </View>
    </View>
  );
}

export function TemplatePreviewCard({ templateId }: { templateId: InvoiceTemplateId }) {
  void templateId;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 4,
      }}
    >
      <MiniInvoice />
    </View>
  );
}
