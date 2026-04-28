import { forwardRef, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import * as Haptics from "expo-haptics";
import { createInvoice, formatInvoiceAmount } from "@/lib/invoices";
import Svg, { Path } from "react-native-svg";

type Step = "template" | "form" | "preview";

type FormData = {
  client_name: string;
  amount: string;
  due_date: string;
  notes: string;
};

const EMPTY_FORM: FormData = {
  client_name: "",
  amount: "",
  due_date: "",
  notes: "",
};

function BackArrow({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke="#1A1A1A"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10L8 14L16 6"
        stroke="#00A281"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ========================================================================== */
/*                             Template Step                                  */
/* ========================================================================== */

function TemplateStep({ onSelect }: { onSelect: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <TextWrapper
        weight="medium"
        style={{ fontSize: 22, color: "#1A1A1A", marginBottom: 6 }}
      >
        Choose a template
      </TextWrapper>
      <TextWrapper
        weight="regular"
        style={{ fontSize: 14, color: "#888", marginBottom: 28 }}
      >
        Select a style for your invoice
      </TextWrapper>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect();
        }}
        style={{
          borderWidth: 2,
          borderColor: "#1A1A1A",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Template preview mock — A4 proportions (210:297) */}
        <View
          style={{
            backgroundColor: "#FAFAFA",
            aspectRatio: 210 / 297,
            padding: 24,
            justifyContent: "space-between",
          }}
        >
          {/* Top: header */}
          <View>
            <View className="flex-row justify-between" style={{ marginBottom: 20 }}>
              <View>
                <View
                  style={{
                    width: 60,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#1A1A1A",
                    marginBottom: 6,
                  }}
                />
                <View
                  style={{
                    width: 100,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: "#DDD",
                  }}
                />
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "#E5E5E5",
                }}
              />
            </View>

            {/* Bill to block */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  width: 30,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#CCC",
                  marginBottom: 6,
                }}
              />
              <View
                style={{
                  width: 90,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#DDD",
                }}
              />
            </View>

            {/* Table header */}
            <View
              className="flex-row justify-between"
              style={{
                borderBottomWidth: 1,
                borderColor: "#E5E5E5",
                paddingBottom: 8,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#1A1A1A",
                }}
              />
              <View className="flex-row" style={{ gap: 20 }}>
                <View style={{ width: 24, height: 4, borderRadius: 2, backgroundColor: "#1A1A1A" }} />
                <View style={{ width: 24, height: 4, borderRadius: 2, backgroundColor: "#1A1A1A" }} />
                <View style={{ width: 30, height: 4, borderRadius: 2, backgroundColor: "#1A1A1A" }} />
              </View>
            </View>

            {/* Line items */}
            <View style={{ gap: 10 }}>
              {[0.85, 0.65, 0.5, 0.7].map((w, i) => (
                <View key={i} className="flex-row justify-between items-center">
                  <View
                    style={{
                      width: `${w * 45}%`,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: "#DDD",
                    }}
                  />
                  <View className="flex-row" style={{ gap: 20 }}>
                    <View style={{ width: 20, height: 5, borderRadius: 3, backgroundColor: "#DDD" }} />
                    <View style={{ width: 20, height: 5, borderRadius: 3, backgroundColor: "#DDD" }} />
                    <View style={{ width: 28, height: 5, borderRadius: 3, backgroundColor: "#DDD" }} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom: total */}
          <View>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "#E5E5E5",
                paddingTop: 12,
              }}
            >
              <View className="flex-row justify-end items-center" style={{ gap: 16 }}>
                <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: "#CCC" }} />
                <View style={{ width: 60, height: 8, borderRadius: 4, backgroundColor: "#1A1A1A" }} />
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingVertical: 14,
            paddingHorizontal: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 15, color: "#1A1A1A" }}
            >
              Clean Invoice
            </TextWrapper>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 12, color: "#999", marginTop: 2 }}
            >
              Simple, professional layout
            </TextWrapper>
          </View>
          <CheckIcon />
        </View>
      </Pressable>

      <TextWrapper
        weight="regular"
        style={{
          fontSize: 12,
          color: "#AAA",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        More templates coming soon
      </TextWrapper>
    </View>
  );
}

