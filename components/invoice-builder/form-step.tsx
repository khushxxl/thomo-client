import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/api";
import { uploadInvoiceAsset } from "@/lib/storage-utils";
import { TextWrapper } from "@/components/text-wrapper";
import {
  calculateInvoiceTotals,
  createCustomField,
  createLineItem,
  formatDateInputValue,
  formatDraftDate,
  parseDateInputValue,
  type InvoiceDraft,
  type InvoiceLineItemDraft,
} from "@/lib/invoice-draft";
import { formatInvoiceAmount } from "@/lib/invoices";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import type { InvoiceFieldErrorMap } from "@/lib/invoice-validation";
import {
  DateField,
  ErrorNotice,
  Field,
  PlusIcon,
  SectionTitle,
  SummaryRow,
  TrashIcon,
  XIcon,
} from "@/components/invoice-builder/shared";

type DateFieldKey = "issue_date" | "due_date" | null;

type Props = {
  draft: InvoiceDraft;
  setDraft: (draft: InvoiceDraft) => void;
  onNext: () => void;
  updateItem: (
    draft: InvoiceDraft,
    id: string,
    patch: Partial<InvoiceLineItemDraft>,
  ) => InvoiceDraft;
  updateField: (
    draft: InvoiceDraft,
    id: string,
    patch: { label?: string; value?: string },
  ) => InvoiceDraft;
  lineItemValue: (item: InvoiceLineItemDraft) => number;
  validationMessage: string | null;
  fieldErrors: InvoiceFieldErrorMap;
  showValidation: boolean;
  canPreview: boolean;
};

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: INVOICE_RADIUS.surface,
        borderWidth: 1,
        borderColor: "#ECECEC",
        padding: 16,
        marginBottom: 16,
      }}
    >
      <SectionTitle title={title} subtitle={subtitle} />
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 12 }}>{children}</View>;
}

