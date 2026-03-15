"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

export default function MouseGlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const mouse = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  });

  const [size, setSize] = useState({ width: 0, height: 0 });

  const config = useMemo(
    () => ({
      particleCount: 65,
      linkDistance: 125,
      mouseInfluence: 180,
      baseSpeed: 0.18,
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

    const resizeObserver = new ResizeObserver(() => updateSize());
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

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

    const particles: Particle[] = Array.from({ length: config.particleCount }).map(() => ({
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: (Math.random() - 0.5) * config.baseSpeed,
      vy: (Math.random() - 0.5) * config.baseSpeed,
      r: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.45 + 0.2,
    }));

    const drawBase = () => {
      const bg = ctx.createLinearGradient(0, 0, size.width, size.height);
      bg.addColorStop(0, "#0b0b0f");
      bg.addColorStop(0.45, "#101015");
      bg.addColorStop(0.75, "#0d0d11");
      bg.addColorStop(1, "#07070a");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawTopAurora = () => {
      const g = ctx.createRadialGradient(
        size.width * 0.5,
        -40,
        0,
        size.width * 0.5,
        -40,
        size.width * 0.55
      );

      g.addColorStop(0, "rgba(212, 175, 55, 0.18)");
      g.addColorStop(0.3, "rgba(212, 175, 55, 0.10)");
      g.addColorStop(0.6, "rgba(244, 217, 124, 0.05)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawMouseGlow = () => {
      const g = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        260
      );

      g.addColorStop(0, "rgba(212, 175, 55, 0.16)");
      g.addColorStop(0.22, "rgba(212, 175, 55, 0.10)");
      g.addColorStop(0.5, "rgba(244, 217, 124, 0.05)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size.width, size.height);
    };

    const drawNoiseDots = () => {
      for (let i = 0; i < 22; i++) {
        const x = ((i * 127.13) % size.width) + ((mouse.current.x - size.width / 2) * 0.002);
        const y = ((i * 81.77) % size.height) + ((mouse.current.y - size.height / 2) * 0.002);

        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.035)";
        ctx.fill();
      }
    };

    const drawParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dxMouse = mouse.current.x - p.x;
        const dyMouse = mouse.current.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < config.mouseInfluence) {
          const force = (config.mouseInfluence - distMouse) / config.mouseInfluence;
          const angle = Math.atan2(dyMouse, dxMouse);

          p.vx -= Math.cos(angle) * force * 0.0035;
          p.vy -= Math.sin(angle) * force * 0.0035;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (p.x <= 0 || p.x >= size.width) p.vx *= -1;
        if (p.y <= 0 || p.y >= size.height) p.vy *= -1;

        if (p.x < 0) p.x = 0;
        if (p.x > size.width) p.x = size.width;
        if (p.y < 0) p.y = 0;
        if (p.y > size.height) p.y = size.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          i % 6 === 0
            ? `rgba(244, 217, 124, ${p.alpha})`
            : `rgba(255, 255, 255, ${p.alpha * 0.55})`;
        ctx.fill();
      }
    };

    const drawLinks = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.linkDistance) {
            const opacity = (1 - dist / config.linkDistance) * 0.12;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const drawFloatingBands = (time: number) => {
      const t = time * 0.00035;

      for (let i = 0; i < 3; i++) {
        const yBase = size.height * (0.2 + i * 0.18);
        const amplitude = 18 + i * 8;
        const phase = t * (1 + i * 0.18);

        ctx.beginPath();

        for (let x = 0; x <= size.width; x += 8) {
          const y =
            yBase +
            Math.sin(x * 0.008 + phase) * amplitude +
            Math.cos(x * 0.0035 + phase * 1.6) * 8;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle =
          i === 1
            ? "rgba(212, 175, 55, 0.06)"
            : "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = i === 1 ? 1.2 : 1;
        ctx.stroke();
      }
    };

    const render = (time: number) => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.08;

      ctx.clearRect(0, 0, size.width, size.height);

      drawBase();
      drawTopAurora();
      drawFloatingBands(time);
      drawLinks();
      drawParticles();
      drawNoiseDots();
      drawMouseGlow();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [size, config]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();

      mouse.current.tx = e.clientX - rect.left;
      mouse.current.ty = e.clientY - rect.top;
      mouse.current.active = true;
    };

    const handleLeave = () => {
      mouse.current.tx = size.width * 0.5;
      mouse.current.ty = size.height * 0.2;
      mouse.current.active = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [size.width, size.height]);

  useEffect(() => {
    mouse.current.x = size.width * 0.5;
    mouse.current.y = size.height * 0.2;
    mouse.current.tx = size.width * 0.5;
    mouse.current.ty = size.height * 0.2;
  }, [size.width, size.height]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.18),rgba(0,0,0,0.35))]" />
    </div>
  );
}