import { useState } from "react";
import { navItems, profile } from "../data/portfolio";
import { useActiveSection } from "../hooks/useActiveSection";

const ids = navItems.map(([id]) => id);

export function Navbar({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);

  return (
    <nav className="fixed inset-x-0 top-0 z-90 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-6xl items-center justify-between px-5">
        <a href="#top" className="text-lg font-extrabold">pratibimb<span className="text-gradient">.dev</span></a>

        <ul
          className={`${open ? "translate-y-0" : "-translate-y-[130%]"} fixed inset-x-0 top-[62px] flex flex-col gap-4 border-b border-line bg-bg2 p-5 transition-transform duration-300 md:static md:translate-y-0 md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}
        >
          {navItems.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className={`text-sm transition-colors hover:text-ink ${active === id ? "text-ink" : "text-muted"}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={profile.resume} download aria-label="Download resume" className="bg-gradient-brand rounded-full px-3.5 py-2 text-xs font-bold text-[#05060d] transition hover:-translate-y-0.5 sm:text-sm">📄 <span className="hidden min-[400px]:inline">Resume</span></a>
          <button onClick={onToggle} aria-label="Toggle theme" className="glass grid size-9 place-items-center !rounded-full">
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="glass grid size-9 place-items-center !rounded-full md:hidden">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </nav>
  );
}
