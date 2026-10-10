import type { Metadata, Viewport } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt = VT323({
  variable: "--font-vt",
  weight: "400",
  subsets: ["latin"],
});

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
    <html lang="en" className={vt.variable}>
      <body>{children}</body>
    </html>
  );
}
