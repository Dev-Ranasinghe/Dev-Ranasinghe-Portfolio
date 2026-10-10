import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import World46 from "@/components/w46/World46";
import "./w46.css";

const orbitron = Orbitron({ variable: "--font-orbitron", weight: ["400", "500", "700", "800"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Ranasinghe 2046",
  description: "Connecting to Dev Ranasinghe's consciousness via web browser was discontinued in 2041.",
};

export default function Page2046() {
  return (
    <div className={orbitron.variable}>
      <World46 />
    </div>
  );
}
