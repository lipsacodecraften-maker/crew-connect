"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  pad = 0,
  duration = 1800,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  pad?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let frameId = 0;
    let startTime: number | undefined;

    const animate = (timestamp: number) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setCount(value * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [started, value, duration]);

  const formattedValue = count.toFixed(decimals);
  const displayValue = formattedValue.padStart(
    formattedValue.indexOf(".") === -1 ? pad : formattedValue.indexOf("."),
    "0",
  );

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
