import React from "react";
import { View } from "react-native";
import { TextWrapper } from "@/components/text-wrapper";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";

export function EmptyInvoicesState({ activeTab }: { activeTab: string }) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: INVOICE_RADIUS.surface,
        paddingHorizontal: 18,
        paddingVertical: 28,
        alignItems: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
        No invoices here
      </TextWrapper>
      <TextWrapper
        weight="regular"
        style={{
          marginTop: 8,
          fontSize: 14,
          lineHeight: 20,
          color: "#8C8C92",
          textAlign: "center",
        }}
      >
        {activeTab === "All"
          ? "Create your first invoice to start tracking receivables."
          : `No ${activeTab.toLowerCase()} invoices right now.`}
      </TextWrapper>
    </View>
  );
}