/* ========================================================================== */
/*                               Form Step                                    */
/* ========================================================================== */

function FormStep({
  form,
  setForm,
  onNext,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
}) {
  const amountRef = useRef<TextInput>(null);
  const dueDateRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const canContinue =
    form.client_name.trim().length > 0 && form.amount.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextWrapper
          weight="medium"
          style={{ fontSize: 22, color: "#1A1A1A", marginBottom: 6 }}
        >
          Invoice details
        </TextWrapper>
        <TextWrapper
          weight="regular"
          style={{ fontSize: 14, color: "#888", marginBottom: 28 }}
        >
          Fill in the information for your invoice
        </TextWrapper>

        <Field
          label="Client name"
          placeholder="e.g. Acme Ltd"
          value={form.client_name}
          onChangeText={(v) => setForm({ ...form, client_name: v })}
          returnKeyType="next"
          onSubmitEditing={() => amountRef.current?.focus()}
        />

        <Field
          ref={amountRef}
          label="Amount"
          placeholder="0.00"
          value={form.amount}
          onChangeText={(v) => setForm({ ...form, amount: v })}
          keyboardType="decimal-pad"
          prefix="\u00a3"
          returnKeyType="next"
          onSubmitEditing={() => dueDateRef.current?.focus()}
        />

        <Field
          ref={dueDateRef}
          label="Due date"
          placeholder="YYYY-MM-DD"
          value={form.due_date}
          onChangeText={(v) => setForm({ ...form, due_date: v })}
          returnKeyType="next"
          onSubmitEditing={() => notesRef.current?.focus()}
        />

        <Field
          ref={notesRef}
          label="Notes (optional)"
          placeholder="Any additional details..."
          value={form.notes}
          onChangeText={(v) => setForm({ ...form, notes: v })}
          multiline
          returnKeyType="done"
        />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 36 }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          disabled={!canContinue}
          style={{
            backgroundColor: "#1A1A1A",
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: "center",
            opacity: canContinue ? 1 : 0.4,
          }}
        >
          <TextWrapper
            weight="medium"
            style={{ fontSize: 16, color: "#FFFFFF" }}
          >
            Preview invoice
          </TextWrapper>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const Field = forwardRef<
  TextInput,
  {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    keyboardType?: TextInput["props"]["keyboardType"];
    prefix?: string;
    multiline?: boolean;
    returnKeyType?: TextInput["props"]["returnKeyType"];
    onSubmitEditing?: () => void;
  }
>(function Field(props, ref) {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    prefix,
    multiline,
    returnKeyType,
    onSubmitEditing,
  } = props;

  return (
    <View style={{ marginBottom: 20 }}>
      <TextWrapper
        weight="medium"
        style={{
          fontSize: 13,
          color: "#888",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </TextWrapper>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 14 : 0,
          minHeight: multiline ? 100 : 52,
        }}
      >
        {prefix && (
          <TextWrapper
            weight="medium"
            style={{ fontSize: 16, color: "#999", marginRight: 4 }}
          >
            {prefix}
          </TextWrapper>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BBB"
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#1A1A1A",
            fontFamily: "NeueMontreal-Regular",
          }}
        />
      </View>
    </View>
  );
});

/* ========================================================================== */
/*                             Preview Step                                   */
/* ========================================================================== */

