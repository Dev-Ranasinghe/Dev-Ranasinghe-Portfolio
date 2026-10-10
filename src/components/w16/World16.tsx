"use client";

import { useEffect, useRef, useState } from "react";
import YearNav from "@/components/YearNav";
import { CERTS, CONTACT, EDUCATION, MENTOR, PERSON, PHOTO, PROJECTS, SKILLS, WORK } from "@/lib/cv";
import { makePhotostream } from "@/components/w06/photostream";

const NAV = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const ROLES = ["machine learning pipelines.", "explainable AI.", "computer vision models.", "full-stack web apps.", "RAG chatbots."];

export default function World16() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cookie, setCookie] = useState(false);
  const [covers, setCovers] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // header shrink + back-to-top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scrollspy + AOS-style fade-up reveals
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    root.querySelectorAll("section[id]").forEach((s) => spy.observe(s));

    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".aos").forEach((el) => reveal.observe(el));
    return () => {
      spy.disconnect();
      reveal.disconnect();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      let seen = false;
      try {
        seen = window.localStorage.getItem("w16-cookies") === "ok";
      } catch {
        /* storage blocked: show the banner every visit, like 2016 */
      }
      setCookie(!seen);
      setCovers(makePhotostream(360).map((s) => s.url));
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const acceptCookies = () => {
    setCookie(false);
    try {
      window.localStorage.setItem("w16-cookies", "ok");
    } catch {
      /* fine */
    }
  };

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(id);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="w16" ref={rootRef}>
      <YearNav era={2016} />

      <header className={`w16-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="w16-brand" onClick={jump("top")}>
          {PERSON.name} <span>2016</span>
        </a>
        <button type="button" className={`w16-burger ${menuOpen ? "is-open" : ""}`} aria-expanded={menuOpen} aria-controls="w16-nav" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
          <span className="sr-only">Menu</span>
        </button>
        <nav id="w16-nav" className={`w16-nav ${menuOpen ? "is-open" : ""}`} aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={jump(n.id)} aria-current={active === n.id ? "true" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="top" className="w16-hero">
        <div className="w16-avatar w16-in">
          {PHOTO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PHOTO} alt={PERSON.name} />
          ) : (
            <span aria-hidden="true">DR</span>
          )}
        </div>
        <h1 className="w16-in">
          Hi, I&apos;m <b>{PERSON.name}</b>.
        </h1>
        <p className="w16-role w16-in">{PERSON.role}</p>
        <p className="w16-sub w16-in">{PERSON.study}</p>
        <p className="w16-typed w16-in" aria-label={`I build ${ROLES.join(", ")}`}>
          I build <Typed words={ROLES} />
        </p>
        <a href="#contact" className="w16-btn w16-in" onClick={jump("contact")}>
          Get in touch
        </a>
      </section>

      <section id="about" className="w16-band w16-dark">
        <div className="w16-narrow">
          <h2 className="aos">About me</h2>
          {PERSON.summary.map((p) => (
            <p key={p} className="aos">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section id="projects" className="w16-band w16-grey">
        <p className="w16-kicker aos">Projects</p>
        <h2 className="aos">What I&apos;ve built</h2>
        <div className="w16-projects">
          {PROJECTS.map((p, i) => (
            <article key={p.name} className="w16-project aos">
              <div className="w16-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {covers.length ? <img src={covers[i === 0 ? 2 : 5]} alt="" /> : <span />}
                <span className="w16-cover-tag">{p.year}</span>
              </div>
              <div className="w16-project-body">
                <h3>{p.name}</h3>
                <p className="w16-project-tag">{p.tag}</p>
                <p>{p.summary}</p>
                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <p className="w16-stack">{p.stack}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="w16-band">
        <p className="w16-kicker aos">Experience</p>
        <h2 className="aos">Where I&apos;ve worked</h2>
        <div className="w16-timeline">
          {WORK.map((j) => (
            <article key={j.title} className="w16-job aos">
              <p className="w16-when">{j.dates}</p>
              <div>
                <h3>{j.title}</h3>
                <p className="w16-org">{j.org}</p>
                <ul>
                  {j.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <p className="w16-stack">{j.stack}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="education" className="w16-band w16-white">
        <p className="w16-kicker aos">Education</p>
        <h2 className="aos">What I studied</h2>
        <div className="w16-edu aos">
          <p className="w16-when">{EDUCATION.dates}</p>
          <div>
            <h3>{EDUCATION.school}</h3>
            <p>{EDUCATION.degree} · {EDUCATION.affiliation}</p>
          </div>
        </div>
        <ul className="w16-pills w16-narrow aos">
          {EDUCATION.coursework.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section id="skills" className="w16-band w16-grey">
        <p className="w16-kicker aos">Skills</p>
        <h2 className="aos">Skills &amp; languages</h2>
        <div className="w16-narrow">
          {SKILLS.map((g, i) => (
            <div key={g.group} className="aos">
              <h3 className="w16-group">{g.group}</h3>
              <ul className={`w16-pills ${i === 0 ? "is-teal" : ""}`}>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
          <ul className="w16-certs aos">
            {CERTS.map((c) => (
              <li key={c.name}>
                {c.name} · {c.by}
              </li>
            ))}
            <li>{MENTOR}</li>
          </ul>
        </div>
      </section>

      <section id="contact" className="w16-band w16-white w16-cta">
        <h2 className="aos">Let&apos;s work together</h2>
        <p className="aos">Got an ML role or a project in mind? I&apos;d love to hear about it.</p>
        <a className="w16-btn aos" href={CONTACT[0].href}>
          Say hello
        </a>
        <ul className="w16-social aos">
          {CONTACT.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                <span className="w16-social-label">{c.label}</span>
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="w16-footer">
        <p>
          © 2016 {PERSON.name}. Made with <span aria-label="love">♥</span> and Bootstrap 3.
        </p>
      </footer>

      <a href="#top" className={`w16-top ${scrolled ? "is-shown" : ""}`} onClick={jump("top")} aria-label="Back to top">
        <span aria-hidden="true" />
      </a>

      {cookie && (
        <div className="w16-cookie" role="region" aria-label="Cookie notice">
          <p>This website uses cookies to ensure you get the best experience on our website.</p>
          <button type="button" onClick={acceptCookies}>
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}

/** Typed.js, the most 2016 thing on any portfolio. */
function Typed({ words }: { words: string[] }) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setText(words[0]), 0);
      return () => clearTimeout(t);
    }
    let w = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setText(word.slice(0, i));
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [words]);
  return (
    <span className="w16-typed-text" aria-hidden="true">
      {text}
      <span className="w16-caret" />
    </span>
  );
}
