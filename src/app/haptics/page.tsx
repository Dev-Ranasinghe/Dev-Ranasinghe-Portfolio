import type { Metadata } from "next";
import HapticsTest from "./HapticsTest";

// Temporary diagnostics: does this phone let the web vibrate at all?
export const metadata: Metadata = {
  title: "Haptics test",
  robots: { index: false, follow: false },
};

export default function HapticsPage() {
  return <HapticsTest />;
}
