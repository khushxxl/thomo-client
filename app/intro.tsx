import { View, Dimensions, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  type ReactNode,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  type SharedValue,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import { ForecastChart } from "@/components/icons/forecast-chart";
import { CountUp } from "@/components/count-up";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface IntroSlide {
  id: string;
  title: string;
  subtitle: string;
  content: () => ReactNode;
}

// ─── Slide 1 content: Forecast mockup ───────────────────────────────

function ForecastMockup() {
  const [activeTab, setActiveTab] = useState(1);
  const tabs = ["30 Days", "60 Days", "90 Days"];

  return (
    <View
      style={{ width: SCREEN_WIDTH * 0.78, gap: 12 }}
      className="items-center"
    >
      {/* Tab bar */}
      <View
        className="w-full flex-row rounded-lg bg-[#F5F5F5]"
        style={{ padding: 3 }}
      >
        {tabs.map((tab, i) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(i)}
            className="flex-1 items-center rounded-md py-1.5"
            style={activeTab === i ? { backgroundColor: "#fff" } : undefined}
          >
            <TextWrapper
              weight={activeTab === i ? "medium" : "regular"}
              style={{
                fontSize: 11,
                color: activeTab === i ? "#1A1A1A" : "#999",
              }}
            >
              {tab}
            </TextWrapper>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View
        className="w-full items-center rounded-xl bg-white"
        style={{ paddingVertical: 12, paddingHorizontal: 8 }}
      >
        <ForecastChart
          activeTab={activeTab}
          width={SCREEN_WIDTH * 0.68}
          height={Math.round((SCREEN_WIDTH * 0.68 * 162) / 275)}
        />
      </View>

      {/* Stat cards */}
      <View className="w-full flex-row" style={{ gap: 8 }}>
        <View className="flex-1 rounded-xl bg-white" style={{ padding: 10 }}>
          <TextWrapper weight="regular" style={{ fontSize: 10, color: "#999" }}>
            Predicted Cash
          </TextWrapper>
          <View className="mt-1 flex-row items-baseline" style={{ gap: 4 }}>
            <CountUp
              to={84200}
              prefix="£"
              weight="bold"
              style={{ fontSize: 16, color: "#1A1A1A" }}
            />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 10, color: "#22C55E" }}
            >
              +12%
            </TextWrapper>
          </View>
        </View>
        <View className="flex-1 rounded-xl bg-white" style={{ padding: 10 }}>
          <TextWrapper weight="regular" style={{ fontSize: 10, color: "#999" }}>
            Tax Liability
          </TextWrapper>
          <View className="mt-1 flex-row items-baseline" style={{ gap: 4 }}>
            <CountUp
              to={12450}
              prefix="£"
              weight="bold"
              delay={700}
              style={{ fontSize: 16, color: "#1A1A1A" }}
            />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 10, color: "#F59E0B" }}
            >
              Due Q4
            </TextWrapper>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 2 content: Invoice cards mockup ──────────────────────────

