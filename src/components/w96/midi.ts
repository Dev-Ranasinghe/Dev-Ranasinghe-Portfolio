// A tiny General-MIDI-ish player for the homepage theme, plus a Windows "ding".

let ctx: AudioContext | null = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function note(c: AudioContext, out: AudioNode, midi: number, t: number, dur: number, type: OscillatorType, vol: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(vol * 0.5, t + dur * 0.6);
  g.gain.linearRampToValueAtTime(0, t + dur * 0.95);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur);
}

// devs_theme.mid: an original 8-bar loop. [midi note | 0 for rest, beats]
const LEAD: [number, number][] = [
  [72, 1], [76, 0.5], [79, 0.5], [84, 1], [79, 1],
  [81, 1], [77, 0.5], [81, 0.5], [84, 2],
  [79, 1], [76, 0.5], [79, 0.5], [83, 1], [79, 1],
  [77, 1], [74, 0.5], [77, 0.5], [79, 2],
  [72, 1], [76, 0.5], [79, 0.5], [84, 1], [88, 1],
  [86, 1], [84, 0.5], [81, 0.5], [84, 2],
  [83, 1], [79, 1], [77, 1], [74, 1],
  [72, 3], [0, 1],
];
const BASS = [48, 53, 55, 50, 48, 53, 55, 48];

const BPM = 132;

export function startTheme(): () => void {
  const c = audio();
  if (!c) return () => {};
  const out = c.createGain();
  out.gain.value = 0.11;
  out.connect(c.destination);

  const beat = 60 / BPM;
  const barLen = beat * 4;
  const loopLen = barLen * 8;
  let start = c.currentTime + 0.1;
  let stopped = false;

  const schedule = () => {
    let t = start;
    for (const [n, b] of LEAD) {
      if (n) note(c, out, n, t, b * beat * 0.95, "square", 0.5);
      t += b * beat;
    }
    BASS.forEach((n, bar) => {
      for (let q = 0; q < 4; q++) note(c, out, q % 2 ? n + 7 : n, start + bar * barLen + q * beat, beat * 0.8, "triangle", 0.9);
    });
    start += loopLen;
  };

  schedule();
  const timer = setInterval(() => {
    if (!stopped && start - c.currentTime < 1) schedule();
  }, 250);

  return () => {
    stopped = true;
    clearInterval(timer);
    out.gain.setTargetAtTime(0, c.currentTime, 0.05);
    setTimeout(() => out.disconnect(), 400);
  };
}

/** The chord.wav of error dialogs. */
export function ding() {
  const c = audio();
  if (!c) return;
  const out = c.createGain();
  out.gain.value = 0.18;
  out.connect(c.destination);
  [76, 83, 88].forEach((n, i) => note(c, out, n, c.currentTime + i * 0.015, 0.7, "triangle", 0.6));
}

/** Soft button click. */
export function click() {
  const c = audio();
  if (!c) return;
  const out = c.createGain();
  out.gain.value = 0.08;
  out.connect(c.destination);
  note(c, out, 96, c.currentTime, 0.03, "square", 0.5);
}
