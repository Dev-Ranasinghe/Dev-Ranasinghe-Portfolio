// Time-machine sound, fully synthesized and deliberately soft: sine and triangle tones
// through low-pass filters, no noise bursts, no booms. The motif is time itself: a clock
// that ticks faster as you charge, blurs into a whirr in transit, and a chord that rises
// with the jump (falls going back) and resolves into a bell as you land. Every jump
// plays on its own session bus, so it is silent by the time the arrival animation ends.
// Shares the BBS sound toggle.

import { audioOut, isSoundEnabled } from "./sound";

type Session = { ctx: AudioContext; gain: GainNode; nodes: AudioScheduledSourceNode[] };

let bus: GainNode | null = null;
let session: Session | null = null;

// D Lydian: bright and suspended, the "wonder" colour of time-travel scores
const CHARGE_CHORD = [146.83, 220, 293.66, 369.99, 415.3];
const TRIP_CHORD = [293.66, 440, 659.25, 739.99, 1108.73];
const BELL = [587.33, 880, 1174.66];

function master(): { ctx: AudioContext; bus: GainNode } | null {
  if (!isSoundEnabled()) return null;
  const o = audioOut();
  if (!o) return null;
  if (!bus) {
    const c = o.ctx;
    bus = c.createGain();
    bus.gain.value = 0.9;
    const soften = c.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 5200;
    // a short, dark room: space without a tail that outlives the animation
    const len = Math.floor(c.sampleRate * 0.9);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    }
    const room = c.createConvolver();
    room.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.22;
    bus.connect(soften).connect(o.out);
    soften.connect(room).connect(wet).connect(o.out);
  }
  return { ctx: o.ctx, bus };
}

/** Start a fresh session, cutting off whatever an earlier jump left behind. */
function begin(): Session | null {
  const m = master();
  if (!m) return null;
  end(0.05);
  const gain = m.ctx.createGain();
  gain.gain.value = 1;
  gain.connect(m.bus);
  session = { ctx: m.ctx, gain, nodes: [] };
  return session;
}

/** Fade the current session out over `secs` and release every node in it. */
function end(secs: number) {
  const s = session;
  if (!s) return;
  session = null;
  const t = s.ctx.currentTime;
  s.gain.gain.cancelScheduledValues(t);
  s.gain.gain.setValueAtTime(s.gain.gain.value, t);
  s.gain.gain.linearRampToValueAtTime(0, t + secs);
  for (const n of s.nodes) {
    try {
      n.stop(t + secs + 0.02);
    } catch {
      /* already stopped */
    }
  }
  setTimeout(() => s.gain.disconnect(), (secs + 0.1) * 1000);
}

function track<T extends AudioScheduledSourceNode>(s: Session, n: T): T {
  s.nodes.push(n);
  return n;
}

/** A warm pad: each note as a slightly detuned sine pair, through one low-pass. */
function pad(s: Session, freqs: number[], cutoff: number) {
  const c = s.ctx;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  filter.Q.value = 0.7;
  const gain = c.createGain();
  gain.gain.value = 0.0001;
  filter.connect(gain).connect(s.gain);
  const oscs: OscillatorNode[] = [];
  freqs.forEach((f, i) => {
    for (const cents of [-6, 6]) {
      const o = track(s, c.createOscillator());
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = cents;
      const g = c.createGain();
      g.gain.value = 1 / (freqs.length * 2) / (1 + i * 0.25);
      o.connect(g).connect(filter);
      o.start();
      oscs.push(o);
    }
  });
  return { filter, gain, oscs };
}

/** One clock tick: a short wooden-sounding sine pair, alternating tick and tock. */
function tick(s: Session, at: number, vol: number, tock: boolean) {
  const c = s.ctx;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);
  g.connect(s.gain);
  for (const [f, v] of [[tock ? 1180 : 1420, 1], [tock ? 2360 : 2840, 0.35]] as const) {
    const o = track(s, c.createOscillator());
    o.frequency.value = f;
    const og = c.createGain();
    og.gain.value = v;
    o.connect(og).connect(g);
    o.start(at);
    o.stop(at + 0.05);
  }
}

export type Charge = { set(p: number): void; release(): void; commit(): void };