function PreviewStep({
  form,
  onEdit,
  onDone,
  saving,
}: {
  form: FormData;
  onEdit: () => void;
  onDone: () => void;
  saving: boolean;
}) {
  const amount = parseFloat(form.amount) || 0;
  const today = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <TextWrapper
          weight="medium"
          style={{ fontSize: 22, color: "#1A1A1A", marginBottom: 20 }}
        >
          Preview
        </TextWrapper>

        {/* Invoice card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: "#F0F0F0",
          }}
        >
          <View className="flex-row justify-between items-start">
            <View>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 20, color: "#1A1A1A" }}
              >
                INVOICE
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 12, color: "#999", marginTop: 4 }}
              >
                Date: {today}
              </TextWrapper>
              {form.due_date.trim() !== "" && (
                <TextWrapper
                  weight="regular"
                  style={{ fontSize: 12, color: "#999", marginTop: 2 }}
                >
                  Due: {form.due_date}
                </TextWrapper>
              )}
            </View>
            <View
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <TextWrapper
                weight="medium"
                style={{ fontSize: 10, color: "#fff", letterSpacing: 0.5 }}
              >
                DRAFT
              </TextWrapper>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "#F0F0F0",
              marginVertical: 20,
            }}
          />

          <TextWrapper
            weight="regular"
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            Bill to
          </TextWrapper>
          <TextWrapper
            weight="medium"
            style={{ fontSize: 16, color: "#1A1A1A", marginBottom: 20 }}
          >
            {form.client_name}
          </TextWrapper>

          <View
            style={{
              backgroundColor: "#FAFAFA",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextWrapper
              weight="regular"
              style={{ fontSize: 14, color: "#666" }}
            >
              Total amount
            </TextWrapper>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 24, color: "#1A1A1A" }}
            >
              {formatInvoiceAmount(amount, "GBP")}
            </TextWrapper>
          </View>

          {form.notes.trim().length > 0 && (
            <View style={{ marginTop: 16 }}>
              <TextWrapper
                weight="regular"
                style={{
                  fontSize: 11,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                Notes
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 14, color: "#666", lineHeight: 20 }}
              >
                {form.notes}
              </TextWrapper>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 36,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Pressable
          onPress={onEdit}
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E5E5",
          }}
        >
          <TextWrapper
            weight="medium"
            style={{ fontSize: 16, color: "#1A1A1A" }}
          >
            Edit
          </TextWrapper>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDone();
          }}
          disabled={saving}
          style={{
            flex: 1,
            backgroundColor: "#1A1A1A",
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: "center",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: "#FFFFFF" }}
            >
              Done
            </TextWrapper>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ========================================================================== */
/*                              Main Screen                                   */
/* ========================================================================== */

export default function CreateInvoiceScreen() {
  const [step, setStep] = useState<Step>("template");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const stepTitle = {
    template: "1 of 3",
    form: "2 of 3",
    preview: "3 of 3",
  }[step];

  const handleBack = () => {
    if (step === "form") setStep("template");
    else if (step === "preview") setStep("form");
    else router.back();
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      const amount = parseFloat(form.amount) || 0;
      const invoice = await createInvoice({
        client_name: form.client_name.trim(),
        amount,
        due_date: form.due_date.trim() || undefined,
        notes: form.notes.trim() || undefined,
        status: "draft",
      });

      router.replace({
        pathname: "/invoice-created",
        params: {
          clientName: invoice.client_name,
          amount: String(invoice.amount),
          status: invoice.status,
        },
      });
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      {/* Nav bar */}
      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: 60, paddingBottom: 16 }}
      >
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BackArrow size={20} />
        </Pressable>

        <TextWrapper
          weight="regular"
          style={{ fontSize: 13, color: "#999" }}
        >
          {stepTitle}
        </TextWrapper>

        <View style={{ width: 40 }} />
      </View>

      {step === "template" && (
        <TemplateStep onSelect={() => setStep("form")} />
      )}
      {step === "form" && (
        <FormStep
          form={form}
          setForm={setForm}
          onNext={() => setStep("preview")}
        />
      )}
      {step === "preview" && (
        <PreviewStep
          form={form}
          onEdit={() => setStep("form")}
          onDone={handleDone}
          saving={saving}
        />
      )}
    </View>
  );
}
