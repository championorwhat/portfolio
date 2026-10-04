export type EnemyKind = "drift" | "wave" | "zig" | "shooter" | "tank" | "dive";
export type BossKind = "monolith" | "hydra";
/** how a group of enemies enters the screen */
export type Pattern = "single" | "line" | "vee" | "snake" | "pincer" | "dive";

export interface Level {
  name: string;
  tech: string;
  intro: string;
  /** shown on the level-clear card; ties the game back to the resume */
  fact: string;
  total: number; // number of waves (groups) to spawn
  interval: number; // frames between waves
  speed: number;
  waves: [Pattern, EnemyKind, number][]; // pattern, enemy, weight
  boss?: BossKind;
}

export const LEVELS: Level[] = [
  { name: "Hello, World", tech: "C / C++", intro: "Everyone starts somewhere. Squash the first bugs.",
    fact: "Pratibimb started with C/C++ and DSA, and has solved 150+ LeetCode problems since.",
    total: 12, interval: 78, speed: 1, waves: [["single", "drift", 2], ["line", "drift", 3], ["vee", "drift", 2]] },
  { name: "Pythonic", tech: "Python", intro: "Bugs now slither in waves. Stay fluid.",
    fact: "Python powers his RAG pipeline, DRDO research models and FastAPI services.",
    total: 14, interval: 70, speed: 1.1, waves: [["snake", "wave", 4], ["line", "drift", 2], ["vee", "wave", 2], ["dive", "dive", 1]] },
  { name: "Cloud Nine", tech: "AWS", intro: "Distributed bugs flank you from the sides. Keep moving.",
    fact: "AWS Certified Cloud Practitioner and AI Practitioner, both Feb 2026.",
    total: 16, interval: 66, speed: 1.15, waves: [["pincer", "zig", 4], ["snake", "wave", 2], ["line", "drift", 2], ["dive", "dive", 2]] },
  { name: "The Monolith", tech: "Microservices", intro: "BOSS - a legacy monolith. Break it into microservices (with bullets).",
    fact: "He designs cloud-native, microservice-based backends instead of monoliths.",
    total: 9, interval: 130, speed: 1.1, waves: [["line", "drift", 2], ["dive", "dive", 2], ["single", "drift", 1]], boss: "monolith" },
  { name: "Neural Depths", tech: "Deep Learning", intro: "These bugs shoot back. Weave through the fire.",
    fact: "At DRDO's CAIR Lab he built deep-learning models for change detection in satellite imagery.",
    total: 18, interval: 62, speed: 1.2, waves: [["line", "shooter", 3], ["pincer", "zig", 2], ["snake", "wave", 2], ["dive", "dive", 2]] },
  { name: "Prompt Storm", tech: "LLMs", intro: "Heavy hitters that split apart when destroyed.",
    fact: "He contributed to a domain-specific LLM through prompt engineering, and interned on LLM and Agentic AI work at PwC.",
    total: 20, interval: 58, speed: 1.25, waves: [["single", "tank", 3], ["vee", "drift", 2], ["line", "shooter", 2], ["snake", "wave", 2], ["dive", "dive", 2]] },
  { name: "RAG Rift", tech: "RAG + FAISS", intro: "Everything at once. Retrieve your skills.",
    fact: "His RAG code-review system retrieves from a FAISS index and runs untrusted code in a secure sandbox.",
    total: 24, interval: 50, speed: 1.3, waves: [["pincer", "zig", 2], ["line", "shooter", 2], ["single", "tank", 2], ["snake", "wave", 2], ["vee", "drift", 1], ["dive", "dive", 2]] },
  { name: "Memory Leak Hydra", tech: "Final Boss", intro: "FINAL BOSS - it eats memory and never stops. Debug it!",
    fact: "You beat the Hydra! CGPA 9.65, Best Academic Achiever, and still shipping. Let's build something together.",
    total: 14, interval: 110, speed: 1.3, waves: [["single", "tank", 1], ["line", "shooter", 1], ["dive", "dive", 2]], boss: "hydra" },
];
