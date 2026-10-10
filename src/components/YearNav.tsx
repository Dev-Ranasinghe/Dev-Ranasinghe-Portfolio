"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ERAS = [
  { year: 1986, href: "/" },
  { year: 1996, href: "/1996" },
  { year: 2006, href: "/2006" },
  { year: 2016, href: "/2016" },
] as const;

type Era = (typeof ERAS)[number]["year"];

/** Time-machine year switcher, dressed in whichever era it sits in. */
export default function YearNav({ era, onTravel }: { era: Era; onTravel?: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // arriving in a new year: clear the warp left by the previous one
    delete document.documentElement.dataset.warp;
    ERAS.forEach((e) => e.year !== era && router.prefetch(e.href));
  }, [era, router]);

  const travel = (href: string, year: number) => (ev: React.MouseEvent) => {
    if (year === era) return;
    ev.preventDefault();
    onTravel?.();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.dataset.warp = "out";
    setTimeout(() => router.push(href), reduced ? 0 : 520);
  };

  return (
    <nav className={`yearnav yearnav-${era}`} aria-label="Time machine">
      {ERAS.map((e) => (
        <a
          key={e.year}
          href={e.href}
          onClick={travel(e.href, e.year)}
          aria-current={e.year === era ? "page" : undefined}
        >
          {e.year}
        </a>
      ))}
    </nav>
  );
}

/** Imperative travel for in-page "GO TO 19XX" buttons. */
export function useTravel() {
  const router = useRouter();
  return (href: string) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.dataset.warp = "out";
    setTimeout(() => router.push(href), reduced ? 0 : 520);
  };
}
