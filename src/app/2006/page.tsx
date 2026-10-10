import type { Metadata } from "next";
import World06 from "@/components/w06/World06";
import "./w06.css";

export const metadata: Metadata = {
  title: "dev.ranasinghe '06 · 2.0 BETA",
  description: "Dev Ranasinghe, ML engineer and full-stack developer, as a 2006 Web 2.0 blog: projects, experience, skills and contact.",
};

export default function Page2006() {
  return <World06 />;
}
