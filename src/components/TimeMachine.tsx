"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Comic_Neue, Montserrat, Orbitron, Space_Grotesk } from "next/font/google";
import { LightSpeed } from "@/components/ui/light-speed";
import { jumpSfx, type Charge } from "@/lib/jumpsfx";
import { uiHover, uiPress } from "@/lib/sound";
import { JUMP_EVENT, yearOf, type JumpRequest } from "@/lib/timejump";
import "./time-machine.css";

// The arrival card speaks in the destination's own type. Not preloaded: these
// faces only download the first time a jump actually shows them.
const comic = Comic_Neue({ variable: "--tm-comic", weight: "700", subsets: ["latin"], preload: false });
const montserrat = Montserrat({ variable: "--tm-montserrat", weight: ["400", "600"], subsets: ["latin"], preload: false });
const grotesk = Space_Grotesk({ variable: "--tm-grotesk", weight: ["400", "500"], subsets: ["latin"], preload: false });
const orbitron = Orbitron({ variable: "--tm-orbitron", weight: ["400", "700"], subsets: ["latin"], preload: false });
const FACES = [comic, montserrat, grotesk, orbitron].map((f) => f.variable).join(" ");

/** What each era says before you jump into it. */
const ARRIVALS: Record<number, { title: string; line: string }> = {
  1986: { title: "Carrier detected", line: "CONNECT 2400. Dialling Dev's BBS. Please don't pick up the phone." },
  1996: { title: "Welcome to the Information Superhighway!", line: "Now loading at 28.8k. Best viewed in Netscape Navigator 3.0." },
  2006: { title: "Now in Beta", line: "Syncing your RSS feed and making every button shiny." },
  2016: { title: "Everything is flat now.", line: "Even the buttons. Especially the buttons." },
  2036: { title: "Neural handshake in progress", line: "Keep your Neuralink™ close to your ear." },
  2046: { title: "Browsers were discontinued in 2041.", line: "Rendering a visual copy for your eyes anyway." },
};

/**
 * arm     - the portal opens from the pressed year; read the message, then press and hold
 * transit - full charge launches: tunnel at speed, years rolling past (never shorter than trip)
 * arrive  - the tunnel irises open onto the new era
 * abort   - "stay" or Escape: the portal closes back into the year you pressed
 */
type Phase = "arm" | "transit" | "arrive" | "abort";
type Jump = { from: number; to: number; x: number; y: number; phase: Phase; reduced: boolean };

