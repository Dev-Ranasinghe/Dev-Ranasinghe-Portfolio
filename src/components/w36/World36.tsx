"use client";

import { useEffect, useRef, useState } from "react";
import YearNav from "@/components/YearNav";
import { PERSON } from "@/lib/cv";

type Phase = "idle" | "searching" | "failed";

const OS_NAME = PERSON.name.replace(/\s+/g, "") + "OS";

export default function World36() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const search = () => {
    setPhase("searching");
    timer.current = setTimeout(() => setPhase("failed"), 3600);
  };

  return (
    <div className={`w36 w36-${phase}`}>
      <p className="w36-brand">
        NEURALINK<sup>™</sup> · v12
      </p>
      <YearNav era={2036} />

      <main className="w36-main">
        <figure className="w36-figure" aria-hidden="true">
          <span className="w36-wave" />
          <span className="w36-wave" />
          <span className="w36-wave" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/w36/figure.png" alt="" width={440} height={530} />
          <span className="w36-device" />
        </figure>

        <section className="w36-panel" aria-live="polite" key={phase}>
          {phase === "idle" && (
            <>
              <p className="w36-step">Step 1 of 1</p>
              <h1>
                Connect your <span className="w36-grad">Neuralink</span>
                <sup>™</sup>
              </h1>
              <p className="w36-copy">
                Hold your Neuralink device against your ear to pair with {OS_NAME}.
                <br />
                Stay still while we establish the link.
              </p>
              <button type="button" className="w36-btn" onClick={search}>
                Start
              </button>
            </>
          )}

          {phase === "searching" && (
            <>
              <span className="w36-spinner" role="progressbar" aria-label="Searching" />
              <h1 className="w36-h-sm">Searching for Neuralink device..</h1>
              <p className="w36-copy w36-dim">Scanning nearby neural interfaces…</p>
            </>
          )}

          {phase === "failed" && (
            <>
              <span className="w36-alert" aria-hidden="true">
                !
              </span>
              <h1 className="w36-h-sm w36-err">Neuralink device not found</h1>
              <p className="w36-copy w36-narrow">
                We couldn&apos;t detect a Neuralink interface near you. Make sure the device is charged and positioned correctly.
              </p>
              <button type="button" className="w36-btn w36-btn-sm" onClick={search} autoFocus>
                Try again
              </button>
            </>
          )}
        </section>
      </main>

      <footer className="w36-footer">© 2036 {PERSON.name}</footer>
    </div>
  );
}
