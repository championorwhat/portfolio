// ============================================================
// All portfolio content lives here. Edit this file only.
// Search for "TODO" for things you need to fill in.
// ============================================================

// Folder with all certificates / documents.
export const DRIVE =
  "https://drive.google.com/drive/folders/1sTqI5jDnQ9FQsKnBtCTCmxRpccnUe5mk?usp=share_link";

export const profile = {
  name: "Pratibimb Gupta",
  initials: "PG",
  email: "iampratibimb07rc@gmail.com",
  phone: "+91 9650436564",
  location: "Chennai, India",
  resume: "/Pratibimb_Gupta_Resume.pdf",
  roles: ["Aspiring AI Engineer", "Team Leader", "AlgoRiders", "Building intelligent systems"],
  tagline:
    "CSE student at SRMIST (CGPA 9.65) building LLM-powered systems, cloud-native backends and geospatial AI. Best Academic Achiever, hackathon podium finisher and relentless tinkerer.",
  links: {
    github: "https://github.com/championorwhat",
    linkedin: "https://www.linkedin.com/in/pratibimb-gupta-20b918288/",
    leetcode: "https://leetcode.com/u/pratibimb__gupta/",
    drive: DRIVE,
  },
};

export const skillGroups: { title: string; icon: string; items: string[]; focus: Focus[] }[] = [
  { focus: ["ai","cloud"], title: "Languages", icon: "💻", items: ["C/C++", "Java", "Python", "Go", "SQL", "JavaScript", "TypeScript"] },
  { focus: ["cloud"], title: "Cloud & Backend", icon: "☁️", items: ["AWS", "Cloud-Native", "Microservices", "Grafana", "REST APIs", "FastAPI", "Django"] },
  { focus: ["ai","research"], title: "Data Science & AI", icon: "🤖", items: ["Deep Learning", "LLMs", "Agentic AI", "RAG", "Prompt Engineering", "NLP", "LangChain"] },
  { focus: ["cloud"], title: "Databases", icon: "🗄️", items: ["MySQL", "MongoDB", "PostgreSQL"] },
  { focus: ["cloud","research"], title: "Core CS", icon: "🧠", items: ["DSA", "OOP", "Algorithms", "DBMS", "Operating Systems", "SDLC", "Agile/Scrum", "Debugging"] },
  { focus: ["cloud"], title: "Tools", icon: "🛠️", items: ["Git", "GitHub Actions", "Jenkins", "Postman", "VS Code", "QGIS", "MySQL Workbench"] },
];

export interface Experience {
  focus: Focus[];
  org: string; role: string; when: string; place: string; doc: string;
  about?: string; stack?: string[]; points: string[]; outcomes?: string[];
}

export const experience: Experience[] = [
  {
    focus: ["ai", "cloud"],
    org: "PwC",
    role: "Intern, Intelligent Digital Enterprise (Advisory LOS)",
    when: "May 2026 – Jul 2026",
    place: "Chennai",
    doc: "https://drive.google.com/file/d/1mMoYVXAojRm_Vv0OH6dvh1rfKNHT-seC/view?usp=sharing",
    points: [
      "Contributed to AI-driven enterprise solutions using LLMs, Agentic AI, AWS and automation.",
      "Supported design of scalable technology solutions, translating business requirements into implementations.",
      "Applied GenAI and cloud technologies to automate and improve workflows.",
    ],
  },
  {
    focus: ["cloud", "ai"],
    org: "Privacera",
    role: "Intern", 
    when: "Dec 2024 - Jan 2025",
    place: "", // TODO: city, or "Remote"
    doc: "https://drive.google.com/file/d/1YUyc1eoFO6H5eLJR2yu91-3jPD6hhaNj/view?usp=sharing",
    about: "Privacera builds data security and access-governance software that helps enterprises control who can see what across their cloud data estate.",
    stack: ["PAIG", "Vector databases", "Qdrant", "Open source"],
    points: [
      "Worked on PAIG, an open-source project, as part of my internship.",
      "Learned how vector databases work and got hands-on with Qdrant.",
    ],
    outcomes: [],
  },
  {
    focus: ["research", "ai"],
    org: "CAIR Lab, DRDO",
    role: "Research Intern",
    when: "May 2025 – Jul 2025",
    place: "Bangalore",
    doc: "https://drive.google.com/file/d/1UUO8efGkEPW_V05X67P6K-rI_obYtmXa/view?usp=sharing",
    points: [
      "Built AI/ML solutions with Python, Deep Learning, NLP and LLMs for real research applications.",
      "Created custom datasets and models for change detection, powering geospatial AI workflows.",
      "Developed a QGIS plugin for automated spectral-index calculation; contributed to a domain-specific LLM via prompt engineering.",
    ],
  },
];

export const clubs = [
  {
    icon: "🧠",
    name: "Team Envision",
    role: "AI/ML & Editorial Head",
    when: "Jun 2024 – Jan 2026",
    blurb: "Led the AI/ML vertical and the editorial team.",
  },
  {
    icon: "🚀",
    name: "Founder's Club, SRM",
    role: "Associate Lead",
    when: "Mar 2023 – May 2026",
    blurb: "Helped run the campus entrepreneurship community.",
  },
];

