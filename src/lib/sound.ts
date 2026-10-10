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

/* ---------- time machine ----------------------------------------------------- */

let space: ConvolverNode | null = null;

/** A generated hall: decaying stereo noise, so the jump has room to ring out. */
function reverb(c: AudioContext): ConvolverNode {
  if (space) return space;
  const len = Math.floor(c.sampleRate * 3);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  space = c.createConvolver();
  space.buffer = ir;
  return space;
}

function noiseBuffer(c: AudioContext, dur: number) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Shaped gain: silent, up to `peak` by `attack`, holds, gone by `end`. */
function env(c: AudioContext, t: number, attack: number, hold: number, end: number, peak: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + Math.max(attack, hold));
  g.gain.exponentialRampToValueAtTime(0.0001, t + end);
  return g;
}

/**
 * Time-machine jump, in three acts on its own compressed bus with a hall send:
 *  charge  - a detuned saw stack spooling up (down, when travelling back) under a noise riser
 *  transit - sub rumble with a fluttering tremolo, years whooshing past faster and faster,
 *            a high shimmer on top
 *  land    - a sub-drop impact with a burst of air, and a bell that rings out in the hall
 * Shares the BBS sound toggle, so it stays silent for anyone who switched sound off.
 */
export function timeWarp(at: { depart: number; land: number }, forward = true) {
  const c = audio();
  if (!c || !master || !isSoundEnabled()) return;
  const t0 = c.currentTime + 0.02;
  const { depart, land } = at;
  const tLand = t0 + land;

  const bus = c.createGain();
  bus.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 6;
  const wet = c.createGain();
  wet.gain.value = 0.32;
  bus.connect(comp).connect(master);
  bus.connect(reverb(c)).connect(wet).connect(master);

  // charge: spooling saw stack through an opening low-pass
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 6;
  lp.frequency.setValueAtTime(300, t0);
  lp.frequency.exponentialRampToValueAtTime(5200, t0 + depart + 0.25);
  lp.frequency.exponentialRampToValueAtTime(700, t0 + depart + 0.9);
  const chargeEnv = env(c, t0, depart * 0.8, depart, depart + 0.9, 0.11);
  lp.connect(chargeEnv).connect(bus);
  for (const [base, detune] of [[110, -9], [110, 9], [220, 4], [55, 0]] as const) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.detune.value = detune;
    const a = forward ? base : base * 4;
    const b = forward ? base * 4 : base;
    o.frequency.setValueAtTime(a, t0);
    o.frequency.exponentialRampToValueAtTime(b, t0 + depart + 0.2);
    o.connect(lp);
    o.start(t0);
    o.stop(t0 + depart + 1);
  }
  const riser = c.createBufferSource();
  riser.buffer = noiseBuffer(c, depart + 0.6);
  const rbp = c.createBiquadFilter();
  rbp.type = "bandpass";
  rbp.Q.value = 0.9;
  rbp.frequency.setValueAtTime(forward ? 400 : 6000, t0);
  rbp.frequency.exponentialRampToValueAtTime(forward ? 6000 : 400, t0 + depart + 0.3);
  riser.connect(rbp).connect(env(c, t0, depart, depart + 0.05, depart + 0.6, 0.22)).connect(bus);
  riser.start(t0);

  // transit: sub rumble with a fluttering tremolo
  const tIn = t0 + depart * 0.7;
  const rumbleLen = tLand - tIn + 0.3;
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(42, tIn);
  sub.frequency.linearRampToValueAtTime(58, tLand);
  const growl = c.createOscillator();
  growl.type = "sawtooth";
  growl.frequency.value = 55;
  const glp = c.createBiquadFilter();
  glp.type = "lowpass";
  glp.frequency.value = 170;
  const trem = c.createGain();
  trem.gain.value = 0.7;
  const lfo = c.createOscillator();
  lfo.frequency.setValueAtTime(5, tIn);
  lfo.frequency.linearRampToValueAtTime(13, tLand);
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.3;
  lfo.connect(lfoDepth).connect(trem.gain);
  const rumbleEnv = env(c, tIn, 0.5, rumbleLen - 0.35, rumbleLen, 0.42);
  sub.connect(trem);
  growl.connect(glp).connect(trem);
  trem.connect(rumbleEnv).connect(bus);
  for (const o of [sub, growl, lfo]) {
    o.start(tIn);
    o.stop(tIn + rumbleLen + 0.05);
  }

  // years whooshing past: band-passed air swells, closer together as speed builds
  let w = tIn + 0.15;
  let gap = 0.62;
  while (w < tLand - 0.25) {
    const dur = Math.min(0.55, gap + 0.15);
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, dur);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(forward ? 700 : 3400, w);
    bp.frequency.exponentialRampToValueAtTime(forward ? 3400 : 700, w + dur);
    const pan = c.createStereoPanner();
    pan.pan.setValueAtTime(Math.random() > 0.5 ? -0.7 : 0.7, w);
    pan.pan.linearRampToValueAtTime(0, w + dur);
    src.connect(bp).connect(env(c, w, dur * 0.6, dur * 0.6, dur, 0.13)).connect(pan).connect(bus);
    src.start(w);
    w += gap;
    gap = Math.max(0.16, gap * 0.8);
  }

  // shimmer: a high detuned pair with slow vibrato, swelling under the whooshes
  for (const f of [1760, 2637]) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const vib = c.createOscillator();
    vib.frequency.value = 6;
    const vd = c.createGain();
    vd.gain.value = f * 0.006;
    vib.connect(vd).connect(o.frequency);
    o.connect(env(c, tIn, rumbleLen * 0.7, rumbleLen * 0.75, rumbleLen, 0.018)).connect(bus);
    o.start(tIn);
    vib.start(tIn);
    o.stop(tIn + rumbleLen + 0.05);
    vib.stop(tIn + rumbleLen + 0.05);
  }

  // land: sub drop, a burst of air, and a bell ringing out in the hall
  const drop = c.createOscillator();
  drop.type = "sine";
  drop.frequency.setValueAtTime(150, tLand);
  drop.frequency.exponentialRampToValueAtTime(34, tLand + 0.7);
  drop.connect(env(c, tLand, 0.008, 0.05, 1.5, 0.75)).connect(bus);
  drop.start(tLand);
  drop.stop(tLand + 1.6);

  const air = c.createBufferSource();
  air.buffer = noiseBuffer(c, 0.9);
  const alp = c.createBiquadFilter();
  alp.type = "lowpass";
  alp.frequency.setValueAtTime(5000, tLand);
  alp.frequency.exponentialRampToValueAtTime(300, tLand + 0.8);
  air.connect(alp).connect(env(c, tLand, 0.005, 0.02, 0.85, 0.3)).connect(bus);
  air.start(tLand);

  for (const [f, v] of [[880, 0.07], [1318.5, 0.045], [1760, 0.025]] as const) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = forward ? f : f * 0.75;
    o.connect(env(c, tLand + 0.03, 0.006, 0.04, 2.4, v)).connect(bus);
    o.start(tLand + 0.03);
    o.stop(tLand + 2.5);
  }
}
