import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import World96 from "@/components/w96/World96";
import "./w96.css";

const comic = Comic_Neue({ variable: "--font-comic", weight: ["700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Ranasinghe's World 96",
  description: "Dev Ranasinghe, ML engineer and full-stack developer, as a 1996 personal homepage: projects, work, skills and contact.",
};

export default function Page1996() {
  return (
    <div className={comic.variable}>
      <World96 />
    </div>
  );
}
