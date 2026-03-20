"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

export default function MentoriaBackground() {
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
      particlesCount: 120,
      waveLines: 5,
      beamCount: 3,
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
    mouse.current.y = size.height * 0.25;
    mouse.current.tx = size.width * 0.5;
    mouse.current.ty = size.height * 0.25;
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
      mouse.current.ty = size.height * 0.25;
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

    const particles: Particle[] = Array.from({
      length: config.particlesCount,
    }).map(() => ({
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.45 + 0.05,
    }));

    const drawBackground = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, size.height);
      bg.addColorStop(0, "#050507");
      bg.addColorStop(0.2, "#08080c");
      bg.addColorStop(0.5, "#0c0c12");
      bg.addColorStop(0.8, "#09090d");
      bg.addColorStop(1, "#040405");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawTopGlow = () => {
      const gradient = ctx.createRadialGradient(
        size.width * 0.5,
        0,
        0,
        size.width * 0.5,
        0,
        size.width * 0.7
      );

      gradient.addColorStop(0, "rgba(212,175,55,0.18)");
      gradient.addColorStop(0.18, "rgba(212,175,55,0.10)");
      gradient.addColorStop(0.45, "rgba(244,217,124,0.035)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawMouseGlow = () => {
      const gradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        260
      );

      gradient.addColorStop(0, "rgba(212,175,55,0.12)");
      gradient.addColorStop(0.2, "rgba(212,175,55,0.075)");
      gradient.addColorStop(0.5, "rgba(244,217,124,0.03)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawVerticalBeams = (time: number) => {
      for (let i = 0; i < config.beamCount; i++) {
        const beamX =
          size.width * (0.2 + i * 0.3) +
          Math.sin(time * 0.00025 + i * 1.8) * 25;

        const beamWidth = 180 + i * 30;
        const gradient = ctx.createLinearGradient(
          beamX,
          0,
          beamX + beamWidth,
          0
        );

        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.5, i === 1 ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.025)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(beamX, 0, beamWidth, size.height);
      }
    };

    const drawCenterAura = (time: number) => {
      const cx = size.width * 0.5 + (mouse.current.x - size.width * 0.5) * 0.03;
      const cy = size.height * 0.36 + Math.sin(time * 0.0012) * 8;
      const pulse = Math.sin(time * 0.002) * 10;

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 90 + i * 34 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle =
          i === 1
            ? "rgba(212,175,55,0.10)"
            : "rgba(255,255,255,0.03)";
        ctx.lineWidth = i === 1 ? 1.25 : 0.8;
        ctx.stroke();
      }

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
      core.addColorStop(0, "rgba(244,217,124,0.12)");
      core.addColorStop(0.3, "rgba(212,175,55,0.06)");
      core.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawFlowLines = (time: number) => {
      const centerPull = (mouse.current.x - size.width / 2) * 0.0014;

      for (let line = 0; line < config.waveLines; line++) {
        const baseY = size.height * (0.42 + line * 0.09);
        const amplitude = 12 + line * 7;
        const speed = 0.0012 + line * 0.00025;
        const opacity = line === 2 ? 0.16 : line === 1 ? 0.08 : 0.045;

        ctx.beginPath();

        for (let x = 0; x <= size.width; x += 8) {
          const y =
            baseY +
            Math.sin(x * 0.01 + time * speed + line * 0.9 + centerPull * 20) *
              amplitude +
            Math.cos(x * 0.0045 + time * speed * 1.6 + line) *
              amplitude *
              0.45;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle =
          line === 2
            ? `rgba(212,175,55,${opacity})`
            : `rgba(255,255,255,${opacity})`;

        ctx.lineWidth = line === 2 ? 1.5 : 1;
        ctx.stroke();
      }
    };

    const drawParticles = () => {
      for (const p of particles) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx -= (dx / Math.max(dist, 1)) * force * 0.004;
          p.vy -= (dy / Math.max(dist, 1)) * force * 0.004;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.992;
        p.vy *= 0.992;

        if (p.x < -10) p.x = size.width + 10;
        if (p.x > size.width + 10) p.x = -10;
        if (p.y < -10) p.y = size.height + 10;
        if (p.y > size.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          Math.random() > 0.92
            ? `rgba(244,217,124,${p.alpha})`
            : `rgba(255,255,255,${p.alpha * 0.45})`;
        ctx.fill();
      }
    };

    const drawGridFade = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;

      for (let x = 0; x < size.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.height);
        ctx.stroke();
      }

      for (let y = 0; y < size.height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawNoiseLines = () => {
      for (let y = 0; y < size.height; y += 5) {
        ctx.fillStyle = "rgba(255,255,255,0.01)";
        ctx.fillRect(0, y, size.width, 1);
      }
    };

    const drawVignette = () => {
      const vignette = ctx.createRadialGradient(
        size.width * 0.5,
        size.height * 0.45,
        size.width * 0.12,
        size.width * 0.5,
        size.height * 0.5,
        size.width * 0.76
      );

      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.65, "rgba(0,0,0,0.18)");
      vignette.addColorStop(1, "rgba(0,0,0,0.5)");

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const render = (time: number) => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.06;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.06;

      ctx.clearRect(0, 0, size.width, size.height);

      drawBackground();
      drawTopGlow();
      drawVerticalBeams(time);
      drawCenterAura(time);
      drawFlowLines(time);
      drawParticles();
      drawMouseGlow();
      drawGridFade();
      drawNoiseLines();
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
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.14),rgba(0,0,0,0.36))]" />
    </div>
  );
}