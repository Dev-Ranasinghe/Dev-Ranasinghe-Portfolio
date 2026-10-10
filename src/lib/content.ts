export type LineKind = "normal" | "bright" | "dim" | "error" | "rule";

export type Line = {
  text: string;
  kind?: LineKind;
  href?: string;
};

const L = (text: string, kind?: LineKind, href?: string): Line => ({ text, kind, href });
const BLANK: Line = { text: "" };
const rule = (title: string): Line => L(`== ${title} `.padEnd(48, "="), "rule");

export const SYSOP = "DEV RANASINGHE";
export const BOARD = "DEV'S BBS";

export type MenuItem = { key: string; command: string; label: string };

export const MENU: MenuItem[] = [
  { key: "P", command: "PROJECTS", label: "Projects / ML Research" },
  { key: "W", command: "WORK", label: "Work / Employment History" },
  { key: "S", command: "SKILLS", label: "Skills & Languages" },
  { key: "E", command: "EDUCATION", label: "Education" },
  { key: "A", command: "ABOUT", label: "About The SysOp" },
  { key: "C", command: "CERTS", label: "Certificates & Awards" },
  { key: "M", command: "CONTACT", label: "Contact / Electronic Mail" },
  { key: "G", command: "GAME", label: "Door Game: GRADIENT DESCENT" },
  { key: "X", command: "EXIT", label: "Hang Up" },
];

export const SECTIONS: Record<string, Line[]> = {
  ABOUT: [
    rule("ABOUT THE SYSOP"),
    L("NAME .... Dev Ranasinghe", "bright"),
    L("ROLE .... Freelance ML Engineer + Full-Stack Web Developer"),
    L("STUDY ... BSc (Hons) Computer Science, IIT / Univ. of Westminster"),
    L("FOCUS ... Computer vision, explainable AI, RAG systems"),
    BLANK,
    L("I build machine learning systems end to end: data preprocessing, training, evaluation and deployment behind a real API. My recent work is a two-stage deep learning pipeline that detects malaria parasites across 16 classes and explains its own decisions with Grad-CAM and Gemini-generated clinical reports."),
    BLANK,
    L("I also ship production web apps (Next.js, React, Node, PostgreSQL), so my models do not stop at a notebook."),
  ],

  PROJECTS: [
    rule("PROJECTS"),
    L("[1] AUTOMATED MALARIA PARASITE DETECTION w/ EXPLAINABLE AI", "bright"),
    L("    2025 .......... Final year research project", "dim"),
    L("  * Two-stage deep learning pipeline for fine-grained parasite detection across 16 classes in blood smears."),
    L("  * Injected CBAM attention into YOLOv8m-seg."),
    L("  * Hard-negative-mined ResNet18 binary validator: -15.4% false positives, recall held above 0.94.", "bright"),
    L("  * WSI tiling pipeline for slide-level diagnosis."),
    L("  * Dual-layer explainability: Grad-CAM heatmaps + Gemini-generated clinical reports."),
    L("  * Served through a Flask REST API."),
    L("    STACK: Python PyTorch YOLOv8 ResNet18 OpenCV Grad-CAM Flask Google-Gemini-API", "dim"),
    BLANK,
    L("[2] AI DOCUMENT CHATBOT w/ RAG", "bright"),
    L("    2025", "dim"),
    L("  * Retrieval-Augmented Generation pipeline for question answering over your own documents."),
    L("  * Semantic search with embeddings in a FAISS index."),
    L("  * LangChain + API-based LLMs with prompt engineering for accurate, context-aware answers."),
    L("    STACK: Python LangChain FAISS OpenAI-API Flask", "dim"),
    BLANK,
    L("More source code on GitHub: type CONTACT.", "dim"),
  ],

  WORK: [
    rule("EMPLOYMENT HISTORY"),
    L("FREELANCE ML ENGINEER", "bright"),
    L("Independent Contractor ...... FEB 2025 - PRESENT", "dim"),
    L("  * Delivered end-to-end ML solutions: preprocessing, training, evaluation and deployment."),
    L("  * Built predictive and classification models using regression, ensembles and neural networks to hit project-specific accuracy targets."),
    L("  * Automated evaluation pipelines and reporting, cutting manual analysis and speeding up experiment iteration."),
    L("    STACK: Python scikit-learn TensorFlow PyTorch Pandas NumPy Jupyter FastAPI Git", "dim"),
    BLANK,
    L("FREELANCE WEB DEVELOPER", "bright"),
    L("Independent Contractor ...... AUG 2024 - PRESENT", "dim"),
    L("  * Full-stack e-commerce platforms with payment gateways, product management and responsive storefronts."),
    L("  * SaaS apps with authentication, subscriptions and dynamic dashboards so clients self-manage users."),
    L("  * 3D interactive Spline scenes on client landing pages."),
    L("    STACK: Next.js React Spline Tailwind Node.js REST PostgreSQL Vercel", "dim"),
  ],

  EDUCATION: [
    rule("EDUCATION"),
    L("INFORMATICS INSTITUTE OF TECHNOLOGY", "bright"),
    L("Affiliated to the University of Westminster, London"),
    L("BSc (Hons) Computer Science ...... JAN 2024 - SEP 2026", "dim"),
    BLANK,
    L("RELEVANT COURSEWORK:"),
    L("  Machine Learning ......... Applied AI"),
    L("  Data Mining .............. Algorithms"),
    L("  Operational Research & Optimisation"),
    L("  Mathematics for Computing  Database Systems"),
    L("  Client-Server Architectures  Cyber Security"),
    L("  Object Oriented Programming  Software Development"),
    L("  Usability Testing & Evaluation  Web Design"),
    L("  Final Year Project (Malaria detection w/ XAI)"),
  ],

  SKILLS: [
    rule("SKILLS & LANGUAGES"),
    L("LANGUAGES", "bright"),
    L("  Python  Java  JavaScript  TypeScript  SQL"),
    BLANK,
    L("MACHINE LEARNING / VISION", "bright"),
    L("  PyTorch  TensorFlow  scikit-learn  YOLO  ResNet"),
    L("  OpenCV  Grad-CAM  Pandas  NumPy  Jupyter"),
    BLANK,
    L("LLM / GEN-AI", "bright"),
    L("  LangChain  FAISS  OpenAI API  Google Gemini API"),
    BLANK,
    L("BACKEND / WEB", "bright"),
    L("  FastAPI  Flask  Node.js  REST APIs  PostgreSQL"),
    L("  Next.js  React  Tailwind CSS  Vercel  Git"),
  ],

  CERTS: [
    rule("CERTIFICATES & AWARDS"),
    L("  * Machine Learning Specialization ........ Coursera"),
    L("  * Deep Learning Specialization ........... Coursera"),
    L("  * Python for Data Science & ML Bootcamp ..... Udemy"),
    L("  * Complete Data Science Bootcamp ............ Udemy"),
    BLANK,
    L("MENTOR @ TEACHERON", "bright"),
    L("  Helping students with programming, problem solving and machine learning concepts."),
  ],

  CONTACT: [
    rule("CONTACT / ELECTRONIC MAIL"),
    L("Leave the SysOp a message. Links are live:"),
    BLANK,
    L("E-MAIL ..... 999sasmith@gmail.com", "bright", "mailto:999sasmith@gmail.com"),
    L("GITHUB ..... github.com/Dev-Ranasinghe", "bright", "https://github.com/Dev-Ranasinghe"),
    L("LINKEDIN ... linkedin.com/in/dev-ranasinghe", "bright", "https://www.linkedin.com/in/dev-ranasinghe/"),
    BLANK,
    L("Open to ML engineering roles and internships.", "dim"),
  ],
};

