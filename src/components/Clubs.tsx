import { clubs } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Clubs() {
  return (
    <section id="clubs" className="py-24">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading n="04" tag="clubs" sub="Communities I help run at SRMIST.">
          Clubs &amp; <span className="text-gradient">societies</span>
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2">
          {clubs.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.1} className="glass p-7">
              <div className="text-4xl">{c.icon}</div>
              <h3 className="mt-3 text-lg font-bold">{c.name}</h3>
              <p className="font-semibold text-accent">{c.role}</p>
              <span className="font-mono text-xs text-muted">{c.when}</span>
              <p className="mt-3 text-sm text-muted">{c.blurb}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