function InvoiceCard({
  initials,
  bgColor,
  name,
  amount,
  subtitle,
  badge,
  badgeColor,
  hasNotification,
  style,
}: {
  initials: string;
  bgColor: string;
  name: string;
  amount: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  hasNotification?: boolean;
  style?: Record<string, unknown>;
}) {
  return (
    <View
      className="w-full flex-row items-center rounded-2xl bg-white px-3 py-3"
      style={[
        {
          shadowColor: "#000",
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      {/* Avatar */}
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 36, height: 36, backgroundColor: bgColor }}
      >
        <TextWrapper weight="bold" style={{ fontSize: 12, color: "#fff" }}>
          {initials}
        </TextWrapper>
      </View>

      {/* Info */}
      <View className="ml-2.5 flex-1">
        <TextWrapper weight="medium" style={{ fontSize: 12, color: "#09090B" }}>
          {name}
        </TextWrapper>
        {subtitle && (
          <TextWrapper
            weight="regular"
            style={{ fontSize: 9, color: "#71717A", marginTop: 1 }}
          >
            {subtitle}
          </TextWrapper>
        )}
      </View>

      {/* Amount + badge */}
      <View className="items-end">
        <TextWrapper weight="medium" style={{ fontSize: 12, color: "#09090B" }}>
          {amount}
        </TextWrapper>
        {badge && (
          <TextWrapper
            weight="medium"
            style={{
              fontSize: 9,
              color: badgeColor ?? "#F59E0B",
              marginTop: 1,
            }}
          >
            {badge}
          </TextWrapper>
        )}
      </View>

      {/* Notification dot */}
      {hasNotification && (
        <View
          className="absolute rounded-full bg-[#F02E24]"
          style={{
            width: 10,
            height: 10,
            top: -2,
            right: -2,
            borderWidth: 2,
            borderColor: "rgba(240,46,36,0.2)",
          }}
        />
      )}
    </View>
  );
}

const INVOICE_CARDS = [
  {
    initials: "DM",
    bgColor: "#1A1A1A",
    name: "David Miller",
    amount: "£667.00",
    subtitle: "INV-2024-004  ·  April 18, 2024",
    badge: "Pending",
    badgeColor: "#F59E0B",
    hasNotification: true,
  },
  {
    initials: "SK",
    bgColor: "#8B5CF6",
    name: "Sarah Keller",
    amount: "£210.00",
    subtitle: "INV-2024-003  ·  April 12, 2024",
  },
  {
    initials: "AA",
    bgColor: "#3B82F6",
    name: "Aether Agency",
    amount: "£4,500.00",
    subtitle: "INV-2024-002  ·  April 5, 2024",
  },
];

const STACK = [
  { bottom: 0, left: 0, right: 0, scale: 1, opacity: 1, zIndex: 3 },
  {
    bottom: 18,
    left: 8,
    right: 8,
    scale: 0.96,
    opacity: 0.7,
    zIndex: 2,
  },
  {
    bottom: 32,
    left: 16,
    right: 16,
    scale: 0.92,
    opacity: 0.4,
    zIndex: 1,
    rotate: -3,
  },
];

function AnimatedInvoiceCard({
  card,
  posIndex,
}: {
  card: (typeof INVOICE_CARDS)[number];
  posIndex: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const i = posIndex.value;
    return {
      position: "absolute" as const,
      bottom: interpolate(
        i,
        [0, 1, 2],
        [STACK[0].bottom, STACK[1].bottom, STACK[2].bottom],
      ),
      left: interpolate(
        i,
        [0, 1, 2],
        [STACK[0].left, STACK[1].left, STACK[2].left],
      ),
      right: interpolate(
        i,
        [0, 1, 2],
        [STACK[0].right, STACK[1].right, STACK[2].right],
      ),
      opacity: interpolate(
        i,
        [0, 1, 2],
        [STACK[0].opacity, STACK[1].opacity, STACK[2].opacity],
      ),
      zIndex: Math.round(interpolate(i, [0, 1, 2], [3, 2, 1])),
      transform: [
        {
          scale: interpolate(
            i,
            [0, 1, 2],
            [STACK[0].scale, STACK[1].scale, STACK[2].scale],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <InvoiceCard {...card} />
    </Animated.View>
  );
}

function InvoiceCardsMockup() {
  // Each shared value tracks which stack position (0=front, 1=middle, 2=back)
  const pos0 = useSharedValue(0);
  const pos1 = useSharedValue(1);
  const pos2 = useSharedValue(2);
  const positions = [pos0, pos1, pos2];

  useEffect(() => {
    const cycle = () => {
      const timing = { duration: 500, easing: Easing.inOut(Easing.quad) };
      for (const pos of positions) {
        const next = (Math.round(pos.value) + 1) % 3;
        pos.value = withTiming(next, timing);
      }
    };

    const interval = setInterval(cycle, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        width: SCREEN_WIDTH * 0.78,
        transform: [{ perspective: 1200 }, { rotateX: "8deg" }],
      }}
      className="items-center"
    >
      <View style={{ height: 150, width: "100%" }}>
        {INVOICE_CARDS.map((card, i) => (
          <AnimatedInvoiceCard
            key={card.initials}
            card={card}
            posIndex={positions[i]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Shared components ──────────────────────────────────────────────

const SLIDES: IntroSlide[] = [
  {
    id: "1",
    title: "Know Your Money Before\nIt Happens",
    subtitle: "See your next 30, 60, 90 days before\nproblems hit.",
    content: () => <ForecastMockup />,
  },
  {
    id: "2",
    title: "Running Blind With Your\nFinances?",
    subtitle: "Spreadsheets, late invoices, surprise tax\nbills it adds up.",
    content: () => <InvoiceCardsMockup />,
  },
  {
    id: "3",
    title: "Your AI CFO,\nAlways On",
    subtitle: "Thomo watches your money so\nyou can focus on your business.",
    content: () => (
      <Image
        source={require("@/assets/images/slide-3-asset.png")}
        style={{ width: SCREEN_WIDTH * 1, height: SCREEN_WIDTH * 1 }}
        contentFit="contain"
      />
    ),
  },
];

function Dot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [8, 28, 8],
      "clamp",
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      ["#D1D5DB", "#1A1A1A", "#D1D5DB"],
    );
    return { width, backgroundColor };
  });

  return (
    <Animated.View style={[{ height: 8, borderRadius: 4 }, animatedStyle]} />
  );
}

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: IntroSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 0.5) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 0.5) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      "clamp",
    );
    const translateY = interpolate(
      scrollX.value,
      [
        (index - 0.5) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 0.5) * SCREEN_WIDTH,
      ],
      [20, 0, 20],
      "clamp",
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 justify-between pt-16 pb-4"
    >
      {/* Visual content */}
      <View className="flex-1 items-center justify-center">
        {item.content()}
      </View>

      {/* Text */}
      <Animated.View
        style={textAnimatedStyle}
        className="items-center px-8 pt-8"
      >
        <TextWrapper
          weight="medium"
          style={{
            fontSize: 28,
            lineHeight: 36,
            textAlign: "center",
            color: "#1A1A1A",
          }}
        >
          {item.title}
        </TextWrapper>
        <TextWrapper
          weight="regular"
          style={{
            fontSize: 16,
            lineHeight: 24,
            textAlign: "center",
            color: "#888",
            marginTop: 12,
          }}
        >
          {item.subtitle}
        </TextWrapper>
      </Animated.View>
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────

export default function IntroScreen() {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const handleContinue = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.push("/onboarding" as never);
    }
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <Animated.FlatList
        ref={flatListRef as never}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Bottom section */}
      <View className="px-6 pb-10" style={{ gap: 20 }}>
        {/* Dots */}
        <View
          className="flex-row items-center justify-center"
          style={{ gap: 6 }}
        >
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Connect button */}
        <Pressable3D
          className="items-center justify-center rounded-2xl bg-[#1A1A1A] py-5 mb-20"
          shadowColor="#000"
          onPress={handleContinue}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#fff" }}>
            {isLastSlide ? "Get Started" : "Continue"}
          </TextWrapper>
        </Pressable3D>
      </View>
    </View>
  );
}
