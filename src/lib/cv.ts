// Structured CV data for the graphical eras. Source of truth: Dev's CV.

/** Set to a file in /public (e.g. "/dev.jpg") to show a real photo in 1996. */
export const PHOTO: string | null = null;

export const PERSON = {
  name: "Dev Ranasinghe",
  role: "Freelance ML Engineer & Full-Stack Web Developer",
  study: "BSc (Hons) Computer Science · IIT / University of Westminster",
  summary: [
    "I build machine learning systems end to end: data preprocessing, training, evaluation and deployment behind a real API.",
    "My recent work is a two-stage deep learning pipeline that detects malaria parasites across 16 classes and explains its own decisions with Grad-CAM and Gemini-generated clinical reports.",
    "I also ship production web apps with Next.js, React, Node and PostgreSQL, so my models never stop at a notebook.",
  ],
  status: "Open to ML engineering roles & internships",
};

export const CONTACT = [
  { label: "E-mail", value: "999sasmith@gmail.com", href: "mailto:999sasmith@gmail.com" },
  { label: "GitHub", value: "github.com/Dev-Ranasinghe", href: "https://github.com/Dev-Ranasinghe" },
  { label: "LinkedIn", value: "linkedin.com/in/dev-ranasinghe", href: "https://www.linkedin.com/in/dev-ranasinghe/" },
];

export type Job = { title: string; org: string; dates: string; points: string[]; stack: string };

export const WORK: Job[] = [
  {
    title: "Freelance ML Engineer",
    org: "Independent Contractor",
    dates: "Feb 2025 - Present",
    points: [
      "Delivered end-to-end ML solutions covering data preprocessing, model training, evaluation and deployment.",
      "Built predictive and classification models with regression, ensemble methods and neural networks to hit project-specific accuracy targets.",
      "Automated model evaluation pipelines and reporting, cutting manual analysis and speeding up iteration across experiments.",
    ],
    stack: "Python, scikit-learn, TensorFlow, PyTorch, Pandas, NumPy, Jupyter, FastAPI, Git",
  },
  {
    title: "Freelance Web Developer",
    org: "Independent Contractor",
    dates: "Aug 2024 - Present",
    points: [
      "Designed and built full-stack e-commerce platforms with payment gateways, product management and responsive storefronts.",
      "Delivered SaaS web apps with authentication, subscription management and dynamic dashboards so clients manage users themselves.",
      "Added interactive 3D Spline scenes to client landing pages for stronger engagement and brand differentiation.",
    ],
    stack: "Next.js, React, Spline, Tailwind CSS, Node.js, REST APIs, PostgreSQL, Vercel",
  },
];

export type Project = { name: string; year: string; tag: string; summary: string; points: string[]; stack: string };

export const PROJECTS: Project[] = [
  {
    name: "Automated Malaria Parasite Detection with Explainable AI",
    year: "2025",
    tag: "Final year research project",
    summary: "A two-stage deep learning pipeline for fine-grained malaria parasite detection across 16 classes from blood smear images.",
    points: [
      "Injected CBAM attention into YOLOv8m-seg for fine-grained detection.",
      "Hard-negative-mined ResNet18 binary validator cut false positives by 15.4% while keeping recall above 0.94.",
      "WSI tiling pipeline for slide-level diagnosis.",
      "Dual-layer explainability: Grad-CAM heatmaps plus Gemini-generated clinical reports, served through a Flask REST API.",
    ],
    stack: "Python, PyTorch, YOLOv8, ResNet18, OpenCV, Grad-CAM, Flask, Google Gemini API",
  },
  {
    name: "AI Document Chatbot with RAG",
    year: "2025",
    tag: "Retrieval-Augmented Generation",
    summary: "A chatbot that answers questions over your own documents using a Retrieval-Augmented Generation pipeline.",
    points: [
      "Semantic search with embeddings stored in a FAISS index.",
      "LangChain with API-based LLMs and prompt engineering for accurate, context-aware answers.",
    ],
    stack: "Python, LangChain, FAISS, OpenAI API, Flask",
  },
];

export const EDUCATION = {
  school: "Informatics Institute of Technology",
  affiliation: "Affiliated to the University of Westminster, London",
  degree: "BSc (Hons) in Computer Science",
  dates: "Jan 2024 - Sep 2026",
  coursework: [
    "Machine Learning",
    "Applied AI",
    "Data Mining",
    "Algorithms",
    "Operational Research & Optimisation",
    "Mathematics for Computing",
    "Database Systems",
    "Client-Server Architectures",
    "Cyber Security",
    "Object Oriented Programming",
    "Software Development",
    "Usability Testing & Evaluation",
    "Web Design",
    "Final Year Project",
  ],
};

export const SKILLS = [
  { group: "Languages", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL"] },
  { group: "Machine Learning & Vision", items: ["PyTorch", "TensorFlow", "scikit-learn", "YOLO", "ResNet", "OpenCV", "Grad-CAM", "Pandas", "NumPy", "Jupyter"] },
  { group: "LLM & Gen-AI", items: ["LangChain", "FAISS", "OpenAI API", "Google Gemini API"] },
  { group: "Backend & Web", items: ["FastAPI", "Flask", "Node.js", "REST APIs", "PostgreSQL", "Next.js", "React", "Tailwind CSS", "Vercel", "Git"] },
];

export const CERTS = [
  { name: "Machine Learning Specialization", by: "Coursera" },
  { name: "Deep Learning Specialization", by: "Coursera" },
  { name: "Python for Data Science and Machine Learning Bootcamp", by: "Udemy" },
  { name: "Complete Data Science Bootcamp", by: "Udemy" },
];

export const MENTOR = "Mentor at TeacherOn: helping students with programming, problem solving and machine learning concepts.";
