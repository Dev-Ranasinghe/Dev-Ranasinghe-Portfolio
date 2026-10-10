"use client";

import { useEffect, useState } from "react";
import MonoContrastPreloader from "@/components/ui/mono-contrast-preloader";
import "./site-preloader.css";

/**
 * Gate shown on the first full load of any era. It sits over the page rather than
 * wrapping it, so the era underneath loads, scrolls and sizes itself as normal;
 * client-side travel between years never remounts the layout, so it plays once.
 */
export default function SitePreloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [done]);

  if (done) return null;

  return (
    <div className="site-preloader">
      {/* transparent root: the gate fades straight onto the page, not onto black */}
      <MonoContrastPreloader word="DEV" durationMs={2600} className="!bg-transparent" onComplete={() => setDone(true)} />
    </div>
  );
}
