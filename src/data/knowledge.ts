import { achievements, clubs, experience, profile, projects, skillGroups } from "./portfolio.js";
import type { Chunk } from "../lib/retrieve";

// The assistant's entire "memory". It is generated from the same data that renders the
// site, so the chatbot can never disagree with the page. Placeholder (TODO) text is skipped.

const real = (s: string) => !s.startsWith("TODO");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const knowledge: Chunk[] = [
  {
    id: "summary", title: "Who is Pratibimb Gupta - overview",
    text: `${profile.name} is a B.Tech Computer Science and Engineering student at SRM Institute of Science and Technology (SRMIST), Chennai, with a CGPA of 9.65/10. ${profile.tagline} He is an aspiring AI engineer who works on LLMs, RAG, Agentic AI, cloud (AWS) and geospatial AI.`,
  },
  {
    id: "education", title: "Education - SRMIST B.Tech CSE, CGPA",
    text: "B.Tech in Computer Science and Engineering at SRM Institute of Science and Technology, Chennai, May 2023 to present. CGPA 9.65 out of 10. He received the Best Academic Achiever Award in August 2025.",
  },
  ...experience.map((e): Chunk => ({
    id: `exp-${slug(e.org)}`,
    title: `Internship experience - ${e.org} (${e.role})`,
    text: [
      `${e.role} at ${e.org}${real(e.when) ? `, ${e.when}` : ""}${e.place ? `, ${e.place}` : ""}.`,
      e.about ?? "",
      ...e.points.filter(real),
      e.stack?.length ? `Tools: ${e.stack.join(", ")}.` : "",
      ...(e.outcomes ?? []).filter(real),
    ].filter(Boolean).join(" "),
  })),
  ...projects.map((p): Chunk => ({
    id: `proj-${slug(p.title)}`,
    title: `Project - ${p.title}`,
    text: `${p.title} (${p.when}). Built with ${p.stack.join(", ")}. ${p.points.join(" ")} ${p.metric ? `Result: ${p.metric}.` : ""} ${p.link ? `Code: ${p.link}` : ""}`,
  })),
  ...skillGroups.map((g): Chunk => ({
    id: `skills-${slug(g.title)}`, title: `Skills - ${g.title}`,
    text: `${g.title} skills: ${g.items.join(", ")}.`,
  })),
  {
    id: "certs", title: "Certifications - AWS, Salesforce, Oracle",
    text: "Certifications: " + achievements.filter((a) => /Certified|Specialist|OCP/.test(a.title)).map((a) => `${a.title} (${a.sub})`).join("; ") + ".",
  },
  {
    id: "awards", title: "Awards and achievements - hackathons, positions",
    text: "Achievements: " + achievements.filter((a) => !/Certified|Specialist|OCP/.test(a.title)).map((a) => `${a.title} (${a.sub})`).join("; ") + ". He placed 3rd at both Techxcelerate (BITS Pilani Hyderabad) and Hack The Cosmos (CSI, SRMIST).",
  },
  ...clubs.map((c): Chunk => ({
    id: `club-${slug(c.name)}`, title: `Leadership - ${c.name} (${c.role})`,
    text: `${c.role} at ${c.name}, ${c.when}. ${c.blurb}`,
  })),
  {
    id: "contact", title: "Contact, resume and links",
    text: `Email: ${profile.email}. Phone: ${profile.phone}. GitHub: ${profile.links.github}. LinkedIn: ${profile.links.linkedin}. LeetCode: ${profile.links.leetcode}. Resume: available from the Resume button on this site. Based in ${profile.location}.`,
  },
  {
    id: "dsa", title: "Competitive programming - LeetCode and DSA",
    text: "He has solved 150+ LeetCode problems and has a strong base in data structures, algorithms, OOP, DBMS and operating systems. He mostly works in C/C++, Java and Python.",
  },
  {
    id: "site", title: "About this portfolio website",
    text: "This portfolio is built with React, TypeScript, Tailwind CSS, Three.js and Motion. It includes an 8-level shooter game called Debug Quest and this retrieval-augmented assistant, which retrieves from the portfolio content with BM25 and answers with a free open-source LLM (or falls back to retrieval-only answers).",
  },
];
