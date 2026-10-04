import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { projects } from "../data/portfolio";
import { useFocus } from "../context/focus";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function Card({ p, match }: { p: (typeof projects)[number]; match: boolean }) {
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const spot = useMotionTemplate`radial-gradient(circle at ${useTransform(mx, (v) => v * 100)}% ${useTransform(my, (v) => v * 100)}%, color-mix(in srgb, var(--brand) 20%, transparent), transparent 55%)`;

  const move = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.article
      onPointerMove={move} onPointerLeave={leave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={`glass relative h-full overflow-hidden p-6 ${match ? "!border-accent" : ""}`}
    >
      <motion.div aria-hidden style={{ background: spot }} className="pointer-events-none absolute inset-0" />
      <div className="relative">
        {match && <span className="mb-2 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-[.68rem] font-bold uppercase tracking-wide text-accent">★ Best match for your role</span>}
        <h3 className="text-lg font-bold">{p.emoji} {p.title}</h3>
        <span className="font-mono text-xs text-muted">{p.when}</span>
        <div className="my-4 flex flex-wrap gap-1.5">
          {p.stack.map((s) => <span key={s} className="rounded-md bg-bg2 px-2.5 py-0.5 text-[.72rem] text-accent">{s}</span>)}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{p.points.map((t) => <li key={t}>{t}</li>)}</ul>
        {p.metric && <p className="mt-3 text-sm font-semibold">📈 {p.metric}</p>}
        {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-accent hover:underline">View on GitHub →</a>}
      </div>
    </motion.article>
  );
}

export function Projects() {
  const { focus } = useFocus();
  const ranked = [...projects].sort((a, b) => Number(b.focus[0] === focus) * 2 + Number(b.focus.includes(focus)) - (Number(a.focus[0] === focus) * 2 + Number(a.focus.includes(focus))));
  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading n="05" tag="projects" sub="Move your cursor over a card.">
          Things I've <span className="text-gradient">built</span>
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ranked.map((p, i) => (
            <motion.div layout key={p.title} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
              <Reveal delay={i * 0.08}><Card p={p} match={p.focus.includes(focus)} /></Reveal>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
