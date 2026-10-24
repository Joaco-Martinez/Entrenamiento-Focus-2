"use client";

import { useEffect, useRef, useState } from "react";
import type { BudgetContent } from "@/services/budgets.service";

// Única isla interactiva del presupuesto público: las cuatro cifras de trayectoria.
// La página y su contenido principal se renderizan en el servidor.
export function AnimatedHighlights({ items }: { items: NonNullable<BudgetContent["highlights"]> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting) || started) return;
      started = true;
      setProgress(0);
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = Math.min(1, (now - start) / 1150);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(step);
        else observer.disconnect();
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const animatedValue = (value: string) => {
    // Preservar métricas editables como "20 M+" y textos no numéricos.
    const parsed = value.match(/^(\d[\d.,]*)(.*)$/);
    if (!parsed) return value;
    const count = Number(parsed[1].replace(/[.,]/g, ""));
    if (!Number.isFinite(count)) return value;
    return Math.round(count * progress).toLocaleString("es-AR") + parsed[2];
  };

  return (
    <div
      ref={containerRef}
      aria-label="Trayectoria profesional"
      className="mt-8 grid grid-cols-2 overflow-hidden rounded-[24px] border border-white/20 bg-[#373630]/85 shadow-[0_18px_40px_rgba(31,26,17,0.10)] backdrop-blur-[8px] md:grid-cols-4"
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="group"
          aria-label={item.value + " " + item.label}
          className={
            "group relative min-w-0 px-5 py-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-[0_12px_28px_rgba(229,189,66,0.09)] motion-reduce:transform-none motion-reduce:transition-none sm:px-7 sm:py-8 " +
            (index % 2 === 0 ? "border-r border-white/10 md:border-r-0 " : "") +
            (index < 2 ? "border-b border-white/10 md:border-b-0 " : "") +
            (index < items.length - 1 ? "md:border-r md:border-white/10 " : "")
          }
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            style={{ background: "radial-gradient(circle at 50% 20%, rgba(229,189,66,0.12), transparent 72%)" }}
          />
          <div className="relative">
            <p
              aria-hidden="true"
              className="whitespace-nowrap text-[32px] font-black leading-none tracking-[-0.045em] text-[#e5bd42] transition-[color,filter] duration-300 group-hover:text-[#f5d779] group-hover:drop-shadow-[0_0_12px_rgba(229,189,66,0.3)] sm:text-[40px]"
            >
              {animatedValue(item.value)}
            </p>
            <div className="mt-4 h-[2px] w-7 rounded-full bg-[#e5bd42]/45 transition-all duration-300 group-hover:w-12 group-hover:bg-[#e5bd42]" />
            <p className="mt-3 max-w-[190px] text-[12px] leading-5 text-[#d8d2c5] sm:text-[13px]">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

