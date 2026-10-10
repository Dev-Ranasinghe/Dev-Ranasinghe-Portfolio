"use client";

import { useState, useSyncExternalStore } from "react";
import { haptics } from "@/lib/haptics";

type Row = { label: string; result: string };

// read on the client only, so server and first client render agree
const noop = () => () => {};

function snapshot(label: string, ret: unknown): Row {
  const ua = navigator.userActivation;
  return {
    label,
    result: `returned ${String(ret)} · tapped before: ${ua?.hasBeenActive ?? "?"} · tapping now: ${ua?.isActive ?? "?"}`,
  };
}

export default function HapticsTest() {
  const [rows, setRows] = useState<Row[]>([]);
  const add = (r: Row) => setRows((prev) => [r, ...prev].slice(0, 12));
  const hasApi = useSyncExternalStore(noop, () => typeof navigator.vibrate === "function", () => null);
  const agent = useSyncExternalStore(noop, () => navigator.userAgent, () => "");

  const run = (label: string, fn: () => unknown) => () => add(snapshot(label, fn()));

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", background: "#0b0d10", color: "#e8ecef", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Haptics test</h1>
      <p style={{ margin: "0 0 18px", color: "#aab3bb", fontSize: 14 }}>
        Vibration API available: <b style={{ color: hasApi ? "#7fe0a0" : "#f08f7e" }}>{hasApi === null ? "…" : hasApi ? "yes" : "no"}</b>
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        {[
          ["1. Long buzz (500ms)", () => navigator.vibrate?.(500)],
          ["2. Pattern (200 on, 100 off, 200 on)", () => navigator.vibrate?.([200, 100, 200])],
          ["3. Time-machine launch", () => haptics.launch()],
          ["4. Time-machine press tap", () => haptics.press()],
        ].map(([label, fn]) => (
          <button
            key={label as string}
            type="button"
            onClick={run(label as string, fn as () => unknown)}
            style={{ padding: "16px 14px", fontSize: 16, borderRadius: 10, border: "1px solid #2b3238", background: "#161b20", color: "#e8ecef", textAlign: "left" }}
          >
            {label as string}
          </button>
        ))}
      </div>

      <ol style={{ margin: "20px 0", padding: 0, listStyle: "none", fontSize: 13, color: "#aab3bb", display: "grid", gap: 8 }}>
        {rows.map((r, i) => (
          <li key={i}>
            <b style={{ color: "#e8ecef" }}>{r.label}</b>
            <br />
            {r.result}
          </li>
        ))}
      </ol>

      <p style={{ fontSize: 12, color: "#6b747c", wordBreak: "break-word" }}>{agent}</p>
    </main>
  );
}
