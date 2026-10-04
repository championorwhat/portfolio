import { lazy, Suspense } from "react";
import { motion } from "motion/react";
import { skillGroups } from "../data/portfolio";
import { useFocus } from "../context/focus";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const SkillGlobe = lazy(() => import("./SkillGlobe"));

export function Skills() {
  const { focus } = useFocus();
  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading n="02" tag="skills" sub="Hover the pills. Then go catch them in the game below 😉">
          Tech <span className="text-gradient">arsenal</span>
        </SectionHeading>
        <Reveal className="glass mb-8 h-[420px] overflow-hidden md:h-[520px]">
          <Suspense fallback={<div className="grid h-full place-items-center text-muted">Loading 3D globe…</div>}>
            <SkillGlobe />
          </Suspense>
          <p className="pointer-events-none -mt-8 text-center font-mono text-xs text-muted">drag to spin the skill globe</p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.06} className={`glass p-6 transition-all duration-500 ${g.focus.includes(focus) ? "!border-accent shadow-[0_0_30px_-12px_var(--accent)]" : "opacity-70"}`}>
              <h3 className="mb-4 font-bold">{g.icon} {g.title}</h3>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <motion.span
                    key={s} whileHover={{ y: -4, scale: 1.07 }}
                    className="cursor-default rounded-lg border border-line bg-bg2 px-3 py-1.5 text-[.82rem] hover:border-accent hover:text-accent"
                  >{s}</motion.span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
