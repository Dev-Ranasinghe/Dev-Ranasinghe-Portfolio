"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import YearNav from "@/components/YearNav";
import { CERTS, CONTACT, EDUCATION, MENTOR, PERSON, PHOTO, PROJECTS, SKILLS, WORK } from "@/lib/cv";
import { makePhotostream, type Shot } from "./photostream";

const TABS = [
  { id: "about", label: "about", title: "About me" },
  { id: "projects", label: "projects", title: "Projects" },
  { id: "experience", label: "experience", title: "Experience" },
  { id: "education", label: "education", title: "Education" },
  { id: "skills", label: "skills", title: "Skills & Languages" },
  { id: "contact", label: "contact", title: "Get in touch" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// tag -> the tab that answers it, sized by how much of the CV it covers
const TAGS: { tag: string; size: number; tab: TabId }[] = [
  { tag: "pytorch", size: 4, tab: "skills" },
  { tag: "computer-vision", size: 5, tab: "projects" },
  { tag: "rag", size: 2, tab: "projects" },
  { tag: "next.js", size: 3, tab: "experience" },
  { tag: "explainable-ai", size: 4, tab: "projects" },
  { tag: "python", size: 5, tab: "skills" },
  { tag: "langchain", size: 2, tab: "skills" },
  { tag: "yolo", size: 3, tab: "projects" },
  { tag: "web2.0", size: 1, tab: "about" },
  { tag: "flask", size: 2, tab: "skills" },
  { tag: "coffee", size: 1, tab: "about" },
];

const SHARE = ["digg", "del.icio.us", "reddit", "Technorati", "StumbleUpon", "Furl"];

const subscribeHash = (fn: () => void) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};
const readHash = () => window.location.hash.slice(1);

export default function World06() {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const tab: TabId = TABS.some((t) => t.id === hash) ? (hash as TabId) : "about";
  const current = TABS.find((t) => t.id === tab)!;

  const [loading, setLoading] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [lightbox, setLightbox] = useState<null | { title: string; body: string; img?: string }>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShots(makePhotostream()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [lightbox]);

  /** Every click was an XMLHttpRequest in 2006: show the spinner, then swap. */
  const go = (id: TabId) => {
    if (id === tab) return;
    if (loadTimer.current) clearTimeout(loadTimer.current);
    setLoading(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    loadTimer.current = setTimeout(() => {
      setLoading(false);
      // a plain hash change keeps Back working; this is not a route change
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`#${id}`);
    }, reduced ? 0 : 450);
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hay: Record<TabId, string> = {
      about: [PERSON.role, ...PERSON.summary].join(" "),
      projects: JSON.stringify(PROJECTS),
      experience: JSON.stringify(WORK),
      education: JSON.stringify(EDUCATION),
      skills: JSON.stringify(SKILLS) + JSON.stringify(CERTS),
      contact: JSON.stringify(CONTACT),
    };
    const hit = TABS.find((t) => hay[t.id].toLowerCase().includes(q));
    if (hit) go(hit.id);
    else flash(`No posts tagged "${query.trim()}" yet. Check back after the next deploy!`);
  };

  const share = async (site: string) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash(`Link copied! Paste it into ${site}.`);
    } catch {
      flash(`Copy this page's address to share it on ${site}.`);
    }
  };

  return (
    <div className="w06">
      <YearNav era={2006} />

      <div className="w06-page">
        <header className="w06-masthead">
          <div>
            <p className="w06-logo">
              <span className="w06-name-mark">
                dev<span className="w06-dot">.</span>ranasinghe &apos;06
              </span>
              <span className="w06-beta">
                2.0<sup>BETA</sup>
              </span>
            </p>
            <p className="w06-tagline">machine learning, web apps &amp; assorted experiments from a CS student who ships</p>
          </div>
          <form className="w06-search" role="search" onSubmit={search}>
            <label htmlFor="w06-q" className="sr-only">
              Search the blog
            </label>
            <input id="w06-q" type="search" placeholder="search the blog..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>
        </header>

        <nav className="w06-tabs" aria-label="Sections">
          <ul>
            {TABS.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={t.id === tab ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(t.id);
                  }}
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="w06-rss" onClick={() => flash("RSS feed coming in version 2.1 BETA.")}>
            <span className="w06-tri" aria-hidden="true" />
            RSS feed
          </button>
        </nav>

        <div className="w06-body">
          <main className="w06-main" aria-labelledby="w06-title" aria-busy={loading}>
            <h1 id="w06-title" key={`t-${tab}`} className="w06-h1">
              {current.title}
            </h1>
            {loading ? (
              <div className="w06-loading" role="status">
                <span className="w06-spinner" aria-hidden="true" />
                Loading...
              </div>
            ) : (
              <div className="w06-content" key={tab}>
                {tab === "about" && <About />}
                {tab === "projects" && <Projects />}
                {tab === "experience" && <Experience />}
                {tab === "education" && <Education />}
                {tab === "skills" && <Skills />}
                {tab === "contact" && <Contact />}
              </div>
            )}
          </main>

          <aside className="w06-side" aria-label="Sidebar">
            <section className="w06-box">
              <h2>Subscribe</h2>
              <button type="button" className="w06-btn-orange" onClick={() => flash("RSS feed coming in version 2.1 BETA.")}>
                <span className="w06-tri" aria-hidden="true" />
                Subscribe via RSS
              </button>
              {subscribed ? (
                <p className="w06-thanks">✓ Thanks! You&apos;re on the list.</p>
              ) : (
                <form
                  className="w06-subscribe"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                >
                  <label htmlFor="w06-email" className="sr-only">
                    Your e-mail
                  </label>
                  <input id="w06-email" type="email" required placeholder="your@email.com" />
                  <button type="submit" className="w06-go">
                    go
                  </button>
                </form>
              )}
            </section>

            <section className="w06-box">
              <h2>Tag cloud</h2>
              <p className="w06-cloud">
                {TAGS.map((t) => (
                  <a
                    key={t.tag}
                    href={`#${t.tab}`}
                    className={`s${t.size}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(t.tab);
                    }}
                  >
                    {t.tag}
                  </a>
                ))}
              </p>
            </section>

            <section className="w06-box">
              <h2>
                From my photostream <span className="w06-dots" aria-hidden="true" />
              </h2>
              <ul className="w06-photos">
                {(shots.length ? shots : Array.from({ length: 6 }, () => null)).map((s, i) => (
                  <li key={i}>
                    {s ? (
                      <button type="button" onClick={() => setLightbox({ title: s.title, body: "Synthetic thumbnail, drawn in the browser from my ML projects.", img: s.url })}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.url} alt={s.title} width={96} height={96} />
                      </button>
                    ) : (
                      <span className="w06-photo-empty" />
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="w06-box">
              <h2>Certified Web 2.0</h2>
              <ul className="w06-badges">
                <li className="b-w3c">
                  <b>W3C</b>
                  <span>XHTML 1.0</span>
                </li>
                <li className="b-w3c">
                  <b>W3C</b>
                  <span>CSS</span>
                </li>
                <li className="b-rss">
                  <b>RSS</b>
                  <span>2.0</span>
                </li>
                <li className="b-ajax">
                  <b>✓</b>
                  <span>AJAX</span>
                </li>
                <li className="b-solid b-purple">WEB 2.0 READY</li>
                <li className="b-outline">✓ 508 ACCESSIBLE</li>
                <li className="b-solid b-blue">MADE WITH PYTHON</li>
                <li className="b-solid b-black">★ BETA FOREVER</li>
              </ul>
            </section>

            <section className="w06-box">
              <h2>Blogroll</h2>
              <ul className="w06-roll">
                <li>
                  <a href={CONTACT[1].href} target="_blank" rel="noreferrer">
                    » My GitHub (code)
                  </a>
                </li>
                <li>
                  <a href={CONTACT[2].href} target="_blank" rel="noreferrer">
                    » LinkedIn (hire me)
                  </a>
                </li>
                <li>
                  <a href="https://pytorch.org" target="_blank" rel="noreferrer">
                    » PyTorch
                  </a>
                </li>
                <li>
                  <a href="https://arxiv.org/list/cs.CV/recent" target="_blank" rel="noreferrer">
                    » arXiv cs.CV
                  </a>
                </li>
                <li>
                  <a href="https://nextjs.org" target="_blank" rel="noreferrer">
                    » Next.js
                  </a>
                </li>
              </ul>
            </section>

            <button
              type="button"
              className="w06-dont"
              onClick={() =>
                setLightbox({
                  title: "You clicked it.",
                  body: "Of course you did. That curiosity is exactly what I bring to a model that won't converge. Now go check out my projects.",
                })
              }
            >
              ⚠ Don&apos;t click here
            </button>
            <p className="w06-dont-note">seriously, don&apos;t</p>
          </aside>
        </div>

        <div className="w06-share">
          <span>Share this:</span>
          {SHARE.map((s) => (
            <button key={s} type="button" className={`w06-share-${s.replace(/\W/g, "").toLowerCase()}`} onClick={() => share(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="w06-ads">
          <p className="w06-ads-label">Advertisement</p>
          <div className="w06-ads-row">
            <a
              className="w06-ad-nano"
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                go("projects");
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/w06/ipod-nano-ad.jpg" alt="iPod nano. 1,000 songs. Impossibly small." width={528} height={176} />
            </a>
            <a
              className="w06-ad-chat"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                go("contact");
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w06-ad-chat-logo" src="/w06/wlm-wordmark.png" alt="Windows Live Messenger" width={432} height={54} />
              <span className="w06-ad-chat-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/w06/wlm-buddies.png" alt="" width={64} height={64} />
                <span>Chat, share and stay in touch.</span>
              </span>
              <em>Download Free</em>
            </a>
          </div>
        </div>

        <footer className="w06-footer">
          <p>
            © 2006 {PERSON.name} · some rights reserved under <a href="https://creativecommons.org">Creative Commons</a>
          </p>
          <p className="w06-valid">
            <span>Valid XHTML 1.0</span>
            <span>Valid CSS</span>
            <span className="w06-atom">
              <span className="w06-tri" aria-hidden="true" />
              ATOM
            </span>
          </p>
        </footer>
      </div>

      {toast && (
        <div className="w06-toast" role="status">
          {toast}
        </div>
      )}

      {lightbox && (
        <div className="w06-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}>
          <div className="w06-lightbox-card" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {lightbox.img && <img src={lightbox.img} alt="" />}
            <p className="w06-lightbox-title">{lightbox.title}</p>
            <p>{lightbox.body}</p>
            <button type="button" className="w06-go" onClick={() => setLightbox(null)} autoFocus>
              close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- sections -----------------------------------------------------------------

function About() {
  return (
    <div className="w06-about">
      <figure className="w06-avatar">
        {PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PHOTO} alt={PERSON.name} />
        ) : (
          <span className="w06-avatar-default" role="img" aria-label="No photo uploaded yet">
            <span className="w06-avatar-head" />
            <span className="w06-avatar-body" />
          </span>
        )}
      </figure>
      <div>
        <p className="w06-name">{PERSON.name}</p>
        <p className="w06-role">{PERSON.role}</p>
        <p className="w06-orange">{PERSON.study}</p>
        {PERSON.summary.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="w06-status">
          <span className="w06-new">NEW</span> {PERSON.status}
        </p>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <div className="w06-cards">
      {PROJECTS.map((p, i) => (
        <article key={p.name} className={`w06-card ${i === 0 ? "is-featured" : ""}`}>
          {i === 0 && <span className="w06-burst">HOT!</span>}
          <h2>{p.name}</h2>
          <p className="w06-meta">
            {p.tag} · {p.year}
          </p>
          <p>{p.summary}</p>
          <ul className="w06-checks">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <p className="w06-stack">{p.stack}</p>
        </article>
      ))}
      <a className="w06-btn-blue" href={CONTACT[1].href} target="_blank" rel="noreferrer">
        <span className="w06-tri" aria-hidden="true" />
        More on github.com/Dev-Ranasinghe
      </a>
    </div>
  );
}

function Experience() {
  return (
    <div className="w06-cards">
      {WORK.map((j) => (
        <article key={j.title} className="w06-card">
          <h2>{j.title}</h2>
          <p className="w06-meta">
            {j.org} · {j.dates}
          </p>
          <ul className="w06-checks">
            {j.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <p className="w06-stack">{j.stack}</p>
        </article>
      ))}
    </div>
  );
}

function Education() {
  return (
    <div>
      <div className="w06-edu">
        <p className="w06-edu-date">2024 – 2026</p>
        <div>
          <p className="w06-edu-school">{EDUCATION.school}</p>
          <p>{EDUCATION.degree}</p>
          <p className="w06-muted">{EDUCATION.affiliation}</p>
        </div>
      </div>
      <h2 className="w06-label">Relevant coursework</h2>
      <ul className="w06-pills">
        {EDUCATION.coursework.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

function Skills() {
  return (
    <div>
      {SKILLS.map((g, i) => (
        <div key={g.group}>
          <h2 className="w06-label">{g.group}</h2>
          <ul className={`w06-pills ${i === 0 ? "warm" : ""}`}>
            {g.items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ))}
      <h2 className="w06-label">Certifications</h2>
      <ul className="w06-checks">
        {CERTS.map((c) => (
          <li key={c.name}>
            {c.name} <span className="w06-muted">· {c.by}</span>
          </li>
        ))}
      </ul>
      <p className="w06-muted">{MENTOR}</p>
    </div>
  );
}

function Contact() {
  return (
    <div>
      <dl className="w06-contact">
        {CONTACT.map((c) => (
          <div key={c.label}>
            <dt>{c.label}</dt>
            <dd>
              <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                {c.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <h2 className="w06-label">Add me on</h2>
      <ul className="w06-social">
        <li>
          <a href={CONTACT[1].href} target="_blank" rel="noreferrer">
            <b>GitHub</b>
            <small>social coding</small>
          </a>
        </li>
        <li>
          <a href={CONTACT[2].href} target="_blank" rel="noreferrer">
            <b>LinkedIn</b>
            <small>professional network</small>
          </a>
        </li>
        <li>
          <a href={CONTACT[0].href}>
            <b>E-mail</b>
            <small>still the best</small>
          </a>
        </li>
      </ul>
    </div>
  );
}
