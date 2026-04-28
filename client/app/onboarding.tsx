import { View, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { CheckIcon } from "@/components/icons/check-icon";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";

interface Step {
  question: string;
  options: string[];
}

const STEPS: Step[] = [
  {
    question: "What kind of business\ndo you run?",
    options: [
      "Freelancer",
      "Sole Trader",
      "Small Agency",
      "Builder / Trades",
      "Consultant",
      "Other",
    ],
  },
  {
    question: "How much does your\nbusiness make a year?",
    options: [
      "Under £10,000",
      "£10k – £50k",
      "£50k – £150k",
      "£150k – £500k",
      "Over £500k",
    ],
  },
  {
    question: "How many people\nwork in your business?",
    options: ["Just me", "2–5", "6–15", "16–50", "50+"],
  },
  {
    question: "What's your biggest\nfinancial headache?",
    options: [
      "Cash flow",
      "Late invoices",
      "Tax surprises",
      "Bookkeeping",
      "Forecasting",
      "All of the above",
    ],
  },
  {
    question: "How did you hear\nabout Thomo?",
    options: [
      "Instagram",
      "TikTok",
      "X / Twitter",
      "Friend / Word of mouth",
      "Google",
      "Other",
    ],
  },
];

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center justify-between"
      style={{
        borderWidth: 1.5,
        borderColor: selected ? "#1A1A1A" : "#E5E5E5",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
      }}
    >
      <TextWrapper
        weight={selected ? "medium" : "regular"}
        style={{ fontSize: 15, color: "#1A1A1A" }}
      >
        {label}
      </TextWrapper>
      {selected && (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon size={13} color="#fff" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 4,
            flex: i === current ? 2 : 1,
            borderRadius: 2,
            backgroundColor: i <= current ? "#1A1A1A" : "#E5E5E5",
          }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    STEPS.map(() => null),
  );

  const currentStep = STEPS[step];
  const selectedAnswer = answers[step];
  const isLastStep = step === STEPS.length - 1;

  const handleSelect = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...answers];
    updated[step] = option;
    setAnswers(updated);
  };

  const handleContinue = () => {
    if (isLastStep) {
      router.replace("/notifications" as never);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/notifications" as never);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pt-20 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={handleBack} hitSlop={12}>
            <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.5} />
          </Pressable>

          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <ProgressBar current={step} total={STEPS.length} />
          </View>

          <Pressable onPress={handleSkip} hitSlop={12}>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 15, color: "#1A1A1A" }}
            >
              Skip
            </TextWrapper>
          </Pressable>
        </View>
      </View>

      {/* Question content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
        >
          <TextWrapper
            weight="medium"
            style={{
              fontSize: 28,
              lineHeight: 36,
              color: "#1A1A1A",
              textAlign: "center",
              marginTop: 24,
              marginBottom: 40,
            }}
          >
            {currentStep.question}
          </TextWrapper>

          <View style={{ gap: 10 }}>
            {currentStep.options.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={selectedAnswer === option}
                onPress={() => handleSelect(option)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom */}
      <View className="px-6 pb-10">
        <Pressable3D
          className="items-center justify-center rounded-2xl bg-[#1A1A1A] py-5"
          shadowColor="#000"
          onPress={handleContinue}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#fff" }}>
            Connect
          </TextWrapper>
        </Pressable3D>
      </View>
    </View>
  );
}
