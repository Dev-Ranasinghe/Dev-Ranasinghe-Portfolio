"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { uiHover, uiPress } from "@/lib/sound";
import { requestJump } from "@/lib/timejump";

export const ERAS = [
  { year: 1986, href: "/1986" },
  { year: 1996, href: "/1996" },
  { year: 2006, href: "/2006" },
  { year: 2016, href: "/2016" },
  { year: 2036, href: "/2036" },
  { year: 2046, href: "/2046" },
] as const;

type Era = (typeof ERAS)[number]["year"];

/** Time-machine year switcher, dressed in whichever era it sits in. */
export default function YearNav({ era, onTravel }: { era: Era; onTravel?: () => void }) {
  const router = useRouter();

  useEffect(() => {
    ERAS.forEach((e) => e.year !== era && router.prefetch(e.href));
  }, [era, router]);

  const travel = (href: string, year: number) => (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (year === era) return;
    // modified clicks still open the year in a new tab the ordinary way
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
    ev.preventDefault();
    uiPress();
    onTravel?.();
    requestJump(href, ev.currentTarget);
  };

  return (
    <nav className={`yearnav yearnav-${era}`} aria-label="Time machine">
      {ERAS.map((e) => (
        <a
          key={e.year}
          href={e.href}
          onClick={travel(e.href, e.year)}
          onPointerEnter={(ev) => ev.pointerType === "mouse" && e.year !== era && uiHover()}
          aria-current={e.year === era ? "page" : undefined}
        >
          {e.year}
        </a>
      ))}
    </nav>
  );
}

/** Imperative travel for in-page "GO TO 19XX" buttons; the jump opens from whatever was pressed. */
export function useTravel() {
  return (href: string) => requestJump(href);
}
