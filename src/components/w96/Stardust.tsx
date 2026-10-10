"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#fff35c", "#5cf6ff", "#ff5cf0", "#a6ff5c"];

type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string };

/** Pixel stardust that trails the mouse pointer, as on every 1996 homepage. */
export default function Stardust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motes: Mote[] = [];
    let raf = 0;
    let running = false;
    let lastSpawn = { x: -1, y: -1 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life++;
        if (m.life > m.max) {
          motes.splice(i, 1);
          continue;
        }
        m.vy += 0.045;
        m.x += m.vx;
        m.y += m.vy;
        // twinkle: blink on alternating frames late in life
        if (m.life > m.max * 0.55 && m.life % 4 < 2) continue;
        const s = m.life > m.max * 0.7 ? Math.max(1, m.size - 1) : m.size;
        ctx.fillStyle = m.color;
        ctx.fillRect(Math.round(m.x), Math.round(m.y), s, s);
        if (m.size >= 3 && m.life < m.max * 0.4) {
          // a tiny cross-shaped glint on the bigger motes
          ctx.fillRect(Math.round(m.x) - 2, Math.round(m.y) + 1, s + 4, 1);
          ctx.fillRect(Math.round(m.x) + 1, Math.round(m.y) - 2, 1, s + 4);
        }
      }
      if (motes.length) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const spawn = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        motes.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.8) * 1.2,
          life: 0,
          max: 26 + Math.random() * 30,
          size: Math.random() < 0.25 ? 3 : 2,
          color: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
      if (motes.length > 260) motes.splice(0, motes.length - 260);
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const move = (e: PointerEvent) => {
      const dx = e.clientX - lastSpawn.x;
      const dy = e.clientY - lastSpawn.y;
      if (dx * dx + dy * dy < 36) return;
      lastSpawn = { x: e.clientX, y: e.clientY };
      spawn(e.clientX, e.clientY, e.pointerType === "mouse" ? 2 : 3);
    };
    const burst = (e: PointerEvent) => spawn(e.clientX, e.clientY, 14);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", burst, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", burst);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="stardust" aria-hidden="true" />;
}
