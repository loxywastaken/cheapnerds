"use client";

import { useEffect, useRef } from "react";

type Sparkle = { x: number; y: number; vy: number; size: number; color: string; phase: number; speed: number; star: boolean };

const COLORS = ["255, 226, 110", "255, 190, 60", "255, 255, 255", "190, 222, 245"];

/**
 * Twinkling sparkle field inspired by the logo's starburst: tiny glints and a few
 * four-point stars drift slowly upward and pulse. Pauses off-screen and renders a
 * single still frame for visitors who prefer reduced motion.
 */
export function Particles({ className, density = 0.00007 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let sparkles: Sparkle[] = [];
    let frame = 0;
    let visible = true;
    let t = 0;

    const make = (y = Math.random() * height): Sparkle => {
      const star = Math.random() < 0.18;
      return {
        x: Math.random() * width,
        y,
        vy: -(Math.random() * 0.12 + 0.03),
        size: star ? Math.random() * 5 + 4 : Math.random() * 1.3 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.008,
        star,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.max(30, Math.floor(width * height * density)));
      sparkles = Array.from({ length: count }, () => make());
    };

    const drawStar = (s: Sparkle, alpha: number) => {
      const r = s.size;
      ctx.save();
      ctx.translate(s.x, s.y);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
      glow.addColorStop(0, `rgba(${s.color}, ${alpha * 0.35})`);
      glow.addColorStop(1, `rgba(${s.color}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
      ctx.beginPath();
      // Four-point "twinkle" star with concave sides.
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        if (!reduce) {
          s.y += s.vy;
          s.phase += s.speed;
          if (s.y < -12) sparkles[i] = make(height + 12);
        }
        const twinkle = 0.5 + 0.5 * Math.sin(s.phase + t * 0.002);
        const alpha = s.star ? 0.25 + twinkle * 0.6 : 0.15 + twinkle * 0.55;
        if (s.star) drawStar(s, alpha);
        else {
          ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = () => {
      t += 16;
      draw();
      if (visible && !reduce) frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) loop();
    });

    resize();
    loop();
    observer.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
