"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

export default function MouseGlowBackground() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });

  const mouse = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  });

  const config = useMemo(
    () => ({
      dustCount: 90,
      bars: 48,
      waveLines: 4,
      maxBarHeight: 90,
      baseBarHeight: 12,
    }),
    []
  );

  useEffect(() => {
    const updateSize = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    mouse.current.x = size.width * 0.5;
    mouse.current.y = size.height * 0.3;
    mouse.current.tx = size.width * 0.5;
    mouse.current.ty = size.height * 0.3;
  }, [size.width, size.height]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();

      mouse.current.tx = e.clientX - rect.left;
      mouse.current.ty = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouse.current.tx = size.width * 0.5;
      mouse.current.ty = size.height * 0.28;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [size.width, size.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const dust: DustParticle[] = Array.from({ length: config.dustCount }).map(() => ({
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.4 + 0.08,
    }));

    const drawBackground = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, size.height);
      bg.addColorStop(0, "#07070a");
      bg.addColorStop(0.32, "#0b0b0f");
      bg.addColorStop(0.65, "#101015");
      bg.addColorStop(1, "#050507");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawTopAura = () => {
      const gradient = ctx.createRadialGradient(
        size.width * 0.5,
        0,
        0,
        size.width * 0.5,
        0,
        size.width * 0.6
      );

      gradient.addColorStop(0, "rgba(212,175,55,0.16)");
      gradient.addColorStop(0.22, "rgba(212,175,55,0.08)");
      gradient.addColorStop(0.55, "rgba(244,217,124,0.03)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawMouseHalo = () => {
      const gradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        240
      );

      gradient.addColorStop(0, "rgba(212,175,55,0.14)");
      gradient.addColorStop(0.2, "rgba(212,175,55,0.09)");
      gradient.addColorStop(0.5, "rgba(244,217,124,0.035)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawCenterPulse = (time: number) => {
      const cx = size.width * 0.5 + (mouse.current.x - size.width * 0.5) * 0.025;
      const cy = size.height * 0.42 + (mouse.current.y - size.height * 0.42) * 0.02;

      const pulse = 8 * Math.sin(time * 0.0022) + 10;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 110 + i * 38 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle =
          i === 1
            ? "rgba(212,175,55,0.10)"
            : "rgba(255,255,255,0.035)";
        ctx.lineWidth = i === 1 ? 1.1 : 0.8;
        ctx.stroke();
      }

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
      core.addColorStop(0, "rgba(244,217,124,0.12)");
      core.addColorStop(0.45, "rgba(212,175,55,0.06)");
      core.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawAudioWaves = (time: number) => {
      const baseY = size.height * 0.58;
      const mouseOffset = (mouse.current.x - size.width / 2) * 0.0009;

      for (let line = 0; line < config.waveLines; line++) {
        const amplitude = 16 + line * 10;
        const speed = 0.0016 + line * 0.00035;
        const offsetY = line * 22;
        const opacity = line === 1 ? 0.15 : line === 2 ? 0.08 : 0.05;

        ctx.beginPath();

        for (let x = 0; x <= size.width; x += 6) {
          const y =
            baseY +
            offsetY +
            Math.sin(x * 0.012 + time * speed + line * 0.8 + mouseOffset * 20) *
              amplitude +
            Math.cos(x * 0.005 + time * speed * 1.7) * (amplitude * 0.35);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle =
          line === 1
            ? `rgba(212,175,55,${opacity})`
            : `rgba(255,255,255,${opacity})`;

        ctx.lineWidth = line === 1 ? 1.4 : 1;
        ctx.stroke();
      }
    };



    const drawDust = () => {
      for (const p of dust) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 160) {
          const force = (160 - dist) / 160;
          p.vx -= (dx / Math.max(dist, 1)) * force * 0.003;
          p.vy -= (dy / Math.max(dist, 1)) * force * 0.003;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (p.x < 0) p.x = size.width;
        if (p.x > size.width) p.x = 0;
        if (p.y < 0) p.y = size.height;
        if (p.y > size.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          Math.random() > 0.9
            ? `rgba(244,217,124,${p.alpha})`
            : `rgba(255,255,255,${p.alpha * 0.55})`;
        ctx.fill();
      }
    };

    const drawScanLines = () => {
      for (let y = 0; y < size.height; y += 4) {
        ctx.fillStyle = "rgba(255,255,255,0.012)";
        ctx.fillRect(0, y, size.width, 1);
      }
    };

    const drawVignette = () => {
      const vignette = ctx.createRadialGradient(
        size.width * 0.5,
        size.height * 0.45,
        size.width * 0.15,
        size.width * 0.5,
        size.height * 0.5,
        size.width * 0.72
      );

      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.6, "rgba(0,0,0,0.15)");
      vignette.addColorStop(1, "rgba(0,0,0,0.42)");

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const render = (time: number) => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.075;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.075;

      ctx.clearRect(0, 0, size.width, size.height);

      drawBackground();
    //   drawTopAura();
      drawCenterPulse(time);
      drawAudioWaves(time);
      drawDust();
    //   drawMouseHalo();
      drawScanLines();
      drawVignette();
      

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [size, config]);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.15),rgba(0,0,0,0.38))]" />
    </div>
  );
}