import { View } from "react-native";
import type { InvoiceTemplateId } from "@/lib/invoice-draft";
import { invoiceTemplateMeta } from "@/lib/invoice-templates";
import { TextWrapper } from "@/components/text-wrapper";


function BrandedPreview() {
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View>
        <View style={{ alignItems: "flex-end" }}>
          <TextWrapper weight="medium" style={{ fontSize: 12, color: "#050505" }}>
            #033
          </TextWrapper>
        </View>
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 11,
              backgroundColor: "#050505",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <TextWrapper weight="bold" style={{ fontSize: 16, color: "#FFFFFF" }}>
              .b
            </TextWrapper>
          </View>
          <TextWrapper weight="bold" style={{ fontSize: 26, color: "#050505" }}>
            Invoice
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 10, color: "#050505", marginTop: 8 }}>
            23rd April 2026
          </TextWrapper>
        </View>

        <View style={{ marginTop: 30 }}>
          <TextWrapper weight="bold" style={{ fontSize: 9, color: "#050505", letterSpacing: 0.5 }}>
            BILLED TO:
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 11, color: "#050505", marginTop: 6, lineHeight: 14 }}>
            Benjamin John{"\n"}
            Aether Agency{"\n"}
            45 Shoreditch High St, London
          </TextWrapper>
        </View>

        <View style={{ marginTop: 28 }}>
          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#050505",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <TextWrapper weight="regular" style={{ fontSize: 9, color: "#050505" }}>
              Item
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 9, color: "#050505" }}>
              Total
            </TextWrapper>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#050505",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 11, color: "#050505" }}>
              Website design sprint
            </TextWrapper>
            <TextWrapper weight="medium" style={{ fontSize: 11, color: "#050505" }}>
              £1,500
            </TextWrapper>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <TextWrapper weight="bold" style={{ fontSize: 9, color: "#050505" }}>
            Payment Information
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 8, color: "#050505", marginTop: 4, lineHeight: 10, opacity: 0.8 }}>
            Name: Karan{"\n"}
            IBAN: GB00...{"\n"}
            Swift/BIC: ...
          </TextWrapper>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <TextWrapper 
            weight="regular" 
            style={{ 
              fontSize: 11, 
              color: "#050505", 
              fontFamily: "Snell Roundhand",
              marginBottom: -2
            }}
          >
            khushaalchoithramani
          </TextWrapper>
          <TextWrapper weight="bold" style={{ fontSize: 10, color: "#050505" }}>
            Khushaal Choithramani
          </TextWrapper>
        </View>
      </View>
    </View>
  );
}


export function TemplatePreviewCard({ templateId }: { templateId: InvoiceTemplateId }) {
  const meta = invoiceTemplateMeta(templateId);

  return (
    <View
      style={{
        aspectRatio: 210 / 297,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: meta.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 14,
          backgroundColor: meta.surface,
          borderBottomWidth: 1,
          borderBottomColor: meta.border,
        }}
      >
        <TextWrapper weight="medium" style={{ fontSize: 13, color: meta.accent }}>
          {meta.name}
        </TextWrapper>
        <TextWrapper weight="regular" style={{ fontSize: 11, color: "#727783", marginTop: 4 }}>
          {meta.mood}
        </TextWrapper>
      </View>

      <View style={{ flex: 1, padding: 18, backgroundColor: "#FFFFFF" }}>
        <BrandedPreview />
      </View>
    </View>
  );
}
