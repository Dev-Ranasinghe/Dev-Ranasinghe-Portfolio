"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import YearNav, { useTravel } from "@/components/YearNav";
import { CERTS, CONTACT, EDUCATION, MENTOR, PERSON, PHOTO, PROJECTS, SKILLS, WORK } from "@/lib/cv";
import Stardust from "./Stardust";
import { marbleTile } from "./marble";
import { click, ding, startTheme } from "./midi";

const SECTIONS = [
  { id: "about", label: "About", title: "About Me" },
  { id: "projects", label: "Projects", title: "Cool Projects!!!" },
  { id: "work", label: "Work", title: "Where I've Worked" },
  { id: "school", label: "School", title: "School Daze" },
  { id: "skills", label: "Skills", title: "Skills & Languages" },
  { id: "awards", label: "Awards", title: "Awards & Certificates" },
  { id: "contact", label: "Contact", title: "Contact Me" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const TICKER = [
  "*~*~* Welcome to my homepage!!! *~*~*",
  "NEW!!! Malaria-detecting AI added to the Projects page",
  "Best viewed with Netscape Navigator 3.0 at 800x600",
  "♥ Sign my guestbook!!! ♥",
  "This page is 100% hand-coded HTML",
  "Don't forget to bookmark me!!!",
  "UNDER CONSTRUCTION",
  "<<·--==(( o ))==--·>>",
  "Now with 16.7 million colors!!!",
  "-=[ Python ]=- -=[ PyTorch ]=- -=[ Next.js ]=-",
  "¤º°`°º¤ø,¸¸,ø¤º°`°º¤",
];

// ---- hash-backed section, so the Back button works like 1996 intended ----
const subscribeHash = (fn: () => void) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};
const readHash = () => window.location.hash.slice(1);

export default function World96() {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const section: SectionId = SECTIONS.some((s) => s.id === hash) ? (hash as SectionId) : "about";
  const current = SECTIONS.find((s) => s.id === section)!;

  const [marble, setMarble] = useState<string | null>(null);
  const [midiOn, setMidiOn] = useState(false);
  const stopMidi = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialogText, setDialogText] = useState({ title: "", body: "" });
  const mainRef = useRef<HTMLElement>(null);
  const travel = useTravel();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMarble(marbleTile()));
    return () => {
      cancelAnimationFrame(id);
      stopMidi.current?.();
    };
  }, []);

  const go = (id: SectionId) => {
    click();
    if (id === section) return;
    // a plain hash change keeps Back working; this is not a route change
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`#${id}`);
    if (window.matchMedia("(max-width: 760px)").matches) {
      requestAnimationFrame(() => mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const toggleMidi = () => {
    if (midiOn) {
      stopMidi.current?.();
      stopMidi.current = null;
    } else {
      stopMidi.current = startTheme();
    }
    setMidiOn(!midiOn);
  };

  const alert95 = (title: string, body: string) => {
    setDialogText({ title, body });
    ding();
    dialogRef.current?.showModal();
  };

  const leave = (href: string) => {
    stopMidi.current?.();
    travel(href);
  };

  return (
    <div className="w96" style={marble ? { backgroundImage: `url(${marble})` } : undefined}>
      <Stardust />
      <YearNav era={1996} onTravel={() => stopMidi.current?.()} />

      <div className="w96-page">
        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF, served as-is */}
        <img src="/w96/fire-bar.gif" alt="" className="w96-fire" />

        <header className="w96-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/w96/torch.gif" alt="" className="w96-torch" />
          <div className="w96-header-text">
            <p className="w96-welcome">★ WELCOME TO ★</p>
            <h1 className="w96-title">DEV RANASINGHE&apos;S WORLD 96</h1>
            <p className="w96-tagline">·:·:· HOME ON THE INFORMATION SUPERHIGHWAY ·:·:·</p>
            <p className="w96-sub">Machine learning, hand-coded in Notepad.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/w96/torch.gif" alt="" className="w96-torch" />
        </header>

        <Marquee />

        <EraButtons onPast={() => leave("/")} onFuture={() => leave("/2006")} />

        <div className="w96-grid">
          <nav className="w96-menu" aria-label="Sections">
            <p className="w96-menu-title">★ MENU ★</p>
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button type="button" aria-current={s.id === section ? "page" : undefined} onClick={() => go(s.id)}>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="w96-main" ref={mainRef} aria-labelledby="w96-section-title">
            <h2 className="w96-main-title" id="w96-section-title">
              ☆ {current.title} ☆
            </h2>
            <div className="w96-main-body" key={section}>
              {section === "about" && <About />}
              {section === "projects" && <Projects />}
              {section === "work" && <Work />}
              {section === "school" && <School />}
              {section === "skills" && <Skills />}
              {section === "awards" && <Awards />}
              {section === "contact" && <Contact />}
            </div>
          </main>

          <aside className="w96-widgets" aria-label="Sidebar">
            <Counter />

            <a className="w96-mail" href={CONTACT[0].href}>
              <span className="w96-mail-spin" aria-hidden="true">
                <span>@</span>
                <span>E-mail</span>
              </span>
              <span className="w96-mail-text">YOU&apos;VE GOT MAIL!</span>
            </a>

            <button type="button" className={`w96-midi ${midiOn ? "is-on" : ""}`} onClick={toggleMidi} aria-pressed={midiOn}>
              <span className="w96-midi-led" aria-hidden="true" />
              <span>
                devs_theme.mid
                <small>{midiOn ? "NOW PLAYING ♫" : "CLICK TO PLAY"}</small>
              </span>
            </button>

            <div className="w96-construction">
              <span className="w96-beacon" aria-hidden="true" />
              <span>
                UNDER
                <br />
                CONSTRUCTION
              </span>
            </div>

            <div className="w96-warning">
              <p className="w96-warning-head" aria-label="Warning">
                {"!!WARNING!!".split("").map((ch, i) => (
                  <span key={i} style={{ animationDelay: `${i * 90}ms` }} aria-hidden="true">
                    {ch}
                  </span>
                ))}
              </p>
              <button
                type="button"
                className="w96-dont"
                onClick={() =>
                  alert95(
                    "DEVSWRLD.EXE",
                    "This program has performed an illegal operation and will be shut down.\n\nIf the problem persists, hire the developer.",
                  )
                }
              >
                <small>NO MATTER WHAT HAPPENS,</small>
                DON&apos;T CLICK HERE
              </button>
              <p className="w96-warning-foot">(seriously... don&apos;t)</p>
            </div>
          </aside>
        </div>

        <Countdown />

        <EraButtons onPast={() => leave("/")} onFuture={() => leave("/2006")} />

        <footer className="w96-footer">
          <p>
            © 1996 {PERSON.name} · Made with <span className="w96-cycle">Notepad</span> · No frames. No problem.
          </p>
          <ul className="w96-badges" aria-label="Badges">
            <li className="b-netscape">
              <b>N</b>
              <span>
                Netscape
                <br />
                <em>NOW!</em>
              </span>
            </li>
            <li className="b-800">
              <span>
                best viewed at
                <br />
                <b>800x600</b>
              </span>
            </li>
            <li className="b-html">HTML 3.2</li>
            <li className="b-notepad">
              <span>
                made with
                <br />
                <b>Notepad</b>
              </span>
            </li>
            <li className="b-python">
              <span>
                powered by
                <br />
                <b>Python</b>
              </span>
            </li>
            <li className="b-broken">
              <span className="b-broken-icon" aria-hidden="true" />
              webring.gif
            </li>
          </ul>
          <div className="w96-tape">
            <span className="w96-sign" aria-hidden="true">
              <span>!</span>
            </span>
            <span className="w96-tape-strip">
              <span>UNDER CONSTRUCTION</span>
            </span>
            <span className="w96-sign" aria-hidden="true">
              <span>!</span>
            </span>
          </div>
        </footer>
      </div>

      <dialog ref={dialogRef} className="w95-dialog" aria-labelledby="w95-title">
        <form method="dialog">
          <div className="w95-titlebar">
            <span id="w95-title">{dialogText.title}</span>
            <button value="close" aria-label="Close">
              ×
            </button>
          </div>
          <div className="w95-body">
            <span className="w95-icon" aria-hidden="true">
              ×
            </span>
            <p>{dialogText.body}</p>
          </div>
          <div className="w95-actions">
            <button value="ok" autoFocus>
              OK
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function EraButtons({ onPast, onFuture }: { onPast: () => void; onFuture: () => void }) {
  return (
    <div className="w96-eras">
      <button type="button" className="w96-era-past" onClick={onPast}>
        ◀ CLICK HERE TO GO TO 1986
      </button>
      <button type="button" className="w96-era-future" onClick={onFuture}>
        ✦ CLICK HERE TO GO TO 2006
      </button>
    </div>
  );
}

/** A <marquee scrollamount="14" scrolldelay="90">: it jumps, it does not glide. */
function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let paused = false;
    const box = el.parentElement!;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    box.addEventListener("pointerenter", pause);
    box.addEventListener("pointerleave", resume);
    const id = setInterval(() => {
      if (paused) return;
      x -= 14;
      if (-x >= el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
    }, 90);
    return () => {
      clearInterval(id);
      box.removeEventListener("pointerenter", pause);
      box.removeEventListener("pointerleave", resume);
    };
  }, []);
  return (
    <div className="w96-ticker" aria-label="News ticker">
      <div className="w96-ticker-track" ref={track}>
        {[0, 1].map((copy) => (
          <span key={copy} aria-hidden={copy === 1 || undefined}>
            {TICKER.map((t) => (
              <span key={t} className="w96-ticker-item">
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- widgets -----------------------------------------------------------------

function Counter() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let n = 1;
    try {
      n = Number(window.localStorage.getItem("w96-hits") ?? "0") + 1;
      window.localStorage.setItem("w96-hits", String(n));
    } catch {
      /* no storage: still count this visit */
    }
    const t = setTimeout(() => setValue(4211 + n), 300);
    return () => clearTimeout(t);
  }, []);
  const digits = String(value).padStart(6, "0").split("");
  return (
    <div className="w96-counter">
      <p>VISITORS</p>
      <div className="w96-odometer" aria-label={`${value} visitors`}>
        {digits.map((d, i) => (
          <span key={i} className="w96-digit" aria-hidden="true">
            <span style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${(5 - i) * 120}ms` }}>
              {"0123456789".split("").map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const then = new Date(now);
      then.setFullYear(1996); // it is always 1996 on this page
      setLeft(Math.max(0, new Date(2000, 0, 1).getTime() - then.getTime()));
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  const s = left === null ? 0 : Math.floor(left / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section className="w96-y2k" aria-label="Countdown to the year 2000">
      <p className="w96-y2k-head">*** COUNTDOWN TO Y2K ***</p>
      <p className="w96-y2k-clock" suppressHydrationWarning>
        {left === null
          ? "---- DAYS -- : -- : --"
          : `${Math.floor(s / 86400)} DAYS ${pad(Math.floor(s / 3600) % 24)} : ${pad(Math.floor(s / 60) % 60)} : ${pad(s % 60)}`}
      </p>
      <p className="w96-y2k-foot">until the year 2000... are YOU ready?!</p>
    </section>
  );
}

// ---- sections ------------------------------------------------------------------

function About() {
  return (
    <div className="w96-about">
      <figure className="w96-photo">
        {PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PHOTO} alt={PERSON.name} />
        ) : (
          <div className="w96-photo-loading" role="img" aria-label="Photo still downloading">
            <span className="w96-photo-scan" />
            <span>dev.jpg</span>
            <small>downloading at 14.4k...</small>
          </div>
        )}
      </figure>
      <div>
        <p className="w96-name">{PERSON.name}</p>
        <p className="w96-role">{PERSON.role}</p>
        <p className="w96-study">{PERSON.study}</p>
        {PERSON.summary.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="w96-status">
          <span className="w96-new">NEW!</span> <b>Status:</b> {PERSON.status}
        </p>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <div className="w96-cards">
      {PROJECTS.map((p, i) => (
        <article key={p.name} className="w96-card">
          <h3>
            {i === 0 && <span className="w96-new">HOT!</span>} {p.name}
          </h3>
          <p className="w96-meta">
            {p.tag} ♦ {p.year}
          </p>
          <p>{p.summary}</p>
          <ul>
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <p className="w96-stack">
            <b>Built with:</b> {p.stack}
          </p>
        </article>
      ))}
    </div>
  );
}

function Work() {
  return (
    <div className="w96-cards">
      {WORK.map((j) => (
        <article key={j.title} className="w96-card">
          <h3>{j.title}</h3>
          <p className="w96-meta">
            {j.org} ♦ {j.dates}
          </p>
          <ul>
            {j.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <p className="w96-stack">
            <b>Tools:</b> {j.stack}
          </p>
        </article>
      ))}
    </div>
  );
}

function School() {
  return (
    <div className="w96-school">
      <p className="w96-school-name">{EDUCATION.school}</p>
      <p>
        {EDUCATION.degree} ♦ <span className="w96-date">{EDUCATION.dates}</span>
      </p>
      <p className="w96-muted">{EDUCATION.affiliation}</p>
      <p className="w96-label">Relevant coursework:</p>
      <ul className="w96-chips">
        {EDUCATION.coursework.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

function Skills() {
  return (
    <div className="w96-skills">
      {SKILLS.map((g, gi) => (
        <div key={g.group}>
          <p className="w96-label">{g.group}:</p>
          <ul className={`w96-chips ${gi % 2 ? "alt" : ""}`}>
            {g.items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Awards() {
  return (
    <div className="w96-awards">
      <ul className="w96-list">
        {CERTS.map((c) => (
          <li key={c.name}>
            <b>{c.name}</b> <span className="w96-date">♦ {c.by}</span>
          </li>
        ))}
      </ul>
      <p className="w96-label">Mentoring:</p>
      <p>{MENTOR}</p>
    </div>
  );
}

function Contact() {
  return (
    <div>
      <p className="w96-drop">Drop me a line!!!</p>
      <table className="w96-table">
        <tbody>
          {CONTACT.map((c) => (
            <tr key={c.label}>
              <th scope="row">{c.label}</th>
              <td>
                <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                  {c.value}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
