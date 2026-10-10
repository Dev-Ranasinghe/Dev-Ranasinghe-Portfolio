"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ALIASES, BOARD, HELP, MENU, SECTIONS, welcome, type Line } from "@/lib/content";
import * as sfx from "@/lib/sound";
import YearNav, { useTravel } from "@/components/YearNav";

type NewEntry = { type: "line"; line: Line } | { type: "menu"; shown: number };
type Entry = NewEntry & { id: number };

type Phase = "idle" | "dialing" | "online" | "hungup";

type Game = { target: number; epoch: number };

const MAX_EPOCHS = 7;
const DIAL_DIGITS = "5550198"; // fictional 555 exchange
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writePref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked: preference just won't persist */
  }
}

function lastOn(): string {
  const d = new Date();
  const h = d.getHours();
  const hh = String(((h + 11) % 12) + 1).padStart(2, " ");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} 1986   ${hh}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

export default function Terminal() {
  const [phase, setPhase] = useState<Phase>("idle");
  const sound = useSyncExternalStore(sfx.subscribeSound, sfx.isSoundEnabled, () => true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState<{ line: Line; n: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [game, setGameState] = useState<Game | null>(null);
  const [tear, setTear] = useState<{ top: number; shift: number } | null>(null);
  const travel = useTravel();

  const idRef = useRef(0);
  const skipRef = useRef(false);
  const genRef = useRef(0); // bumps to cancel in-flight output (CLS, hang up)
  const reducedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const setGame = useCallback((g: Game | null) => {
    gameRef.current = g;
    setGameState(g);
  }, []);

  // ---- preferences + environment ----------------------------------------
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const toggleSound = useCallback(() => {
    const next = !sfx.isSoundEnabled();
    sfx.setSoundEnabled(next);
    if (next) {
      sfx.unlockAudio();
      sfx.beep(1200, 0.06);
    }
  }, []);

  // ---- constant CRT tearing glitch ---------------------------------------
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setTear({ top: Math.random() * 90, shift: (Math.random() - 0.5) * 14 });
        setTimeout(() => setTear(null), 90 + Math.random() * 160);
        schedule();
      }, 1400 + Math.random() * 3200);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // ---- block mouse cursor (fine pointers only) ----------------------------
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = cursorRef.current;
    if (!el) return;
    document.documentElement.dataset.blockCursor = "1";
    const move = (e: PointerEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      el.style.opacity = "1";
    };
    const leave = () => (el.style.opacity = "0");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      delete document.documentElement.dataset.blockCursor;
    };
  }, []);

  // ---- keep the newest output in view -----------------------------------
  // follow the output, but never push the start of the current answer above the fold
  const anchorRef = useRef<number | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.clientHeight;
    const anchor = anchorRef.current !== null ? el.querySelector<HTMLElement>(`[data-entry="${anchorRef.current}"]`) : null;
    el.scrollTop = anchor ? Math.min(bottom, anchor.offsetTop - el.offsetTop - 12) : bottom;
  }, [entries, typing, busy]);

  // ---- output engine ------------------------------------------------------
  const push = useCallback((e: NewEntry) => {
    const entry: Entry = { ...e, id: ++idRef.current };
    setEntries((prev) => [...prev, entry]);
    return entry.id;
  }, []);

  /** Streams lines in at "1200 baud", one character at a time. */
  const print = useCallback(
    async (lines: Line[], cps = 170) => {
      const gen = genRef.current;
      for (const line of lines) {
        if (gen !== genRef.current) return;
        const instant = skipRef.current || reducedRef.current || !line.text;
        if (!instant) {
          const step = 2;
          for (let n = 0; n < line.text.length; n += step) {
            if (skipRef.current || gen !== genRef.current) break;
            setTyping({ line, n });
            if (n % 6 === 0) sfx.charTick();
            await sleep((1000 / cps) * step);
          }
        }
        if (gen !== genRef.current) return;
        setTyping(null);
        push({ type: "line", line });
        if (!skipRef.current && !reducedRef.current) await sleep(line.text ? 18 : 40);
      }
    },
    [push],
  );

  const showMenu = useCallback(async () => {
    const gen = genRef.current;
    const id = push({ type: "menu", shown: 0 });
    for (let i = 1; i <= MENU.length; i++) {
      if (gen !== genRef.current) return;
      const fast = skipRef.current || reducedRef.current;
      if (!fast) {
        await sleep(70);
        sfx.beep(660 + i * 40, 0.025);
      }
      setEntries((prev) => prev.map((e) => (e.id === id && e.type === "menu" ? { ...e, shown: i } : e)));
    }
  }, [push]);

  const run = useCallback(async (job: () => Promise<void>) => {
    skipRef.current = false;
    setBusy(true);
    try {
      await job();
    } finally {
      setBusy(false);
      skipRef.current = false;
    }
  }, []);

  // ---- dial-in --------------------------------------------------------------
  const connect = useCallback(async () => {
    if (phase === "dialing") return;
    sfx.unlockAudio();
    genRef.current++;
    setEntries([]);
    setGame(null);
    anchorRef.current = null;
    setPhase("dialing");

    let visits = 1;
    const prev = Number(readPref("bbs-calls") ?? "0");
    if (Number.isFinite(prev)) visits = prev + 1;
    writePref("bbs-calls", String(visits));

    await run(async () => {
      const gen = genRef.current;
      const live = () => gen === genRef.current;
      const wait = (ms: number) => (skipRef.current || reducedRef.current ? Promise.resolve() : sleep(ms));

      sfx.powerOn();
      await wait(600);
      await print([{ text: "ATZ" }, { text: "OK", kind: "dim" }]);
      await print([{ text: "ATDT 555-0198" }]);
      const dialSecs = skipRef.current ? 0 : sfx.dial(DIAL_DIGITS);
      await wait(dialSecs * 1000);
      if (!live()) return;
      await print([{ text: "RINGING...", kind: "dim" }]);
      const ringSecs = skipRef.current ? 0 : sfx.ring(2);
      await wait(ringSecs * 1000);
      if (!live()) return;
      await print([{ text: "CARRIER DETECTED. NEGOTIATING...", kind: "dim" }]);
      const hsSecs = skipRef.current ? 0 : sfx.handshake();
      await wait(hsSecs * 1000);
      if (!live()) return;

      setEntries([]);
      setPhase("online");
      sfx.beep(1000, 0.12);
      await print(welcome(2480 + visits, lastOn()), 140);
      await showMenu();
    });
  }, [phase, print, run, setGame, showMenu]);

  const hangUp = useCallback(async () => {
    sfx.hangUp();
    await print([{ text: "+++ATH0", kind: "dim" }, { text: "" }, { text: "NO CARRIER", kind: "bright" }]);
    setPhase("hungup");
  }, [print]);

  // ---- door game: GRADIENT DESCENT ---------------------------------------
  const startGame = useCallback(async () => {
    const g = { target: 1 + Math.floor(Math.random() * 99), epoch: 0 };
    setGame(g);
    await print([
      { text: "== DOOR GAME: GRADIENT DESCENT ==================", kind: "rule" },
      { text: "A hidden weight w lives somewhere in 1..99." },
      { text: `Guess w each epoch; the optimizer reports your loss and gradient. Converge within ${MAX_EPOCHS} epochs.` },
      { text: "Type a number, or QUIT to leave the door.", kind: "dim" },
    ]);
  }, [print, setGame]);

  const playGame = useCallback(
    async (raw: string) => {
      const g = gameRef.current;
      if (!g) return;
      if (["QUIT", "Q", "EXIT", "MENU"].includes(raw)) {
        setGame(null);
        await print([{ text: "Leaving door. Returning to the board.", kind: "dim" }]);
        await showMenu();
        return;
      }
      const w = Number(raw);
      if (!Number.isInteger(w) || w < 1 || w > 99) {
        sfx.errorBuzz();
        await print([{ text: "NaN in weights. Enter a whole number 1..99.", kind: "error" }]);
        return;
      }
      const epoch = g.epoch + 1;
      const loss = (w - g.target) ** 2;
      if (loss === 0) {
        setGame(null);
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => sfx.beep(f, 0.1), i * 110));
        await print([
          { text: `EPOCH ${epoch}  w=${w}  LOSS 0.000`, kind: "bright" },
          { text: `*** CONVERGED IN ${epoch} EPOCH${epoch > 1 ? "S" : ""}. ***`, kind: "bright" },
          { text: "Hire the optimizer. Type CONTACT.", kind: "dim" },
        ]);
        return;
      }
      sfx.beep(w > g.target ? 520 : 780, 0.07);
      const grad = w > g.target ? "+  step DOWN" : "-  step UP";
      // a noisy minibatch loss: enough signal to descend, not enough to solve in one step
      const noisy = loss * (0.7 + Math.random() * 0.6);
      const out: Line[] = [{ text: `EPOCH ${epoch}  w=${w}  LOSS ~${noisy.toFixed(1)}  GRAD ${grad}` }];
      if (epoch >= MAX_EPOCHS) {
        setGame(null);
        sfx.errorBuzz();
        out.push({ text: `EARLY STOPPING. Optimum was w=${g.target}.`, kind: "error" });
        out.push({ text: "Type GAME to retrain.", kind: "dim" });
      } else {
        setGame({ ...g, epoch });
      }
      await print(out);
    },
    [print, setGame, showMenu],
  );

  // ---- command interpreter ----------------------------------------------
  const execute = useCallback(
    async (rawInput: string) => {
      const raw = rawInput.trim().toUpperCase();
      anchorRef.current = push({
        type: "line",
        line: { text: `${gameRef.current ? `EPOCH ${gameRef.current.epoch + 1}` : "COMMAND"}> ${rawInput.trim().toUpperCase()}` },
      });
      if (!raw) return;

      if (gameRef.current) return playGame(raw);

      const cmd = ALIASES[raw] ?? raw;
      if (SECTIONS[cmd]) {
        sfx.select();
        await print([{ text: "" }, ...SECTIONS[cmd], { text: "" }]);
        return;
      }
      switch (cmd) {
        case "HELP":
          sfx.select();
          await print([{ text: "" }, ...HELP, { text: "" }]);
          return;
        case "MENU":
          sfx.select();
          await showMenu();
          return;
        case "CLS":
          anchorRef.current = null;
          genRef.current++;
          setEntries([]);
          return;
        case "SOUND":
          toggleSound();
          return;
        case "GAME":
          sfx.select();
          await startGame();
          return;
        case "RESUME":
          await print([{ text: "Full CV on request: type CONTACT.", kind: "dim" }]);
          return;
        case "EXIT":
          await hangUp();
          return;
        default:
          sfx.errorBuzz();
          await print([{ text: "Bad command or file name", kind: "error" }]);
      }
    },
    [hangUp, playGame, print, push, showMenu, startGame, toggleSound],
  );

  const pendingRef = useRef<string | null>(null);

  const submit = useCallback(
    (value: string) => {
      if (phase !== "online") return;
      if (busy) {
        // finish the current output instantly, then run what was typed
        skipRef.current = true;
        if (value.trim()) {
          pendingRef.current = value;
          setInput("");
        }
        return;
      }
      setInput("");
      void run(() => execute(value));
    },
    [busy, execute, phase, run],
  );

  useEffect(() => {
    if (busy || phase !== "online" || pendingRef.current === null) return;
    const value = pendingRef.current;
    pendingRef.current = null;
    void run(() => execute(value));
  }, [busy, execute, phase, run]);

  // any key / tap while output streams finishes it instantly
  useEffect(() => {
    if (!busy) return;
    const skip = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") skipRef.current = true;
    };
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [busy]);

  useEffect(() => {
    if (phase === "online" && !busy && window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [phase, busy]);

  const onScreenClick = (e: React.MouseEvent) => {
    if (busy) {
      skipRef.current = true;
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest("a,button,input")) return;
    if (phase === "online" && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  };

  const pick = (command: string) => {
    if (phase !== "online" || busy) return;
    sfx.keyClick();
    void run(() => execute(command));
  };

  // ---- render ---------------------------------------------------------------
  const promptLabel = game ? `EPOCH ${game.epoch + 1}` : "COMMAND";

  return (
    <div className="crt" data-phase={phase}>
      <div className={`screen ${tear ? "is-tearing" : ""}`} onClick={onScreenClick}>
        <YearNav era={1986} onTravel={() => genRef.current++} />
        <header className="status">
          <span className="status-title">
            {BOARD} <span className="dim">{"//"}</span> NODE 1 OF 1
          </span>
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={sound}
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
          >
            SOUND: {sound ? "ON" : "OFF"}
          </button>
        </header>

        {phase === "idle" ? (
          <section className="dialer" aria-label="Connect to the board">
            <h1 className="dialer-title">
              {BOARD} - NODE 1 OF 1
            </h1>
            <p className="dialer-spec">SYSOP: DEV RANASINGHE · ML ENGINEER</p>
            <p className="dialer-spec dim">1200 BAUD · 8-N-1 · ANSI</p>
            <button type="button" className="connect" onClick={connect} autoFocus>
              <span aria-hidden="true" className="connect-arrow" />
              CONNECT
            </button>
            <p className="blink dim">[ PRESS TO DIAL IN ]</p>
          </section>
        ) : (
          <div className="session" ref={scrollRef}>
            <div className="output" role="log" aria-live="polite">
              {entries.map((e) =>
                e.type === "menu" ? (
                  <MenuBox key={e.id} shown={e.shown} onPick={pick} disabled={busy} />
                ) : (
                  <OutLine key={e.id} id={e.id} line={e.line} />
                ),
              )}
              {typing && (
                <div className={`ln ln-${typing.line.kind ?? "normal"}`} style={hang(typing.line.text)} aria-hidden="true">
                  {(hang(typing.line.text) ? typing.line.text.trimStart() : typing.line.text).slice(
                    0,
                    Math.max(0, typing.n - (typing.line.text.length - typing.line.text.trimStart().length)),
                  )}
                  <span className="cursor" />
                </div>
              )}
            </div>

            {phase === "online" && (
              <form
                className="prompt"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
              >
                <label htmlFor="cmd" className="prompt-label">
                  {promptLabel}&gt;
                </label>
                <div className="prompt-field">
                  <input
                    id="cmd"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value.slice(0, 60));
                      sfx.keyClick();
                    }}
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    aria-describedby="cmd-hint"
                  />
                  <span className="prompt-echo" aria-hidden="true">
                    {input}
                    {!busy && <span className="cursor" />}
                  </span>
                </div>
              </form>
            )}

            {phase === "online" && (
              <nav id="cmd-hint" className="hints" aria-label="Commands">
                {busy ? (
                  <span className="dim blink">[ RECEIVING... TAP OR PRESS ENTER TO SKIP ]</span>
                ) : game ? (
                  <span className="dim">Type a number 1..99 · QUIT</span>
                ) : (
                  <>
                    <span className="dim">Type</span>
                    {MENU.map((m) => (
                      <button key={m.key} type="button" className="hint" onClick={() => pick(m.command)}>
                        {m.command}
                      </button>
                    ))}
                    <button type="button" className="hint" onClick={() => pick("HELP")}>
                      HELP
                    </button>
                  </>
                )}
              </nav>
            )}

            {phase === "dialing" && (
              <p className="hints dim blink">[ TAP OR PRESS ENTER TO SKIP ]</p>
            )}

            {phase === "hungup" && (
              <div className="redial">
                <button type="button" className="connect connect-small" onClick={connect}>
                  [ REDIAL ]
                </button>
              </div>
            )}

            {(phase === "online" || phase === "hungup") && (
              <div className="redial">
                <button
                  type="button"
                  className="connect connect-small"
                  onClick={() => {
                    genRef.current++;
                    sfx.hangUp();
                    travel("/1996");
                  }}
                >
                  [ GO 1996 ]
                </button>
              </div>
            )}
          </div>
        )}

        {tear && (
          <div className="tear" aria-hidden="true" style={{ top: `${tear.top}%`, ["--shift" as string]: `${tear.shift}px` }} />
        )}
      </div>

      <div className="fx-scanlines" aria-hidden="true" />
      <div className="fx-roll" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
      <div className="block-cursor" ref={cursorRef} aria-hidden="true" />
    </div>
  );
}

