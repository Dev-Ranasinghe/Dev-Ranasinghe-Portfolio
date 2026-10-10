import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import World16 from "@/components/w16/World16";
import "./w16.css";

const montserrat = Montserrat({ variable: "--font-montserrat", weight: ["300", "400", "500", "600", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Ranasinghe 2016",
  description: "Dev Ranasinghe, ML engineer and full-stack developer, as a 2016 one-page portfolio: projects, experience, skills and contact.",
};

export default function Page2016() {
  return (
    <div className={montserrat.variable}>
      <World16 />
    </div>
  );
}