export const ALIASES: Record<string, string> = {
  A: "ABOUT",
  P: "PROJECTS",
  W: "WORK",
  E: "EDUCATION",
  S: "SKILLS",
  C: "CERTS",
  M: "CONTACT",
  MAIL: "CONTACT",
  EMAIL: "CONTACT",
  G: "GAME",
  X: "EXIT",
  QUIT: "EXIT",
  BYE: "EXIT",
  DIR: "HELP",
  "?": "HELP",
  H: "HELP",
  CLEAR: "CLS",
  EXPERIENCE: "WORK",
  CERTIFICATES: "CERTS",
  CV: "RESUME",
};

export const HELP: Line[] = [
  rule("DIRECTORY"),
  L(" Volume in drive C is DEVS-BBS", "dim"),
  ...MENU.map((m) => L(` ${m.command.padEnd(10)} <CMD>   ${m.label}`)),
  L(` ${"MENU".padEnd(10)} <CMD>   Redraw the main menu`),
  L(` ${"CLS".padEnd(10)} <CMD>   Clear the screen`),
  L(` ${"SOUND".padEnd(10)} <CMD>   Toggle the speaker`),
  L("Single letters work too, e.g. P for PROJECTS.", "dim"),
];

export function welcome(caller: number, date: string): Line[] {
  return [
    L("CONNECT 1200", "bright"),
    L(`Welcome, GUEST. You are caller #${caller.toLocaleString("en-US").padStart(7, "0")}.`),
    L(`SysOp: ${SYSOP}`),
    L(`Last on: ${date}`),
    L(">> ML engineer on the line. Projects are on file [P]."),
    L("> SYSTEM READY. Type HELP or pick from the menu."),
  ];
}