/** Hanging indent so wrapped lines stay aligned under bullets and KEY .... values. */
function hang(text: string): React.CSSProperties | undefined {
  const lead = text.match(/^( *)(\* |[A-Z-]+ \.+ )?/);
  const indent = lead?.[1].length ?? 0;
  const marker = lead?.[2]?.length ?? 0;
  if (!indent && !marker) return undefined;
  return { paddingLeft: `${indent + marker}ch`, textIndent: `-${marker}ch` };
}

function OutLine({ id, line }: { id: number; line: Line }) {
  const cls = `ln ln-${line.kind ?? "normal"}`;
  const style = hang(line.text);
  const text = style ? line.text.trimStart() : line.text;
  if (line.href) {
    const external = line.href.startsWith("http");
    return (
      <div className={cls} style={style} data-entry={id}>
        <a href={line.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {text}
        </a>
      </div>
    );
  }
  return (
    <div className={cls} style={style} data-entry={id}>
      {text || " "}
    </div>
  );
}

function MenuBox({ shown, onPick, disabled }: { shown: number; onPick: (c: string) => void; disabled: boolean }) {
  return (
    <div className="menu">
      <div className="menu-title">[ MAIN MENU ]</div>
      <ul>
        {MENU.slice(0, shown).map((m) => (
          <li key={m.key}>
            <button type="button" onClick={() => onPick(m.command)} disabled={disabled}>
              <span className="menu-key">[{m.key}]</span>
              <span className="menu-dots"> ... </span>
              <span>{m.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
