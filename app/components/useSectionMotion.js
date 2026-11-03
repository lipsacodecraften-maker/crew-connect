"use client";

import { useEffect } from "react";

export default function useSectionMotion(rootSelector) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root || !("IntersectionObserver" in window)) return undefined;

    const sections = [...root.querySelectorAll(":scope > section, :scope > header")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("cc-motion-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" },
    );

    sections.forEach((section, index) => {
      section.classList.add("cc-motion-ready");
      section.style.setProperty("--cc-motion-delay", `${(index % 3) * 65}ms`);
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [rootSelector]);
}
