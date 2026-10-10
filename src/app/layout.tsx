import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Saira_Extra_Condensed, VT323 } from "next/font/google";
import SitePreloader from "@/components/SitePreloader";
import TimeMachine from "@/components/TimeMachine";
import "./globals.css";

const vt = VT323({
  variable: "--font-vt",
  weight: "400",
  subsets: ["latin"],
});

// preloader faces: the tumbling cube and its percentage counter
const saira = Saira_Extra_Condensed({ variable: "--font-saira", weight: "900", subsets: ["latin"] });
const plex = IBM_Plex_Mono({ variable: "--font-plex", weight: "700", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Ranasinghe · ML Engineer",
  description:
    "Dev Ranasinghe: ML engineer and full-stack developer. Dial into the BBS to see projects in explainable AI, computer vision and RAG.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${vt.variable} ${saira.variable} ${plex.variable}`}>
      <body>
        {children}
        <TimeMachine />
        <SitePreloader />
      </body>
    </html>
  );
}
