import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { TextWrapper } from "@/components/text-wrapper";
import { createInvoice, updateInvoice } from "@/lib/invoices";
import {
  buildInvoiceCreateInput,
  createEmptyInvoiceDraft,
  parseDecimal,
  type InvoiceCustomFieldDraft,
  type InvoiceDraft,
  type InvoiceLineItemDraft,
} from "@/lib/invoice-draft";
import { getErrorMessage } from "@/lib/api";
import { validateInvoiceDraft } from "@/lib/invoice-validation";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import { TemplateStep } from "@/components/invoice-builder/template-step";
import { FormStep } from "@/components/invoice-builder/form-step";
import { PreviewStep } from "@/components/invoice-builder/preview-step";

type Step = "template" | "form" | "preview";

function BackArrow({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke="#171717"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function parseDraftParam(
  raw?: string | string[],
): Partial<InvoiceDraft> | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  try {
    return JSON.parse(value) as Partial<InvoiceDraft>;
  } catch {
    return null;
  }
}

function lineItemValue(item: InvoiceLineItemDraft): number {
  return parseDecimal(item.quantity) * parseDecimal(item.unit_price);
}

function updateItem(
  draft: InvoiceDraft,
  id: string,
  patch: Partial<InvoiceLineItemDraft>,
): InvoiceDraft {
  return {
    ...draft,
    line_items: draft.line_items.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    ),
  };
}

function updateField(
  draft: InvoiceDraft,
  id: string,
  patch: Partial<InvoiceCustomFieldDraft>,
): InvoiceDraft {
  return {
    ...draft,
    custom_fields: draft.custom_fields.map((field) =>
      field.id === id ? { ...field, ...patch } : field,
    ),
  };
}

export default function CreateInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    draft?: string;
    source?: string;
  }>();
  const seeded = useMemo(() => parseDraftParam(params.draft), [params.draft]);
  const [step, setStep] = useState<Step>(params.id ? "form" : "template");
  const [draft, setDraft] = useState<InvoiceDraft>(() =>
    createEmptyInvoiceDraft(seeded ?? undefined),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const validation = useMemo(() => validateInvoiceDraft(draft), [draft]);
  const stepNumber = step === "template" ? 1 : step === "form" ? 2 : 3;

  const handleBack = () => {
    if (step === "preview") {
      setStep("form");
      return;
    }
    if (step === "form" && !params.id) {
      setStep("template");
      return;
    }
    router.back();
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const input = buildInvoiceCreateInput(draft);
      let invoice;

      if (params.id) {
        invoice = await updateInvoice(params.id, input);
      } else {
        invoice = await createInvoice(input);
      }

      router.replace({
        pathname: "/invoice-created",
        params: {
          id: invoice.id,
          state: "created",
        },
      });
    } catch (err) {
      console.error("Failed to save invoice:", err);
      setError(getErrorMessage(err, "Could not save invoice."));
      setSaving(false);
    }
  };

  const handleAdvanceFromForm = async () => {
    setShowValidation(true);
    setError(null);

    if (!validation.isValid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setStep("preview");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F5" }}>
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: 12,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: INVOICE_RADIUS.action,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              left: 0,
            }}
          >
            <BackArrow size={20} />
          </Pressable>
          <TextWrapper
            weight="regular"
            style={{ fontSize: 16, color: "#A3A3A3" }}
          >
            {stepNumber} of 3
          </TextWrapper>
        </View>
      </View>

      {error ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <TextWrapper
            weight="regular"
            style={{ fontSize: 14, color: "#DC2626" }}
          >
            {error}
          </TextWrapper>
        </View>
      ) : null}

      {step === "template" ? (
        <TemplateStep
          selectedTemplate={draft.template}
          onSelect={(template) => setDraft({ ...draft, template })}
          onNext={() => setStep("form")}
        />
      ) : null}

      {step === "form" ? (
        <FormStep
          draft={draft}
          setDraft={setDraft}
          onNext={() => void handleAdvanceFromForm()}
          updateItem={updateItem}
          updateField={updateField}
          lineItemValue={lineItemValue}
          validationMessage={validation.message}
          fieldErrors={validation.fields}
          showValidation={showValidation}
          canPreview={validation.isValid}
        />
      ) : null}

      {step === "preview" ? (
        <PreviewStep
          draft={draft}
          onEdit={() => setStep("form")}
          onCreate={handleCreate}
          saving={saving}
        />
      ) : null}
    </View>
  );
}
