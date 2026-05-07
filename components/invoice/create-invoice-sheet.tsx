import React, { forwardRef, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { TextWrapper } from "@/components/text-wrapper";
import { ManualIcon, ThomoSmallIcon } from "@/components/icons";

type CreateOption = "thomo" | "manual";

export const CreateInvoiceSheet = forwardRef<BottomSheetModal>((_props, ref) => {
  const [selected, setSelected] = useState<CreateOption>("thomo");
  const snapPoints = useMemo(() => ["42%"], []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (typeof ref !== "function") {
      ref?.current?.dismiss();
    }
    if (selected === "thomo") {
      router.push("/thomo-invoice-chat");
    } else {
      router.push("/create-invoice");
    }
  };

  const RadioButton = ({ active }: { active: boolean }) => (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: active ? "#1F1F1F" : "#E5E5E5",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {active && (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#1F1F1F",
          }}
        />
      )}
    </View>
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
          opacity={0.6}
        />
      )}
      backgroundStyle={{ backgroundColor: "#FFFFFF", borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: "#D4D4D4", width: 40 }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <TextWrapper weight="medium" style={{ fontSize: 22, color: "#1A1A1A" }}>
            Create an invoice
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 15, color: "#999", marginTop: 6 }}>
            Choose how you want to get started
          </TextWrapper>
        </View>

        <Pressable
          onPress={() => setSelected("thomo")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 2,
            borderColor: selected === "thomo" ? "#1F1F1F" : "transparent",
            backgroundColor: selected === "thomo" ? "#FFFFFF" : "#F7F7F7",
            borderRadius: 20,
            padding: 18,
            marginBottom: 12,
          }}
        >
          <ThomoSmallIcon size={32} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1A1A1A" }}>
              Thomo AI
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 2 }}>
              Type once Thomo takes over
            </TextWrapper>
          </View>
          <RadioButton active={selected === "thomo"} />
        </Pressable>

        <Pressable
          onPress={() => setSelected("manual")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 2,
            borderColor: selected === "manual" ? "#1F1F1F" : "transparent",
            backgroundColor: selected === "manual" ? "#FFFFFF" : "#F7F7F7",
            borderRadius: 20,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <View style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
            <ManualIcon size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1A1A1A" }}>
              Create manually
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 14, color: "#999", marginTop: 2 }}>
              Fill in the details yourself
            </TextWrapper>
          </View>
          <RadioButton active={selected === "manual"} />
        </Pressable>

        <Pressable
          onPress={handleContinue}
          style={{
            backgroundColor: "#1F1F1F",
            height: 56,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
            Continue
          </TextWrapper>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreateInvoiceSheet.displayName = "CreateInvoiceSheet";
