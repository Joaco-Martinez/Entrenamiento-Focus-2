"use client";

import { useEffect, useState } from "react";

export function MouseGlowBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07070a]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060608_0%,#0b0b0f_45%,#08080b_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_30%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_45%)]" />

      <div
        className="absolute left-[6%] top-[10%] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/18 blur-[120px]"
        style={{
          transform: `translate(${mouse.x * 18}px, ${mouse.y * 12}px)`,
          animation: "floatOne 16s ease-in-out infinite",
        }}
      />

      <div
        className="absolute right-[8%] top-[12%] h-[420px] w-[420px] rounded-full bg-amber-100/12 blur-[110px]"
        style={{
          transform: `translate(${mouse.x * -14}px, ${mouse.y * 10}px)`,
          animation: "floatTwo 19s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[14%] bottom-[2%] h-[460px] w-[460px] rounded-full bg-yellow-400/14 blur-[115px]"
        style={{
          transform: `translate(${mouse.x * 12}px, ${mouse.y * -14}px)`,
          animation: "floatThree 18s ease-in-out infinite",
        }}
      />

      <div
        className="absolute right-[12%] bottom-[8%] h-[360px] w-[360px] rounded-full bg-white/10 blur-[100px]"
        style={{
          transform: `translate(${mouse.x * -10}px, ${mouse.y * -10}px)`,
          animation: "floatFour 22s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[42%] top-[18%] h-[280px] w-[280px] rounded-full bg-[#D4AF37]/14 blur-[85px]"
        style={{
          transform: `translate(${mouse.x * 8}px, ${mouse.y * 6}px)`,
          animation: "floatFive 14s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[54%] top-[54%] h-[300px] w-[300px] rounded-full bg-orange-100/10 blur-[90px]"
        style={{
          transform: `translate(${mouse.x * -8}px, ${mouse.y * 10}px)`,
          animation: "floatSix 20s ease-in-out infinite",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_42%,rgba(0,0,0,0.38)_100%)]" />

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:46px_46px]" />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <style jsx>{`
        @keyframes floatOne {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: 24px;
            margin-top: -18px;
            transform: scale(1.04);
          }
          50% {
            margin-left: -16px;
            margin-top: 14px;
            transform: scale(0.98);
          }
          75% {
            margin-left: 20px;
            margin-top: 10px;
            transform: scale(1.03);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }

        @keyframes floatTwo {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: -18px;
            margin-top: 22px;
            transform: scale(1.03);
          }
          50% {
            margin-left: 14px;
            margin-top: -16px;
            transform: scale(0.97);
          }
          75% {
            margin-left: -22px;
            margin-top: -8px;
            transform: scale(1.02);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }

        @keyframes floatThree {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: 18px;
            margin-top: -24px;
            transform: scale(1.02);
          }
          50% {
            margin-left: -20px;
            margin-top: 18px;
            transform: scale(0.98);
          }
          75% {
            margin-left: 14px;
            margin-top: 10px;
            transform: scale(1.04);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }

        @keyframes floatFour {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: -16px;
            margin-top: -14px;
            transform: scale(1.04);
          }
          50% {
            margin-left: 12px;
            margin-top: 16px;
            transform: scale(0.98);
          }
          75% {
            margin-left: -10px;
            margin-top: 8px;
            transform: scale(1.02);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }

        @keyframes floatFive {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: 10px;
            margin-top: -12px;
            transform: scale(1.03);
          }
          50% {
            margin-left: -12px;
            margin-top: 8px;
            transform: scale(0.98);
          }
          75% {
            margin-left: 8px;
            margin-top: 10px;
            transform: scale(1.02);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }

        @keyframes floatSix {
          0% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
          25% {
            margin-left: -14px;
            margin-top: 10px;
            transform: scale(1.02);
          }
          50% {
            margin-left: 10px;
            margin-top: -12px;
            transform: scale(0.98);
          }
          75% {
            margin-left: -8px;
            margin-top: -6px;
            transform: scale(1.03);
          }
          100% {
            margin-left: 0px;
            margin-top: 0px;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}