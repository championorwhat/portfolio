import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "../data/portfolio";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

type Line = { text: string; kind?: "ok" | "err" };

export function Terminal({ onTheme, onMatrix, onAsk }: { onTheme: () => void; onMatrix: () => void; onAsk: () => void }) {
  const [lines, setLines] = useState<Line[]>([{ text: "Welcome! Type 'help' to begin.", kind: "ok" }]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const idx = useRef(0);
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => { out.current?.scrollTo({ top: out.current.scrollHeight }); }, [lines]);

  const commands: Partial<Record<string, () => string | null>> = {
    help: () => "Commands: about, skills, experience, clubs, projects, links, ask, ls, whoami, education, certs, awards, contact, resume, theme, game, matrix, clear",
    about: () => "Pratibimb Gupta - CSE @ SRMIST (9.65 CGPA). AI/ML + cloud engineer. Best Academic Achiever.",
    skills: () => "Python, Go, Java, C/C++, SQL, JS/TS | AWS, FastAPI, Django, Microservices | LLMs, RAG, Agentic AI, LangChain | MySQL, MongoDB, PostgreSQL",
    experience: () => "PwC (Intern, 2026) · Privacera (Intern) · DRDO CAIR Lab (Research Intern, 2025)",
    clubs: () => "Team Envision - AI/ML & Editorial Head (Jun 2024 - Jan 2026) · Founder's Club SRM - Associate Lead (Mar 2023 - May 2026)",
    links: () => `GitHub: ${profile.links.github}\nLinkedIn: ${profile.links.linkedin}\nLeetCode: ${profile.links.leetcode}\nDocs: ${profile.links.drive}`,
    projects: () => "1) RAG Code Gen & Review (FastAPI + FAISS)\n2) TeachMood - emotion recognition extension (72.4% acc)\n3) QGIS spectral-index plugin",
    education: () => "B.Tech CSE, SRM Institute of Science and Technology, 2023-Present, CGPA 9.65/10",
    certs: () => "AWS Cloud Practitioner · AWS AI Practitioner · Salesforce Agentforce Specialist · Oracle MySQL 8.0 OCP",
    awards: () => "Best Academic Achiever · 3rd Techxcelerate · 3rd Hack The Cosmos · 150+ LeetCode",
    contact: () => `${profile.email} | ${profile.phone}`,
    resume: () => { window.open(profile.resume, "_blank"); return "Opening resume..."; },
    theme: () => { onTheme(); return "Theme toggled."; },
    game: () => { document.getElementById("play")?.scrollIntoView({ behavior: "smooth" }); return "Launching game..."; },
    matrix: () => { onMatrix(); return "Wake up, Neo..."; },
    ls: () => "about.md  skills.txt  experience/  clubs/  projects/  certificates/  resume.pdf  game.exe",
    pwd: () => "/home/pratibimb/portfolio",
    whoami: () => "a curious engineer who ships things 🚀",
    mkdir: () => "mkdir: permission denied - but you can hire me and I'll create a few directories 😉",
    cat: () => "meow 🐱  (try 'about' instead)",
    date: () => new Date().toString(),
    echo: () => "echo echo echo...",
    ask: () => { onAsk(); return "Opening the assistant..."; },
    sudo: () => "Nice try. Permission denied 😄",
    clear: () => { setLines([]); return null; },
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase().split(" ")[0];
    if (!cmd) return;
    setLines((l) => [...l, { text: `$ ${raw}` }]);
    const fn = Object.hasOwn(commands, cmd) ? commands[cmd] : undefined;
    if (cmd === "clear") { fn?.(); return; }
    const res = fn?.();
    setLines((l) => [...l, fn ? { text: res ?? "", kind: "ok" } : { text: `command not found: ${cmd}. Type 'help'.`, kind: "err" }]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { history.current.push(value); idx.current = history.current.length; run(value); setValue(""); }
    else if (e.key === "ArrowUp" && idx.current > 0) { e.preventDefault(); setValue(history.current[--idx.current]); }
    else if (e.key === "ArrowDown") { setValue(history.current[++idx.current] ?? ""); }
  };

  return (
    <section id="terminal" className="py-24">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading n="08" tag="terminal" sub="Type help to see what you can do.">
          Prefer the <span className="text-gradient">command line?</span>
        </SectionHeading>
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-[#05060d] font-mono text-sm text-[#d7ffe9]" onClick={() => document.getElementById("term-input")?.focus()}>
            <div className="flex items-center gap-1.5 bg-[#14172b] px-4 py-2">
              <i className="size-3 rounded-full bg-[#ff5f56]" /><i className="size-3 rounded-full bg-[#ffbd2e]" /><i className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs text-[#9aa0c3]">pratibimb@portfolio: ~</span>
            </div>
            <div ref={out} className="h-64 overflow-y-auto whitespace-pre-wrap break-words p-4" aria-live="polite">
              {lines.map((l, i) => <div key={i} className={l.kind === "ok" ? "text-accent" : l.kind === "err" ? "text-[#ff8fb0]" : ""}>{l.text}</div>)}
            </div>
            <div className="flex gap-2 border-t border-[#1e2240] px-4 py-3">
              <span className="text-[#00e5c3]">$</span>
              <input id="term-input" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey}
                autoComplete="off" spellCheck={false} aria-label="Terminal input" placeholder="type a command..."
                className="min-w-0 flex-1 bg-transparent text-white outline-none" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