function CurrencyBadge() {
  return (
    <View
      style={{
        minHeight: 52,
        borderRadius: INVOICE_RADIUS.control,
        backgroundColor: "#F8F8F6",
        borderWidth: 1,
        borderColor: "#E7E5DF",
        paddingHorizontal: 14,
        justifyContent: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
        GBP
      </TextWrapper>
      <TextWrapper weight="regular" style={{ fontSize: 11, color: "#8A8A8F", marginTop: 2 }}>
        British pound sterling
      </TextWrapper>
    </View>
  );
}

export function FormStep({
  draft,
  setDraft,
  onNext,
  updateItem,
  updateField,
  lineItemValue,
  validationMessage,
  fieldErrors,
  showValidation,
  canPreview,
}: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const totals = calculateInvoiceTotals(draft);
  const [activeDateField, setActiveDateField] = useState<DateFieldKey>(null);
  const [iosPickerValue, setIosPickerValue] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const visibleLineErrors = useMemo(() => fieldErrors.line_items || {}, [fieldErrors.line_items]);
  const previewReady = canPreview && !uploading;

  const openDateField = (field: Exclude<DateFieldKey, null>) => {
    const raw = field === "issue_date" ? draft.issue_date : draft.due_date;
    const parsed = raw ? parseDateInputValue(raw) : new Date();
    setIosPickerValue(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
    setActiveDateField(field);
  };

  const commitDate = (field: Exclude<DateFieldKey, null>, date: Date) => {
    const formatted = formatDateInputValue(date);
    setDraft({ ...draft, [field]: formatted });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!activeDateField || !selectedDate) {
      if (Platform.OS === "android") setActiveDateField(null);
      return;
    }

    if (Platform.OS === "android") {
      if (event.type === "set") {
        commitDate(activeDateField, selectedDate);
      }
      setActiveDateField(null);
      return;
    }

    setIosPickerValue(selectedDate);
  };

  const handlePickLogo = async () => {
    if (uploading) return;
    setUploadError(null);

    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Photo access is required to upload a logo.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const url = await uploadInvoiceAsset(result.assets[0].uri, user?.id ?? "");
        setDraft({ ...draft, brand_logo_url: url });
      }
    } catch (err) {
      console.error("Logo upload failed:", err);
      const message = getErrorMessage(err, "Could not upload this logo.");
      setUploadError(
        message.includes("ExponentImagePicker") || message.includes("expo-image-picker")
          ? "Image picker is not linked in this dev client. Rebuild the iOS app, then try uploading again."
          : message,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 132 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <SectionTitle
          title="Build your invoice"
          subtitle="Required business, client, and line item details first. Branding and payment details can stay empty."
        />

        {showValidation && validationMessage ? <ErrorNotice message={validationMessage} /> : null}

        <SectionCard
          title="Basics"
          subtitle="Core invoice details and a few business-ready references."
        >
          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Invoice number"
                value={draft.invoice_number}
                onChangeText={(value) => setDraft({ ...draft, invoice_number: value })}
                placeholder="INV-2026-001"
                autoCapitalize="characters"
                error={showValidation ? fieldErrors.invoice_number : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
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
                  Currency
                </TextWrapper>
                <CurrencyBadge />
                <TextWrapper
                  weight="regular"
                  style={{ fontSize: 12, color: "#8A8A8F", marginTop: 6 }}
                >
                  Invoices are issued in pounds.
                </TextWrapper>
              </View>
            </View>
          </Row>

          <Row>
            <View style={{ flex: 1 }}>
              <DateField
                label="Issue date"
                value={formatDraftDate(draft.issue_date)}
                onPress={() => openDateField("issue_date")}
                error={showValidation ? fieldErrors.issue_date : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DateField
                label="Due date"
                value={formatDraftDate(draft.due_date)}
                onPress={() => openDateField("due_date")}
                error={showValidation ? fieldErrors.due_date : undefined}
              />
            </View>
          </Row>

          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Purchase order"
                value={draft.purchase_order}
                onChangeText={(value) => setDraft({ ...draft, purchase_order: value })}
                placeholder="PO-30044"
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Tax rate (%)"
                value={draft.tax_rate}
                onChangeText={(value) => setDraft({ ...draft, tax_rate: value })}
                placeholder="20"
                keyboardType="decimal-pad"
              />
            </View>
          </Row>

          <Field
            label="Project or service"
            value={draft.project_name}
            onChangeText={(value) => setDraft({ ...draft, project_name: value })}
            placeholder="Q2 financial review"
          />

        </SectionCard>

        <SectionCard
          title="Branding (Optional)"
          subtitle="Add your logo and signature to personalize the invoice."
        >
          <View style={{ marginBottom: 16 }}>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 13, color: "#8A8A8F", marginBottom: 8 }}
            >
              Business Logo
            </TextWrapper>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#FAFAFA",
                borderWidth: 1,
                borderColor: uploading ? "#171717" : "#ECECEC",
                borderRadius: INVOICE_RADIUS.control,
                padding: 10,
                opacity: uploading ? 0.78 : 1,
              }}
            >
              <Pressable
                onPress={handlePickLogo}
                disabled={uploading}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: INVOICE_RADIUS.control,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E5E5E5",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {draft.brand_logo_url ? (
                    <Image
                      source={{ uri: draft.brand_logo_url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="contain"
                    />
                  ) : uploading ? (
                    <ActivityIndicator color="#171717" />
                  ) : (
                    <View style={{ alignItems: "center" }}>
                      <PlusIcon size={20} color="#8A8A8F" />
                      <TextWrapper
                        weight="medium"
                        style={{ fontSize: 11, color: "#8A8A8F", marginTop: 4 }}
                      >
                        Upload
                      </TextWrapper>
                    </View>
                  )}
                  {uploading ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundColor: "rgba(255,255,255,0.78)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="#171717" />
                    </View>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
                    {uploading
                      ? "Uploading logo..."
                      : draft.brand_logo_url
                        ? "Logo uploaded"
                        : "Select a professional logo"}
                  </TextWrapper>
                  <TextWrapper
                    weight="regular"
                    style={{ fontSize: 12, color: "#8A8A8F", lineHeight: 17, marginTop: 3 }}
                  >
                    {uploading
                      ? "Please wait while we save it to your invoice assets."
                      : draft.brand_logo_url
                        ? "Tap here to replace it."
                        : "Tap to choose an image from Photos."}
                  </TextWrapper>
                </View>
              </Pressable>
              {draft.brand_logo_url ? (
                <Pressable
                  onPress={() => {
                    setUploadError(null);
                    setDraft({ ...draft, brand_logo_url: "" });
                  }}
                  disabled={uploading}
                  hitSlop={10}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: INVOICE_RADIUS.action,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E5E5E5",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: uploading ? 0.55 : 1,
                  }}
                >
                  <XIcon size={15} color="#737373" />
                </Pressable>
              ) : null}
            </View>
            {uploadError ? (
              <TextWrapper
                weight="regular"
                style={{ fontSize: 12, color: "#DC2626", marginTop: 8 }}
              >
                {uploadError}
              </TextWrapper>
            ) : null}
          </View>

          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Logo mark (Text)"
                value={draft.brand_mark}
                onChangeText={(value) => setDraft({ ...draft, brand_mark: value })}
                placeholder=".b"
                autoCapitalize="none"
                helper="Fallback if no image is uploaded."
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Signature"
                value={draft.signature_name}
                onChangeText={(value) => setDraft({ ...draft, signature_name: value })}
                placeholder="Your name"
                helper="Shown at the bottom right."
              />
            </View>
          </Row>
        </SectionCard>

        <SectionCard title="From" subtitle="The business details shown on the invoice.">
          <Field
            label="Business name"
            value={draft.sender_name}
            onChangeText={(value) => setDraft({ ...draft, sender_name: value })}
            placeholder="John Studios Ltd."
            error={showValidation ? fieldErrors.sender_name : undefined}
          />

          <Field
            label="Business email"
            value={draft.sender_email}
            onChangeText={(value) => setDraft({ ...draft, sender_email: value })}
            placeholder="hello@studio.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Business phone"
                value={draft.sender_phone}
                onChangeText={(value) => setDraft({ ...draft, sender_phone: value })}
                placeholder="+44 20 1234 5678"
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="VAT number"
                value={draft.sender_vat_number}
                onChangeText={(value) => setDraft({ ...draft, sender_vat_number: value })}
                placeholder="GB 123 4567 89"
                autoCapitalize="characters"
              />
            </View>
          </Row>

          <Field
            label="Company number"
            value={draft.sender_company_number}
            onChangeText={(value) => setDraft({ ...draft, sender_company_number: value })}
            placeholder="12345678"
            autoCapitalize="characters"
          />

          <Field
            label="Business address"
            value={draft.sender_address}
            onChangeText={(value) => setDraft({ ...draft, sender_address: value })}
            placeholder="12 King Street, London"
            multiline
          />
        </SectionCard>

        <SectionCard title="Bill to" subtitle="Client details and any purchase reference they need.">
          <Field
            label="Client name"
            value={draft.client_name}
            onChangeText={(value) => setDraft({ ...draft, client_name: value })}
            placeholder="Benjamin John"
            error={showValidation ? fieldErrors.client_name : undefined}
          />

          <Field
            label="Client company name"
            value={draft.client_company}
            onChangeText={(value) => setDraft({ ...draft, client_company: value })}
            placeholder="Aether Agency"
          />

          <Field
            label="Client email"
            value={draft.client_email}
            onChangeText={(value) => setDraft({ ...draft, client_email: value })}
            placeholder="accounts@aether.agency"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label="Client VAT"
            value={draft.client_vat_number}
            onChangeText={(value) => setDraft({ ...draft, client_vat_number: value })}
            placeholder="GB 987 6543 21"
            autoCapitalize="characters"
          />

          <Field
            label="Client address"
            value={draft.client_address}
            onChangeText={(value) => setDraft({ ...draft, client_address: value })}
            placeholder="45 Shoreditch High St, London"
            multiline
          />
        </SectionCard>

        <SectionCard title="Payment (Optional)" subtitle="Bank or reconciliation details for the client.">
          <Field
            label="Payment terms"
            value={draft.payment_terms}
            onChangeText={(value) => setDraft({ ...draft, payment_terms: value })}
            placeholder="Bank transfer within 14 days"
            helper="Optional. Shown only if filled."
          />

          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Payment method"
                value={draft.payment_method}
                onChangeText={(value) => setDraft({ ...draft, payment_method: value })}
                placeholder="Bank transfer"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Payment reference"
                value={draft.payment_reference}
                onChangeText={(value) => setDraft({ ...draft, payment_reference: value })}
                placeholder="INV-2026-001"
                autoCapitalize="characters"
              />
            </View>
          </Row>

          <Field
            label="Payment details"
            value={draft.payment_details}
            onChangeText={(value) => setDraft({ ...draft, payment_details: value })}
            placeholder={"Name: Your Business\nIBAN: GB00...\nSwift/BIC: ..."}
            multiline
            helper="Optional. Only shown on the invoice if filled."
          />
        </SectionCard>

        <SectionCard
          title="Line items"
          subtitle="Break down the work clearly so the total feels trustworthy."
        >
          {draft.line_items.map((item, index) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#FAFAFA",
                borderRadius: INVOICE_RADIUS.surface,
                borderWidth: 1,
                borderColor: "#ECECEC",
                padding: 14,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 15, color: "#171717" }}>
                  Item {index + 1}
                </TextWrapper>
                {draft.line_items.length > 1 ? (
                  <Pressable
                    onPress={() =>
                      setDraft({
                        ...draft,
                        line_items: draft.line_items.filter((lineItem) => lineItem.id !== item.id),
                      })
                    }
                    hitSlop={8}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: INVOICE_RADIUS.action,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrashIcon />
                  </Pressable>
                ) : null}
              </View>

              <Field
                label="Description"
                value={item.description}
                onChangeText={(value) =>
                  setDraft(updateItem(draft, item.id, { description: value }))
                }
                placeholder="Website design sprint"
                error={showValidation ? visibleLineErrors[item.id]?.description : undefined}
              />

              <Row>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Qty"
                    value={item.quantity}
                    onChangeText={(value) =>
                      setDraft(updateItem(draft, item.id, { quantity: value }))
                    }
                    placeholder="1"
                    keyboardType="decimal-pad"
                    error={showValidation ? visibleLineErrors[item.id]?.quantity : undefined}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Unit price"
                    value={item.unit_price}
                    onChangeText={(value) =>
                      setDraft(updateItem(draft, item.id, { unit_price: value }))
                    }
                    placeholder="1500"
                    keyboardType="decimal-pad"
                    suffix={
                      <TextWrapper weight="medium" style={{ fontSize: 12, color: "#8A8A8F" }}>
                        GBP
                      </TextWrapper>
                    }
                    error={showValidation ? visibleLineErrors[item.id]?.unit_price : undefined}
                  />
                </View>
              </Row>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TextWrapper weight="regular" style={{ fontSize: 13, color: "#8A8A8F" }}>
                  Line total
                </TextWrapper>
                <TextWrapper weight="medium" style={{ fontSize: 15, color: "#171717" }}>
                  {formatInvoiceAmount(lineItemValue(item), draft.currency)}
                </TextWrapper>
              </View>
            </View>
          ))}

          <Pressable
            onPress={() =>
              setDraft({
                ...draft,
                line_items: [...draft.line_items, createLineItem()],
              })
            }
            style={{
              alignSelf: "flex-start",
              borderRadius: INVOICE_RADIUS.action,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#ECECEC",
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <PlusIcon size={14} />
            <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
              Add line item
            </TextWrapper>
          </Pressable>
        </SectionCard>

        <SectionCard title="Terms and notes" subtitle="Anything else the client should see.">
          <Field
            label="Notes"
            value={draft.notes}
            onChangeText={(value) => setDraft({ ...draft, notes: value })}
            placeholder="Thanks for the opportunity. Payment by bank transfer is preferred."
            multiline
          />
        </SectionCard>

        <SectionCard
          title="Custom fields"
          subtitle="Add any extra rows like contract ID, milestone, or internal reference."
        >
          {draft.custom_fields.map((field) => (
            <View
              key={field.id}
              style={{
                backgroundColor: "#FAFAFA",
                borderRadius: INVOICE_RADIUS.surface,
                borderWidth: 1,
                borderColor: "#ECECEC",
                padding: 14,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 15, color: "#171717" }}>
                  Custom field
                </TextWrapper>
                <Pressable
                  onPress={() =>
                    setDraft({
                      ...draft,
                      custom_fields: draft.custom_fields.filter(
                        (customField) => customField.id !== field.id,
                      ),
                    })
                  }
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: INVOICE_RADIUS.control,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrashIcon />
                </Pressable>
              </View>

              <Row>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Label"
                    value={field.label}
                    onChangeText={(value) =>
                      setDraft(updateField(draft, field.id, { label: value }))
                    }
                    placeholder="Contract ID"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Value"
                    value={field.value}
                    onChangeText={(value) =>
                      setDraft(updateField(draft, field.id, { value }))
                    }
                    placeholder="CN-4832"
                  />
                </View>
              </Row>
            </View>
          ))}

          <Pressable
            onPress={() =>
              setDraft({
                ...draft,
                custom_fields: [...draft.custom_fields, createCustomField()],
              })
            }
            style={{
              alignSelf: "flex-start",
              borderRadius: INVOICE_RADIUS.action,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#ECECEC",
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <PlusIcon size={14} />
            <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
              Add custom field
            </TextWrapper>
          </Pressable>
        </SectionCard>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: INVOICE_RADIUS.surface,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#ECECEC",
          }}
        >
          <SummaryRow
            label="Subtotal"
            value={formatInvoiceAmount(totals.subtotal, draft.currency)}
          />
          <SummaryRow
            label={`Tax (${draft.tax_rate || "0"}%)`}
            value={formatInvoiceAmount(totals.taxAmount, draft.currency)}
          />
          <SummaryRow
            label="Total"
            value={formatInvoiceAmount(totals.total, draft.currency)}
            strong
          />
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 6, 10),
            backgroundColor: "#F7F7F5",
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.04)",
          }}
        >
          <Pressable
            onPress={onNext}
            disabled={!previewReady}
            style={{
              backgroundColor: previewReady ? "#171717" : "#D8D8D3",
              borderRadius: INVOICE_RADIUS.action,
              paddingVertical: 18,
              alignItems: "center",
              opacity: previewReady ? 1 : 0.9,
            }}
          >
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: previewReady ? "#FFFFFF" : "#777771" }}
            >
              {uploading ? "Uploading logo..." : "Preview invoice"}
            </TextWrapper>
          </Pressable>
          {!previewReady ? (
            <TextWrapper
              weight="regular"
              style={{ fontSize: 12, color: "#8A8A8F", textAlign: "center", marginTop: 8 }}
            >
              {uploading
                ? "Please wait until the logo upload finishes."
                : "Complete the required details to preview."}
            </TextWrapper>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      {activeDateField && Platform.OS === "ios" ? (
        <Modal
          transparent
          animationType="slide"
          visible
          onRequestClose={() => setActiveDateField(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.28)",
              justifyContent: "flex-end",
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setActiveDateField(null)} />
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: INVOICE_RADIUS.surface,
                borderTopRightRadius: INVOICE_RADIUS.surface,
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: Math.max(insets.bottom + 14, 18),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 18, color: "#171717" }}>
                  {activeDateField === "issue_date" ? "Issue date" : "Due date"}
                </TextWrapper>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setActiveDateField(null)}
                    style={{
                      borderRadius: INVOICE_RADIUS.action,
                      backgroundColor: "#F3F4F6",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
                      Cancel
                    </TextWrapper>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (activeDateField) {
                        commitDate(activeDateField, iosPickerValue);
                      }
                      setActiveDateField(null);
                    }}
                    style={{
                      borderRadius: INVOICE_RADIUS.action,
                      backgroundColor: "#171717",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 14, color: "#FFFFFF" }}>
                      Apply
                    </TextWrapper>
                  </Pressable>
                </View>
              </View>

              <DateTimePicker
                value={iosPickerValue}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                themeVariant="light"
                accentColor="#171717"
                style={{ alignSelf: "stretch", minHeight: 320 }}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {activeDateField && Platform.OS === "android" ? (
        <DateTimePicker
          value={draft[activeDateField] ? parseDateInputValue(draft[activeDateField]) : new Date()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      ) : null}
    </View>
  );
}
