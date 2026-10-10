// Synthesized 80s terminal sounds. Everything is generated with Web Audio;
// no sample files are shipped.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled: boolean | null = null; // resolved from storage on first client read
const listeners = new Set<() => void>();

export function isSoundEnabled(): boolean {
  if (enabled === null) {
    try {
      enabled = window.localStorage.getItem("bbs-sound") !== "off";
    } catch {
      enabled = true;
    }
  }
  return enabled;
}

export function subscribeSound(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = isSoundEnabled() ? 0.35 : 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    window.localStorage.setItem("bbs-sound", on ? "on" : "off");
  } catch {
    /* storage blocked: preference just won't persist */
  }
  listeners.forEach((fn) => fn());
  if (master && ctx) master.gain.setTargetAtTime(on ? 0.35 : 0, ctx.currentTime, 0.02);
}

export function unlockAudio() {
  audio();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.2) {
  const c = audio();
  if (!c || !master || !isSoundEnabled()) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.setValueAtTime(vol, t + Math.max(0.006, dur - 0.01));
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(start: number, dur: number, vol = 0.15, filterFreq = 2000) {
  const c = audio();
  if (!c || !master || !isSoundEnabled()) return;
  const t = c.currentTime + start;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

/** Mechanical key click. */
export function keyClick() {
  noise(0, 0.03, 0.25, 3200 + Math.random() * 1500);
  tone(1800 + Math.random() * 400, 0, 0.012, "square", 0.04);
}

/** Tiny character tick while text streams in. */
export function charTick() {
  tone(2400 + Math.random() * 300, 0, 0.008, "square", 0.025);
}

/** Classic PC speaker beep. */
export function beep(freq = 880, dur = 0.09) {
  tone(freq, 0, dur, "square", 0.12);
}

/** "Bad command or file name" buzz. */
export function errorBuzz() {
  tone(110, 0, 0.18, "sawtooth", 0.16);
  tone(98, 0.19, 0.22, "sawtooth", 0.16);
}

/** Two-note confirm chirp for menu selections. */
export function select() {
  tone(660, 0, 0.05, "square", 0.1);
  tone(990, 0.055, 0.07, "square", 0.1);
}

/** POST beep plus CRT degauss thump. */
export function powerOn() {
  tone(55, 0, 0.5, "sine", 0.3);
  noise(0, 0.35, 0.2, 400);
  tone(15700, 0, 1.2, "sine", 0.01); // flyback whine
  tone(1000, 0.45, 0.12, "square", 0.12);
}

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "0": [941, 1336], "*": [941, 1209], "#": [941, 1477],
};

/** Plays DTMF tones for a number; returns seconds taken. */
export function dial(digits: string): number {
  let t = 0.15;
  // off-hook dial tone
  tone(350, 0, 0.6, "sine", 0.08);
  tone(440, 0, 0.6, "sine", 0.08);
  t = 0.7;
  for (const d of digits) {
    const pair = DTMF[d];
    if (!pair) continue;
    tone(pair[0], t, 0.09, "sine", 0.12);
    tone(pair[1], t, 0.09, "sine", 0.12);
    t += 0.14;
  }
  return t;
}

/** North-American ringback, `count` rings; returns seconds taken. */
export function ring(count = 2, start = 0): number {
  let t = start;
  for (let i = 0; i < count; i++) {
    tone(440, t, 1.2, "sine", 0.1);
    tone(480, t, 1.2, "sine", 0.1);
    t += 2.0;
  }
  return t - start;
}

/** V.22 modem handshake screech; returns seconds taken. */
export function handshake(start = 0): number {
  const t = start;
  tone(2100, t, 1.0, "sine", 0.12); // answer tone
  tone(1200, t + 1.05, 0.25, "square", 0.08);
  tone(2400, t + 1.05, 0.25, "square", 0.06);
  noise(t + 1.3, 0.5, 0.18, 1800);
  tone(1800, t + 1.35, 0.4, "sawtooth", 0.05);
  noise(t + 1.85, 0.6, 0.22, 2400);
  tone(980, t + 1.9, 0.5, "square", 0.05);
  tone(1650, t + 1.9, 0.5, "square", 0.05);
  noise(t + 2.5, 0.35, 0.12, 3000);
  return 2.9;
}

/** Line drop when hanging up. */
export function hangUp() {
  noise(0, 0.12, 0.3, 900);
  tone(480, 0.15, 0.25, "sine", 0.1);
  tone(620, 0.15, 0.25, "sine", 0.1);
  tone(480, 0.65, 0.25, "sine", 0.1);
  tone(620, 0.65, 0.25, "sine", 0.1);
}

/** The shared context and master bus, for players that bring their own samples. */
export function audioOut(): { ctx: AudioContext; out: GainNode } | null {
  const c = audio();
  return c && master ? { ctx: c, out: master } : null;
}

/* ---------- interface ticks ------------------------------------------------------ */

/** The context, only if a gesture has already woken it: hovering never starts audio. */
function awake(): AudioContext | null {
  return ctx && master && ctx.state === "running" && isSoundEnabled() ? ctx : null;
}

/** A soft sine blip with an exponential tail; quiet enough to sit under everything. */
function blip(c: AudioContext, from: number, to: number, dur: number, vol: number) {
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let lastHover = 0;

/** Pointer passes over a control: a faint glassy tick, at most every 70ms. */
export function uiHover() {
  const c = awake();
  const now = performance.now();
  if (!c || now - lastHover < 70) return;
  lastHover = now;
  blip(c, 2600, 2200, 0.035, 0.025);
}

/** A control is pressed: a soft, low tock. Presses are gestures, so this may wake audio. */
export function uiPress() {
  const c = audio();
  if (!c || !master || !isSoundEnabled()) return;
  blip(c, 1250, 640, 0.06, 0.06);
}