export const jumpSfx = {
  /** The portal opens: a single soft upward glide. */
  open() {
    const s = begin();
    if (!s) return;
    const t = s.ctx.currentTime;
    const o = track(s, s.ctx.createOscillator());
    o.type = "sine";
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.35);
    const g = s.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(s.gain);
    o.start(t);
    o.stop(t + 0.55);
  },

  /** Press and hold: the clock starts ticking, faster with the charge, over a brightening chord. */
  charge(): Charge {
    const s = session ?? begin();
    if (!s) return { set() {}, release() {}, commit() {} };
    const c = s.ctx;
    const chord = pad(s, CHARGE_CHORD, 380);
    let next = c.currentTime + 0.02;
    let tock = false;
    let live = true;
    return {
      set(p) {
        if (!live) return;
        const t = c.currentTime;
        chord.gain.gain.setTargetAtTime(0.012 + p * 0.07, t, 0.08);
        chord.filter.frequency.setTargetAtTime(380 + p * 2200, t, 0.08);
        // keep about one tick queued ahead; the gap shrinks from 0.42s to 0.08s
        while (next < t + 0.1) {
          tick(s, Math.max(next, t), 0.05 + p * 0.05, (tock = !tock));
          next = Math.max(next, t) + 0.42 - p * 0.34;
        }
      },
      release() {
        if (!live) return;
        live = false;
        const t = c.currentTime;
        chord.gain.gain.setTargetAtTime(0.0001, t, 0.08);
        chord.filter.frequency.setTargetAtTime(200, t, 0.1);
        chord.oscs.forEach((o) => {
          o.frequency.setTargetAtTime(o.frequency.value * 0.84, t, 0.12);
          o.stop(t + 0.45);
        });
      },
      // full charge: hand over to the trip
      commit() {
        if (!live) return;
        live = false;
        const t = c.currentTime;
        chord.gain.gain.setTargetAtTime(0.0001, t, 0.15);
        chord.oscs.forEach((o) => o.stop(t + 0.7));
      },
    };
  },

  /**
   * Lift-off and transit: a chord gliding up a fourth over the trip (down a fourth going
   * back), a high shimmer, and the clock racing until it blurs and disappears. A gentle
   * sine sweep leads into touchdown.
   */
  launch(tripSecs: number, forward = true) {
    const s = session ?? begin();
    if (!s) return;
    const c = s.ctx;
    const t = c.currentTime;
    const glide = forward ? 4 / 3 : 3 / 4;

    const chord = pad(s, TRIP_CHORD, 900);
    chord.gain.gain.setValueAtTime(0.0001, t);
    chord.gain.gain.exponentialRampToValueAtTime(0.075, t + 0.5);
    chord.gain.gain.setValueAtTime(0.075, t + tripSecs - 0.6);
    chord.gain.gain.exponentialRampToValueAtTime(0.03, t + tripSecs);
    chord.filter.frequency.setValueAtTime(900, t);
    chord.filter.frequency.exponentialRampToValueAtTime(3200, t + tripSecs * 0.6);
    chord.oscs.forEach((o) => {
      o.frequency.setValueAtTime(o.frequency.value, t);
      o.frequency.exponentialRampToValueAtTime(o.frequency.value * glide, t + tripSecs);
    });
    // slow chorus on the whole chord
    const lfo = track(s, c.createOscillator());
    lfo.frequency.value = 0.8;
    const depth = c.createGain();
    depth.gain.value = 9;
    lfo.connect(depth);
    chord.oscs.forEach((o) => depth.connect(o.detune));
    lfo.start(t);

    // shimmer: two high sines that bloom mid-trip
    for (const [f, v] of [[2217.46, 0.012], [2959.96, 0.008]] as const) {
      const o = track(s, c.createOscillator());
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * glide, t + tripSecs);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + tripSecs * 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, t + tripSecs);
      o.connect(g).connect(s.gain);
      o.start(t);
      o.stop(t + tripSecs + 0.05);
    }

    // the clock races: 0.08s apart down to 0.02s, fading out as it blurs
    let at = t + 0.05;
    let tock = false;
    const stopAt = t + tripSecs * 0.75;
    while (at < stopAt) {
      const k = (at - t) / (stopAt - t);
      tick(s, at, 0.07 * (1 - k) + 0.0002, (tock = !tock));
      at += 0.08 - k * 0.06;
    }

    // touchdown lead-in: a soft sine sweep
    const sweep = track(s, c.createOscillator());
    const sweepStart = t + tripSecs - 0.7;
    sweep.frequency.setValueAtTime(forward ? 330 : 660, sweepStart);
    sweep.frequency.exponentialRampToValueAtTime(forward ? 1320 : 165, t + tripSecs);
    const sg = c.createGain();
    sg.gain.setValueAtTime(0.0001, sweepStart);
    sg.gain.exponentialRampToValueAtTime(0.045, t + tripSecs - 0.02);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + tripSecs + 0.05);
    sweep.connect(sg).connect(s.gain);
    sweep.start(sweepStart);
    sweep.stop(t + tripSecs + 0.1);
  },

  /** Touchdown: a soft bell chord and a warm low bloom; the whole session is gone in ~0.9s. */
  land() {
    const s = session;
    if (!s) return;
    const c = s.ctx;
    const t = c.currentTime + 0.01;
    BELL.forEach((f, i) => {
      const o = track(s, c.createOscillator());
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06 / (1 + i), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      o.connect(g).connect(s.gain);
      o.start(t);
      o.stop(t + 0.9);
    });
    const low = track(s, c.createOscillator());
    low.frequency.setValueAtTime(110, t);
    low.frequency.exponentialRampToValueAtTime(73.4, t + 0.4);
    const lg = c.createGain();
    lg.gain.setValueAtTime(0.0001, t);
    lg.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
    lg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    low.connect(lg).connect(s.gain);
    low.start(t);
    low.stop(t + 0.65);
    // everything still sounding from the trip winds down under the bell
    end(0.9);
  },

  /** Abort: a quick fade to silence. */
  stop() {
    end(0.25);
  },
};
