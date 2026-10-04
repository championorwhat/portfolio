import { AnimatePresence, motion } from "motion/react";
import { focusModes, profile, type Focus } from "../data/portfolio";
import { useFocus } from "../context/focus";

export function RecruiterStrip({ onAsk }: { onAsk: (q?: string) => void }) {
  const { focus, setFocus } = useFocus();
  const mode = focusModes[focus];

  return (
    <section aria-label="30-second summary for recruiters" className="relative z-10 -mt-6 pb-6">
      <div className="mx-auto max-w-6xl px-5">
        <div className="glass relative overflow-hidden p-5 sm:p-7">
          <div aria-hidden className="bg-gradient-brand pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-20 blur-3xl" />

          {/* availability badge */}
          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Final-year B.Tech student · open to full-time roles &amp; internships
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-[.15em] text-accent">⏱ 30-second summary for recruiters</span>
              <h2 className="text-xl font-extrabold sm:text-2xl">What role are you hiring for?</h2>
            </div>
            <div role="tablist" aria-label="Pick the role you are hiring for" className="flex flex-wrap gap-2">
              {(Object.keys(focusModes) as Focus[]).map((f) => (
                <button
                  key={f} role="tab" aria-selected={focus === f} onClick={() => setFocus(f)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${focus === f ? "bg-gradient-brand border-transparent text-[#05060d] shadow-[0_6px_24px_-8px_var(--brand)]" : "border-line bg-bg2/60 text-muted hover:text-ink"}`}
                >
                  {focusModes[f].icon} {focusModes[f].label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={focus} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
              className="relative mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]"
            >
              <p className="text-[.97rem] leading-relaxed text-muted">{mode.pitch}</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {mode.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-line bg-bg2/60 p-3 text-center">
                    <b className="text-gradient block text-xl font-extrabold sm:text-2xl">{m.value}</b>
                    <small className="block text-[.7rem] leading-tight text-muted sm:text-xs">{m.label}</small>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative mt-5 flex flex-wrap items-center gap-3">
            <a href={profile.resume} download className="bg-gradient-brand rounded-full px-5 py-2.5 text-sm font-semibold text-[#05060d] transition hover:-translate-y-0.5">📄 Download resume</a>
            <a href={`mailto:${profile.email}`} className="glass !rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">✉ Email</a>
            <button onClick={() => onAsk()} className="glass !rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">✨ Ask my portfolio</button>
            <span className="text-xs text-muted">Pick a role: the projects, skills and experience below re-rank to match it ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}