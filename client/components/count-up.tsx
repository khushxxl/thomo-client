import { useEffect, useRef, useState } from "react";
import { type TextStyle, type StyleProp } from "react-native";
import { TextWrapper, type TextWrapperProps } from "@/components/text-wrapper";

function easeOutQuad(t: number) {
  return t * (2 - t);
}

function formatNumber(num: number, separator: boolean) {
  const str = num.toString();
  if (!separator) return str;
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1200,
  delay = 500,
  style,
  weight = "bold",
  separator = true,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
  weight?: TextWrapperProps["weight"];
  separator?: boolean;
}) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const current = Math.round(easedProgress * to);
        setDisplay(`${prefix}${formatNumber(current, separator)}${suffix}`);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, prefix, suffix, duration, delay, separator]);

  return (
    <TextWrapper weight={weight} style={style}>
      {display}
    </TextWrapper>
  );
}