const HOLD_MS = 1400;
const FULL = { trip: 3400, arrive: 1000, abort: 420, giveUp: 10000 };
const CALM = { trip: 1400, arrive: 320, abort: 200, giveUp: 10000 };

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export default function TimeMachine() {
  const router = useRouter();
  const [jump, setJump] = useState<Jump | null>(null);
  const [holding, setHolding] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  // Live state for handlers and frame loops; render reads `jump` only.
  const ctl = useRef({
    busy: false,
    href: "",
    from: 0,
    to: 0,
    reduced: false,
    opener: null as HTMLElement | null,
    phase: "arm" as Phase,
    charge: 0,
    pressed: false,
    raf: 0,
    sound: null as Charge | null,
    timers: [] as number[],
  });

  const setPhase = (phase: Phase) => {
    ctl.current.phase = phase;
    setJump((j) => j && { ...j, phase });
  };

  const finish = (focusOpener: boolean) => {
    const c = ctl.current;
    cancelAnimationFrame(c.raf);
    c.timers.forEach(clearTimeout);
    c.timers = [];
    setJump(null);
    setHolding(false);
    delete document.documentElement.dataset.jump;
    c.busy = false;
    if (focusOpener && c.opener?.isConnected) c.opener.focus({ preventScroll: true });
  };

  // ---------- open ----------------------------------------------------------------
  useEffect(() => {
    const onJump = (e: Event) => {
      const { href, x, y, opener } = (e as CustomEvent<JumpRequest>).detail;
      const c = ctl.current;
      if (c.busy || href === window.location.pathname) return;
      Object.assign(c, {
        busy: true,
        href,
        from: yearOf(window.location.pathname),
        to: yearOf(href),
        reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        opener,
        phase: "arm",
        charge: 0,
        pressed: false,
      });
      router.prefetch(href);
      document.documentElement.dataset.jump = "out";
      setJump({ from: c.from, to: c.to, x, y, phase: "arm", reduced: c.reduced });
      jumpSfx.open();
    };
    window.addEventListener(JUMP_EVENT, onJump);
    return () => window.removeEventListener(JUMP_EVENT, onJump);
  }, [router]);

  useEffect(() => {
    const c = ctl.current;
    return () => c.timers.forEach(clearTimeout);
  }, []);

  // ---------- hold to charge ----------------------------------------------------------
  const runCharge = () => {
    const c = ctl.current;
    cancelAnimationFrame(c.raf);
    let last = -1;
    const frame = (now: number) => {
      const dt = last < 0 ? 16 : now - last;
      last = now;
      // fills while held; drains faster than it fills once you let go
      c.charge = Math.min(1, Math.max(0, c.charge + (c.pressed ? dt / HOLD_MS : -dt / (HOLD_MS * 0.4))));
      rootRef.current?.style.setProperty("--charge", c.charge.toFixed(3));
      c.sound?.set(c.charge);
      if (c.charge >= 1) return launch();
      if (!c.pressed && c.charge <= 0) return;
      c.raf = requestAnimationFrame(frame);
    };
    c.raf = requestAnimationFrame(frame);
  };

  const press = () => {
    const c = ctl.current;
    if (c.phase !== "arm" || c.pressed) return;
    c.pressed = true;
    setHolding(true);
    c.sound = jumpSfx.charge();
    c.sound.set(c.charge);
    runCharge();
  };

  const release = () => {
    const c = ctl.current;
    if (!c.pressed || c.phase !== "arm") return;
    c.pressed = false;
    setHolding(false);
    c.sound?.release();
    c.sound = null;
  };

  // ---------- launch, travel, land ----------------------------------------------------
  const launch = () => {
    const c = ctl.current;
    const t = c.reduced ? CALM : FULL;
    c.pressed = false;
    setHolding(false);
    c.sound?.commit();
    c.sound = null;
    jumpSfx.launch(t.trip / 1000, c.to > c.from);
    navigator.vibrate?.(35);
    setPhase("transit");
    router.push(c.href);

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      if (!c.reduced && yearRef.current) {
        const p = Math.min(1, Math.max(0, (elapsed - 150) / (t.trip - 450)));
        yearRef.current.textContent = String(Math.round(c.from + (c.to - c.from) * easeInOut(p)));
      }
      const landed = window.location.pathname === c.href;
      if ((elapsed >= t.trip && landed) || elapsed >= t.giveUp) {
        if (yearRef.current) yearRef.current.textContent = String(c.to);
        jumpSfx.land();
        setPhase("arrive");
        document.documentElement.dataset.jump = "in";
        c.timers.push(window.setTimeout(() => finish(false), t.arrive));
        return;
      }
      c.raf = requestAnimationFrame(tick);
    };
    c.raf = requestAnimationFrame(tick);
  };

  const abort = () => {
    const c = ctl.current;
    if (c.phase !== "arm") return;
    c.pressed = false;
    cancelAnimationFrame(c.raf);
    c.sound?.release();
    c.sound = null;
    jumpSfx.stop();
    setPhase("abort");
    document.documentElement.dataset.jump = "in";
    c.timers.push(window.setTimeout(() => finish(true), (c.reduced ? CALM : FULL).abort));
  };

  if (!jump) return null;

  const { from, to, x, y, phase, reduced } = jump;
  const words = ARRIVALS[to] ?? ARRIVALS[1996];
  const delta = to - from;
  const forward = delta > 0;

  return (
    <div
      ref={rootRef}
      className={`tm tm-to-${to} ${FACES}`}
      data-phase={phase}
      data-holding={holding || undefined}
      data-reduced={reduced || undefined}
      style={{ "--ox": `${x}px`, "--oy": `${y}px`, "--charge": 0 } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tm-title"
      aria-describedby="tm-line"
      onKeyDown={(e) => {
        // Escape backs out while the machine is only armed
        if (e.key === "Escape") return abort();
        // two controls: keep Tab inside the machine
        if (e.key !== "Tab") return;
        const stops = rootRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
        if (!stops?.length) return;
        const first = stops[0];
        const last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      {/* idling while armed, then a fresh tunnel at full speed; backwards in time it runs the other way */}
      {!reduced && (
        <LightSpeed
          key={phase === "arm" ? "idle" : "go"}
          className="tm-tunnel"
          speed={phase === "arm" ? (forward ? 0.22 : -0.22) : forward ? 1.6 : -1.6}
        />
      )}
      <span className="tm-flash" aria-hidden="true" />

      <div className="tm-hud">
        <span className="tm-year" ref={yearRef} aria-hidden="true">
          {phase === "arrive" ? to : from}
        </span>
        <span className="tm-route">
          <span>{from}</span>
          <svg viewBox="0 0 28 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 5h25M21.5 1 26 5l-4.5 4" />
          </svg>
          <span>{to}</span>
          <span className="tm-delta">
            {forward ? "+" : "−"}
            {Math.abs(delta)} years
          </span>
        </span>

        <div className="tm-card">
          <p className="tm-card-title" id="tm-title">
            {words.title}
          </p>
          <p className="tm-card-line" id="tm-line">
            {words.line}
          </p>
        </div>

        <div className="tm-controls">
          <button
            type="button"
            className="tm-hold"
            autoFocus
            disabled={phase !== "arm"}
            aria-label={`Press and hold to jump to ${to}`}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              press();
            }}
            onPointerEnter={(e) => e.pointerType === "mouse" && phase === "arm" && uiHover()}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                press();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") release();
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg className="tm-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="tm-ring-track" cx="50" cy="50" r="46" />
              <circle className="tm-ring-fill" cx="50" cy="50" r="46" pathLength="1" />
            </svg>
            <svg className="tm-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {forward ? <path d="M4 6l7 6-7 6M12 6l7 6-7 6" /> : <path d="M20 6l-7 6 7 6M12 6l-7 6 7 6" />}
            </svg>
          </button>
          <p className="tm-hint" aria-hidden="true">
            <span className="tm-hint-idle">Hold to jump to {to}</span>
            <span className="tm-hint-busy">Keep holding…</span>
          </p>
          <button
            type="button"
            className="tm-stay"
            onPointerEnter={(e) => e.pointerType === "mouse" && phase === "arm" && uiHover()}
            onClick={() => {
              uiPress();
              abort();
            }}
            disabled={phase !== "arm"}
          >
            Stay in {from}
          </button>
        </div>
      </div>
    </div>
  );
}
