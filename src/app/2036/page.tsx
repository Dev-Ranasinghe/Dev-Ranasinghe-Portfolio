import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import World36 from "@/components/w36/World36";
import "./w36.css";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", weight: ["300", "400", "500", "700"], subsets: ["latin"] });
const mono = Space_Mono({ variable: "--font-spacemono", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Ranasinghe 2036 · Neuralink pairing",
  description: "Dev Ranasinghe's portfolio in 2036: pair your Neuralink to continue.",
};

export default function Page2036() {
  return (
    <div className={`${grotesk.variable} ${mono.variable}`}>
      <World36 />
    </div>
  );
}
