"use client";

import { useEffect, useRef } from "react";

const metrics = [
  {
    id: 1,
    target: 99.4,
    decimals: 1,
    suffix: "%",
    label: "ON-TIME SHIFT CHECK-IN",
  },
  {
    id: 2,
    target: 90,
    prefix: "< ",
    suffix: " MIN",
    label: "STANDBY EMERGENCY DISPATCH",
  },
  {
    id: 3,
    target: 10000,
    suffix: "+",
    label: "SHIFTS EXECUTED (2024–25)",
  },
  {
    id: 4,
    target: 0,
    label: "STATUTORY NON-COMPLIANCE INCIDENTS",
  },
] as const;

export default function MetricsCounter() {
  const metricsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = metricsRef.current;
    if (!section) return;

    const counters = section.querySelectorAll(".cc-metric-value");
    let animationFrames: number[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        counters.forEach((counter) => {
          const el = counter as HTMLElement;
          const target = Number(el.dataset.target);
          const decimals = Number(el.dataset.decimals || 0);
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";

          const duration = 1600;
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = target * eased;

            const formatted = current.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });

            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
              const frame = requestAnimationFrame(animate);
              animationFrames.push(frame);
            }
          };

          const frame = requestAnimationFrame(animate);
          animationFrames.push(frame);
        });

        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      animationFrames.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <>
      <div className="cc-metrics-grid" ref={metricsRef}>
        {metrics.map((metric) => (
          <div className="cc-metric-card" key={metric.id}>
            <span className="cc-metric-index"></span>

            <strong
              className="cc-metric-value"
              data-target={metric.target}
              data-decimals={(metric as any).decimals || 0}
              data-prefix={(metric as any).prefix || ""}
              data-suffix={(metric as any).suffix || ""}
            >
              {(metric as any).prefix || ""}
              {metric.target.toLocaleString("en-US", {
                minimumFractionDigits: (metric as any).decimals || 0,
                maximumFractionDigits: (metric as any).decimals || 0,
              })}
              {(metric as any).suffix || ""}
            </strong>

            <span className="cc-metric-label">{metric.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
