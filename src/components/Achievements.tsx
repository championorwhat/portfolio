import { motion } from "motion/react";
import { achievements } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Achievements() {
  return (
    <section id="achievements" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading n="06" tag="wins" sub="Milestones, podium finishes and credentials along the way.">
          Awards &amp; <span className="text-gradient">certifications</span>
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <Reveal key={a.title} delay={(i % 3) * 0.07}>
              <motion.a
                href={a.href} target="_blank" rel="noopener noreferrer"
                whileHover={{ y: -8, rotateX: 4 }} style={{ transformPerspective: 800 }}
                className="glass group relative block h-full overflow-hidden p-6 text-center transition-colors hover:border-brand"
              >
                <span aria-hidden className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--brand)_25%,transparent),transparent_70%)]" />
                <div className="relative">
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{a.icon}</div>
                  <h4 className="mt-2 font-bold">{a.title}</h4>
                  <p className="text-sm text-muted">{a.sub}</p>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
