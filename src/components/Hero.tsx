import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "motion/react";
import { profile } from "../data/portfolio";

const HeroScene = lazy(() => import("./HeroScene"));

function useTyped(words: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    let wi = 0, ci = 0, del = false, t = 0;
    const tick = () => {
      const w = words[wi];
      setText(w.slice(0, ci));
      if (!del && ci === w.length) { del = true; t = window.setTimeout(tick, 1400); return; }
      if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      ci += del ? -1 : 1;
      t = window.setTimeout(tick, del ? 35 : 75);
    };
    tick();
    return () => clearTimeout(t);
  }, [words]);
  return text;
}

export function Hero({ onEasterEgg }: { onEasterEgg: (clicks: number) => void }) {
  const typed = useTyped(profile.roles);
  const [spin, setSpin] = useState(0);
  const first = profile.name.split(" ");

  return (
    <section id="top" className="flex min-h-svh items-center pt-24 pb-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 text-center md:grid-cols-[1.2fr_.8fr] md:text-left">
        <div>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-accent">&gt; hello, world. i'm</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="my-2 text-[clamp(2.5rem,8vw,4.8rem)] font-extrabold leading-[1.02]"
          >
            {first[0]} <span className="text-gradient">{first[1]}</span>
          </motion.h1>
          <div className="min-h-[2em] text-[clamp(1.1rem,2.6vw,1.5rem)] text-muted">
            {typed}<span className="animate-blink text-accent">▌</span>
          </div>
          <p className="mx-auto my-4 max-w-xl text-muted md:mx-0">{profile.tagline}</p>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <a href="#play" className="bg-gradient-brand rounded-full px-6 py-3 font-semibold text-[#05060d] transition hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_var(--brand)]">🎮 Play my game</a>
            <a href="#projects" className="glass !rounded-full px-6 py-3 font-semibold transition hover:-translate-y-1">View work</a>
            <a href={profile.resume} download className="glass !rounded-full px-6 py-3 font-semibold transition hover:-translate-y-1">Resume ↓</a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {([["GitHub", profile.links.github], ["LinkedIn", profile.links.linkedin], ["LeetCode", profile.links.leetcode], ["Email", `mailto:${profile.email}`]] as const).map(([l, h]) => (
              <a key={l} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                 className="glass !rounded-xl px-3.5 py-2 text-sm text-muted transition hover:border-accent hover:text-ink">{l}</a>
            ))}
          </div>
          <p className="mt-10 font-mono text-xs text-muted">psst… try the Konami code ↑↑↓↓←→←→BA or the terminal below.</p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <Suspense fallback={<div className="bg-gradient-brand animate-morph mx-auto mt-16 size-64 opacity-70" />}>
            <HeroScene onPoke={() => { setSpin((x) => x + 1); onEasterEgg(spin + 1); }} />
          </Suspense>
          <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">drag · move your mouse · it follows you</span>
        </div>
      </div>
    </section>
  );
}
