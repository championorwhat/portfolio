import { experience } from "../data/portfolio";
import { useFocus } from "../context/focus";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  const { focus } = useFocus();
  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading n="03" tag="experience" sub="Internships across enterprise AI, data security and defence research.">
          Where I've <span className="text-gradient">worked</span>
        </SectionHeading>
        <ol className="relative space-y-6 border-l-2 border-transparent pl-8 before:absolute before:inset-y-1 before:left-[7px] before:w-0.5 before:bg-gradient-to-b before:from-brand before:to-accent">
          {experience.map((e, i) => (
            <li key={e.org} className="relative">
              <span className="absolute -left-[31px] top-7 size-[18px] rounded-full border-[3px] border-accent bg-bg" />
              <Reveal delay={i * 0.05} className={`glass p-6 transition-all duration-500 ${e.focus.includes(focus) ? "!border-accent/70" : "opacity-80"}`}>
                <span className="font-mono text-xs text-accent">{e.when}{e.place && ` · ${e.place}`}</span>
                <h3 className="mt-1 text-lg font-bold">{e.org} <span className="font-medium text-muted">- {e.role}</span></h3>
                {e.about && <p className="mt-2 text-sm italic text-muted">{e.about}</p>}
                {e.stack && e.stack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {e.stack.map((t) => <span key={t} className="rounded-md bg-bg2 px-2.5 py-0.5 text-[.72rem] text-accent">{t}</span>)}
                  </div>
                )}
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[.93rem] text-muted">
                  {e.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                {e.outcomes && e.outcomes.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {e.outcomes.map((o) => <div key={o} className="rounded-xl border border-line bg-bg2/60 px-3 py-2 text-sm">✅ {o}</div>)}
                  </div>
                )}
                <a href={e.doc} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-accent hover:underline">📄 View letter / certificate →</a>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
