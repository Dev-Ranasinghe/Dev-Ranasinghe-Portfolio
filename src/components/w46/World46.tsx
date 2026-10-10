"use client";

import { Fragment } from "react";
import YearNav from "@/components/YearNav";
import { PERSON } from "@/lib/cv";

const FIRST = PERSON.name.split(" ")[0];
const HEADLINE = `Connecting to ${FIRST}’s consciousness via web browser was discontinued in 2041.`;

// each word blurs into focus in turn; the rest of the page waits for the last one
const WORD_STEP = 0.11;
const words = HEADLINE.split(" ");
const done = words.length * WORD_STEP + 0.4;

export default function World46() {
  return (
    <div className="w46" style={{ "--done": `${done}s` } as React.CSSProperties}>
      <YearNav era={2046} />

      <main className="w46-main">
        <h1 aria-label={HEADLINE}>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span aria-hidden="true" style={{ animationDelay: `${i * WORD_STEP}s` }}>
                {w}
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="w46-sub">Your current device only supports visual browsing.</p>
        <p className="w46-hint">To continue, enable your Neural ID implant or contact your Musk Industries agent.</p>
        <p className="w46-code">ERR_NEURAL_ID_REQUIRED · SESSION 0xA93F</p>
      </main>

      <footer className="w46-footer">
        <p>
          By accessing this site your biological data may be used to improve personalization,
          <br />
          optimize compliance and generate future versions of you without additional consent.
        </p>
        <p className="w46-copy">© 2046 {PERSON.name}</p>
      </footer>
    </div>
  );
}