export const projects = [
  {
    focus: ["ai", "cloud"],
    title: "RAG Code Generation & Automated Review",
    emoji: "🧩",
    when: "Dec 2025 – Present",
    stack: ["Python", "FastAPI", "FAISS", "HuggingFace", "LLMs"],
    points: [
      "RAG pipeline that generates code and reviews it for correctness, quality and optimisation.",
      "FAISS vector retrieval over a curated code corpus.",
      "Secure sandbox to run untrusted AI-generated code.",
      "Deployed as a FastAPI service with generation and review endpoints.",
    ],
    link: "https://github.com/championorwhat/Optimised-Code-Generation-RAG",
  },
  {
    focus: ["research", "ai"],
    title: "QGIS Spectral-Index Plugin",
    emoji: "🛰️",
    when: "DRDO CAIR Lab · 2025",
    stack: ["Python", "QGIS", "Remote Sensing", "Deep Learning"],
    points: [
      "Automated spectral-index computation for geospatial analysis.",
      "Custom datasets and models for change detection.",
    ],
  },
  {
    focus: ["ai", "research"],
    title: "TeachMood - Real-Time Emotion Recognition",
    emoji: "😀",
    when: "Mar 2025 – May 2025",
    stack: ["TensorFlow.js", "DenseNet169", "FER-2013", "WebRTC", "Chrome APIs"],
    points: [
      "Browser extension for real-time facial emotion recognition in classrooms.",
      "Hybrid DenseNet169 + CNN model.",
    ],
    metric: "72.4% accuracy · 82% instructor satisfaction (25-user study)",
    link: "https://github.com/championorwhat/TeachMood",
  },
] as { focus: Focus[]; title: string; emoji: string; when: string; stack: string[]; points: string[]; metric?: string; link?: string }[];

// `href` -> link to the credential. Links for the four certifications come from the resume.
// TODO: the first four (awards / Intel) still point at the Drive folder - paste direct file links.
export const achievements = [
  { icon: "🏆", title: "Best Academic Achiever", sub: "SRMIST · Aug 2025", href: DRIVE },
  { icon: "🥉", title: "Techxcelerate - 3rd Place", sub: "BITS Pilani Hyderabad · Mar 2025", href: DRIVE },
  { icon: "🌌", title: "Hack The Cosmos - 3rd Place", sub: "CSI, SRMIST · Apr 2025", href: DRIVE },
  { icon: "🏭", title: "Intel Industrial Training", sub: "Completed · Jul 2025", href: DRIVE },
  { icon: "☁️", title: "AWS Certified Cloud Practitioner", sub: "Feb 2026", href: "https://www.credly.com/badges/058fe037-d296-499f-9b65-c71052ec3ebe/public_url" },
  { icon: "🧠", title: "AWS Certified AI Practitioner", sub: "Feb 2026", href: "https://www.credly.com/badges/1142062d-6de8-437b-b009-156708cca3e8/public_url" },
  { icon: "⚡", title: "Salesforce Certified Agentforce Specialist", sub: "Dec 2025", href: "https://trailhead.salesforce.com/en/credentials/certification-detail-print/?searchString=HMnTCIOlvcKyr2oCgZ/NE0k3R13UsqGMAsdB29TQh7i1giaMl47wD9Pcks/O7yvS" },
  { icon: "🐬", title: "Oracle MySQL 8.0 Database Developer (OCP)", sub: "Mar 2026", href: "https://drive.google.com/file/d/15EI-0DXKazh_dWbzXjo6zLRbmGpA1ZL-/view?usp=sharing" },
  { icon: "💡", title: "150+ LeetCode problems", sub: "Consistent DSA practice", href: "https://leetcode.com/u/pratibimb__gupta/" },
];

export const navItems = [
  ["about", "About"],
  ["skills", "Skills"],
  ["experience", "Experience"],
  ["clubs", "Clubs"],
  ["projects", "Projects"],
  ["achievements", "Wins"],
  ["play", "Play 🎮"],
  ["contact", "Contact"],
] as const;

// ============================================================
// Recruiter fast-path: "I'm hiring for..." focus modes
// ============================================================
export type Focus = "ai" | "cloud" | "research";

export const focusModes: Record<Focus, {
  label: string; icon: string; pitch: string;
  metrics: { value: string; label: string }[];
  questions: string[];
}> = {
  ai: {
    label: "AI / ML Engineer", icon: "🤖",
    pitch: "Builds LLM and RAG systems end to end: retrieval, evaluation, sandboxed execution and a deployed API. Experience at PwC (LLMs and Agentic AI) and DRDO (deep learning and NLP).",
    metrics: [
      { value: "3", label: "internships: PwC · Privacera · DRDO" },
      { value: "72.4%", label: "TeachMood emotion-model accuracy" },
      { value: "RAG", label: "FAISS + FastAPI code-review system" },
    ],
    questions: ["What did you build with RAG?", "What did you do at PwC?", "Tell me about TeachMood"],
  },
  cloud: {
    label: "Cloud / Backend Engineer", icon: "☁️",
    pitch: "Cloud-native backend developer with AWS Cloud and AI Practitioner certifications, FastAPI services in production-style deployments and a strong DSA and databases foundation.",
    metrics: [
      { value: "2× AWS", label: "Cloud + AI Practitioner certified" },
      { value: "150+", label: "LeetCode problems solved" },
      { value: "9.65", label: "CGPA, Best Academic Achiever" },
    ],
    questions: ["Which AWS certifications do you have?", "What backend tech do you use?", "What databases do you know?"],
  },
  research: {
    label: "Research / Applied Scientist", icon: "🔬",
    pitch: "Research intern at DRDO's CAIR Lab working on geospatial deep learning, custom datasets and a domain-specific LLM. Hackathon podium finisher with a top academic record.",
    metrics: [
      { value: "DRDO", label: "CAIR Lab research intern" },
      { value: "9.65", label: "CGPA, Best Academic Achiever" },
      { value: "2×", label: "3rd place at national hackathons" },
    ],
    questions: ["What research did you do at DRDO?", "Which hackathons did you win?", "Tell me about the QGIS plugin"],
  },
};
