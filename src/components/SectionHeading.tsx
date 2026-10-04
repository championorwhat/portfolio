import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({ n, tag, children, sub }: { n: string; tag: string; children: ReactNode; sub?: string }) {
  return (
    <Reveal className="mb-10">
      <span className="mb-1 block font-mono text-xs uppercase tracking-[.15em] text-accent">{n} / {tag}</span>
      <h2 className="text-[clamp(1.8rem,4vw,2.7rem)] font-extrabold leading-tight">{children}</h2>
      {sub && <p className="mt-2 max-w-xl text-muted">{sub}</p>}
    </Reveal>
  );
}
