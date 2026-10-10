"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Comic_Neue, Montserrat, Orbitron, Space_Grotesk } from "next/font/google";
import { LightSpeed } from "@/components/ui/light-speed";
import { timeWarp } from "@/lib/sound";
import { JUMP_EVENT, yearOf, type JumpRequest } from "@/lib/timejump";
import "./time-machine.css";

// The arrival card speaks in the destination's own type. Not preloaded: these
// faces only download the first time a jump actually shows them.
const comic = Comic_Neue({ variable: "--tm-comic", weight: "700", subsets: ["latin"], preload: false });
const montserrat = Montserrat({ variable: "--tm-montserrat", weight: ["400", "600"], subsets: ["latin"], preload: false });
const grotesk = Space_Grotesk({ variable: "--tm-grotesk", weight: ["400", "500"], subsets: ["latin"], preload: false });
const orbitron = Orbitron({ variable: "--tm-orbitron", weight: ["400", "700"], subsets: ["latin"], preload: false });
const FACES = [comic, montserrat, grotesk, orbitron].map((f) => f.variable).join(" ");

/** What each era says as you arrive in it. */
const ARRIVALS: Record<number, { title: string; line: string }> = {
  1986: { title: "Carrier detected", line: "CONNECT 2400. Dialling Dev's BBS. Please don't pick up the phone." },
  1996: { title: "Welcome to the Information Superhighway!", line: "Now loading at 28.8k. Best viewed in Netscape Navigator 3.0." },
  2006: { title: "Now in Beta", line: "Syncing your RSS feed and making every button shiny." },
  2016: { title: "Everything is flat now.", line: "Even the buttons. Especially the buttons." },
  2036: { title: "Neural handshake in progress", line: "Keep your Neuralink™ close to your ear." },
  2046: { title: "Browsers were discontinued in 2041.", line: "Rendering a visual copy for your eyes anyway." },
};

type Phase = "depart" | "transit" | "arrive";
type Jump = { from: number; to: number; x: number; y: number; phase: Phase; reduced: boolean };

// depart: the portal opens from the pressed control; transit: the years roll past
// (never shorter than minTotal, however fast the route loads); arrive: the tunnel
// irises open onto the new era. giveUp lands even if navigation never finishes.
const FULL = { depart: 700, minTotal: 4800, arrive: 1000, giveUp: 10000 };
const CALM = { depart: 220, minTotal: 3200, arrive: 320, giveUp: 10000 };

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export default function TimeMachine() {
  const router = useRouter();
  const [jump, setJump] = useState<Jump | null>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];
    let raf = 0;

    const onJump = (e: Event) => {
      const { href, x, y } = (e as CustomEvent<JumpRequest>).detail;
      const here = window.location.pathname;
      if (busy.current || href === here) return;
      busy.current = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = reduced ? CALM : FULL;
      const from = yearOf(here);
      const to = yearOf(href);

      router.prefetch(href);
      setJump({ from, to, x, y, phase: "depart", reduced });
      root.dataset.jump = "out";
      timeWarp({ depart: t.depart / 1000, land: t.minTotal / 1000 }, to > from);

      timers.push(
        window.setTimeout(() => {
          router.push(href);
          setJump((j) => j && { ...j, phase: "transit" });
        }, t.depart),
      );

      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        if (!reduced && yearRef.current) {
          const p = Math.min(1, Math.max(0, (elapsed - t.depart * 0.6) / (t.minTotal - t.depart * 0.6 - 250)));
          yearRef.current.textContent = String(Math.round(from + (to - from) * easeInOut(p)));
        }
        const landed = window.location.pathname === href;
        if ((elapsed >= t.minTotal && landed) || elapsed >= t.giveUp) {
          if (yearRef.current) yearRef.current.textContent = String(to);
          setJump((j) => j && { ...j, phase: "arrive" });
          root.dataset.jump = "in";
          timers.push(
            window.setTimeout(() => {
              setJump(null);
              delete root.dataset.jump;
              busy.current = false;
            }, t.arrive),
          );
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(JUMP_EVENT, onJump);
    return () => {
      window.removeEventListener(JUMP_EVENT, onJump);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [router]);

  if (!jump) return null;

  const { from, to, x, y, phase, reduced } = jump;
  const words = ARRIVALS[to] ?? ARRIVALS[1996];
  const delta = to - from;

  return (
    <div
      className={`tm tm-to-${to} ${FACES}`}
      data-phase={phase}
      data-reduced={reduced || undefined}
      style={{ "--ox": `${x}px`, "--oy": `${y}px` } as React.CSSProperties}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        Travelling from {from} to {to}. {words.title} {words.line}
      </span>

      {/* backwards in time, the tunnel runs the other way */}
      {!reduced && <LightSpeed className="tm-tunnel" speed={delta > 0 ? 1.5 : -1.5} />}

      <div className="tm-hud" aria-hidden="true">
        <span className="tm-year" ref={yearRef}>
          {reduced ? to : from}
        </span>
        <span className="tm-route">
          <span>{from}</span>
          <svg viewBox="0 0 28 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 5h25M21.5 1 26 5l-4.5 4" />
          </svg>
          <span>{to}</span>
          <span className="tm-delta">
            {delta > 0 ? "+" : "−"}
            {Math.abs(delta)} years
          </span>
        </span>
        <div className="tm-card">
          <p className="tm-card-title">{words.title}</p>
          <p className="tm-card-line">{words.line}</p>
        </div>
      </div>
    </div>
  );
}
