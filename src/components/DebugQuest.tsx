import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { useToast } from "./Toast";
import { profile } from "../data/portfolio";
import { Game, H, W, type Hud } from "../game/engine";
import { LEVELS } from "../game/levels";
import { initAudio, setMuted } from "../game/sfx";

type Phase = "idle" | "play" | "clear" | "over" | "win" | "paused";
const INITIAL: Hud = { charge: 0, score: 0, lives: 3, level: 1, combo: 0, mult: 1, weapon: 1, shield: false, boss: -1 };
const read = (k: string) => { try { return +(localStorage.getItem(k) || 0); } catch { return 0; } };
const write = (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* ignore */ } };

export function DebugQuest() {
  const toast = useToast();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const [phase, _setPhase] = useState<Phase>("idle");
  const [hud, setHud] = useState<Hud>(INITIAL);
  const [best, setBest] = useState(() => read("dq-best"));
  const [cleared, setCleared] = useState(0); // levels cleared this run
  const [maxLevel, setMaxLevel] = useState(() => read("dq-max"));
  const [final, setFinal] = useState(0);
  const [secret, setSecret] = useState(() => read("dq-max") >= 4);
  const [mute, setMute] = useState(false);
  const [fs, setFs] = useState(false);

  const setPhase = (p: Phase) => { phaseRef.current = p; _setPhase(p); };

  useEffect(() => {
    const finishScore = (s: number) => { setFinal(s); setBest((b) => { const nb = Math.max(b, s); write("dq-best", nb); return nb; }); };
    const g = new Game(cvRef.current!, {
      onHud: setHud,
      onClear: (i, s) => {
        setCleared(i + 1); finishScore(s); setFinal(s);
        setMaxLevel((m) => { const nm = Math.max(m, i + 1); write("dq-max", nm); return nm; });
        if (i === 3) { setSecret(true); toast("🔓 Boss down! Secret message unlocked below."); }
        setPhase("clear");
      },
      onOver: (s, i) => { finishScore(s); setCleared(i); setPhase("over"); },
      onWin: (s) => { finishScore(s); setCleared(LEVELS.length); write("dq-max", LEVELS.length); setMaxLevel(LEVELS.length); setSecret(true); setPhase("win"); },
    });
    game.current = g;

    const keyMap: Record<string, "l" | "r" | "u" | "d"> = { ArrowLeft: "l", a: "l", ArrowRight: "r", d: "r", ArrowUp: "u", w: "u", ArrowDown: "d", s: "d" };
    const kd = (e: KeyboardEvent) => {
      const k = keyMap[e.key] ?? keyMap[e.key.toLowerCase()];
      if (k && phaseRef.current === "play") { g.setKey(k, true); if (e.key.startsWith("Arrow")) e.preventDefault(); }
      if (e.key === " " && phaseRef.current === "play") { e.preventDefault(); g.fireUlt(); }
      if ((e.key === "p" || e.key === "Escape") && phaseRef.current === "play") { g.pause(); setPhase("paused"); }
    };
    const ku = (e: KeyboardEvent) => { const k = keyMap[e.key] ?? keyMap[e.key.toLowerCase()]; if (k) g.setKey(k, false); };
    addEventListener("keydown", kd); addEventListener("keyup", ku);

    const autoPause = () => { if (phaseRef.current === "play") { g.pause(); setPhase("paused"); } };
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) autoPause(); }, { threshold: 0.15 });
    io.observe(boxRef.current!);
    const vis = () => document.hidden && autoPause();
    document.addEventListener("visibilitychange", vis);
    const fsc = () => setFs(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", fsc);

    return () => { document.removeEventListener("visibilitychange", vis); document.removeEventListener("fullscreenchange", fsc); g.destroy(); io.disconnect(); removeEventListener("keydown", kd); removeEventListener("keyup", ku); };
  }, [toast]);

  const start = () => { initAudio(); if (!document.fullscreenElement) boxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); setCleared(0); setHud(INITIAL); setPhase("play"); game.current!.startRun(); };
  const next = () => { setPhase("play"); game.current!.startLevel(cleared); };
  const resume = () => { setPhase("play"); game.current!.resume(); };
  const toggleFs = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void boxRef.current?.requestFullscreen?.().catch(() => {}); };
  const ult = () => { if (game.current?.fireUlt()) toast("⚡ OVERCLOCK!"); };
  const move = (e: React.PointerEvent) => game.current?.setPointer(e.clientX, e.clientY, e.pointerType === "touch");

  const lvl = LEVELS[Math.min(cleared, LEVELS.length - 1)];
  const justCleared = LEVELS[Math.max(0, cleared - 1)];

  return (
    <section id="play" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading n="07" tag="play" sub="Defeat the bugs across 8 levels and 2 bosses. Move with mouse / finger / WASD / arrows - you auto-fire. Charge Overclock (Space) for a mega-beam. Beat the first boss to unlock a secret.">
          Debug <span className="text-gradient">Quest</span> 🎮
        </SectionHeading>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <div
              ref={boxRef}
              className={`glass relative mx-auto scroll-mt-[72px] p-3 ${fs ? "flex flex-col items-center justify-center !rounded-none bg-[#05060f]" : ""}`}
              style={fs ? undefined : { width: `min(100%, calc((100svh - 250px) * ${W} / ${H} + 24px))`, minWidth: "min(100%, 320px)" }}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 font-mono text-xs sm:text-sm">
                <span>⭐ <b>{hud.score}</b></span>
                <span>Lv <b>{hud.level}</b>/{LEVELS.length}</span>
                <span>{"❤".repeat(Math.max(hud.lives, 0)) || "💀"}</span>
                <span title="weapon level">🔫 {hud.weapon}{hud.shield && " ☁️"}</span>
                <span className={hud.mult > 1 ? "text-accent" : "text-muted"}>x{hud.mult}{hud.combo > 1 ? ` (${hud.combo})` : ""}</span>
                <span className="flex gap-2 text-base">
                  <button onClick={() => { setMute(!mute); setMuted(!mute); }} aria-label="Toggle sound">{mute ? "🔇" : "🔊"}</button>
                  <button onClick={toggleFs} aria-label="Toggle fullscreen">{fs ? "🗗" : "⛶"}</button>
                </span>
              </div>
              <canvas
                ref={cvRef} width={W} height={H} aria-label="Debug Quest game"
                onPointerMove={move} onPointerDown={move}
                className="block cursor-none touch-none rounded-xl bg-[#070914]"
                style={fs ? { height: "calc(100svh - 120px)", width: "auto", aspectRatio: `${W} / ${H}` } : { width: "100%", aspectRatio: `${W} / ${H}` }}
              />
              <button
                onClick={ult} disabled={phase !== "play"} aria-label="Overclock"
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition ${hud.charge >= 100 && phase === "play" ? "animate-pulse border-white bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-[0_0_24px_#5ac8ff]" : "border-line text-muted"}`}
              >
                ⚡ OVERCLOCK {hud.charge >= 100 ? "READY - tap / Space" : `${hud.charge}%`}
              </button>

              {phase !== "play" && (
                <div className="absolute inset-3 top-10 flex flex-col items-center justify-center gap-3 overflow-y-auto rounded-xl bg-[#070914]/88 p-6 text-center text-[#e8eaf6] backdrop-blur-sm">
                  {phase === "idle" && <>
                    <h3 className="text-3xl font-extrabold">Debug Quest</h3>
                    <p className="max-w-sm text-sm text-[#9aa0c3]">The codebase is infested. Fly your ship, shoot the bugs, grab skill power-ups:</p>
                    <ul className="space-y-1 text-left text-sm"><li>🐍 <b>Python</b> - stronger weapon</li><li>☁️ <b>AWS</b> - shield</li><li>💥 <b>Go</b> - screen-clearing blast</li><li>❤️ extra life</li><li>⚡ <b>Overclock</b> - kill bugs to charge, then press <b>Space</b> / tap the button for a piercing mega-beam</li></ul>
                    <p className="text-xs text-[#9aa0c3]">Chain kills for a score multiplier up to x5. Best: {best}</p>
                    <button onClick={start} className="bg-gradient-brand rounded-full px-8 py-3 font-semibold text-[#05060d] transition hover:-translate-y-1">▶ Start mission</button>
                  </>}
                  {phase === "paused" && <>
                    <h3 className="text-2xl font-bold">Paused</h3>
                    <button onClick={resume} className="bg-gradient-brand rounded-full px-8 py-3 font-semibold text-[#05060d]">▶ Resume</button>
                  </>}
                  {phase === "clear" && <>
                    <div className="text-5xl">🎉</div>
                    <h3 className="text-2xl font-bold">Level {cleared} clear!</h3>
                    <p className="font-mono text-sm text-[#00e5c3]">{justCleared.name} · {justCleared.tech}</p>
                    <p className="max-w-sm rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#cfd3f5]">💡 {justCleared.fact}</p>
                    <p className="text-xs text-[#9aa0c3]">Score {final}</p>
                    <div className="mt-1 text-sm">Next: <b>Level {cleared + 1} - {lvl.name}</b><br /><span className="text-[#9aa0c3]">{lvl.intro}</span></div>
                    <button onClick={next} className="bg-gradient-brand rounded-full px-8 py-3 font-semibold text-[#05060d] transition hover:-translate-y-1">Next level →</button>
                  </>}
                  {phase === "over" && <>
                    <div className="text-5xl">💀</div>
                    <h3 className="text-2xl font-bold">Segmentation fault</h3>
                    <p className="text-sm text-[#9aa0c3]">You reached level {cleared + 1} with {final} points.{final >= best && final > 0 ? " New best! 🏆" : ""}</p>
                    <button onClick={start} className="bg-gradient-brand rounded-full px-8 py-3 font-semibold text-[#05060d]">↻ Try again</button>
                  </>}
                  {phase === "win" && <>
                    <div className="text-5xl">🏆</div>
                    <h3 className="text-2xl font-bold">Production is bug-free!</h3>
                    <p className="max-w-sm rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#cfd3f5]">💡 {LEVELS[LEVELS.length - 1].fact}</p>
                    <p className="text-sm">Final score <b>{final}</b></p>
                    <a href={`mailto:${profile.email}`} className="bg-gradient-brand rounded-full px-8 py-3 font-semibold text-[#05060d]">✉ Hire the hero</a>
                    <button onClick={start} className="text-sm text-[#9aa0c3] underline">Play again</button>
                  </>}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="glass p-5">
            <h3 className="mb-3 font-bold">🗺️ Mission log</h3>
            <ol className="space-y-2">
              {LEVELS.map((l, i) => {
                const done = i < maxLevel, current = phase !== "idle" && i === cleared && phase !== "win";
                return (
                  <li key={l.name} className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${current ? "border-accent bg-accent/10" : "border-line"}`}>
                    <span className="grid size-6 place-items-center rounded-full bg-bg2 font-mono text-xs">{done ? "✓" : l.boss ? "☠" : i + 1}</span>
                    <span className="flex-1"><b>{l.name}</b><br /><span className="font-mono text-[11px] text-muted">{l.tech}</span></span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-muted">Best score: <b className="text-ink">{best}</b> · Controls: mouse / touch drag, WASD or arrows, Space = Overclock, P = pause, ⛶ = fullscreen.</p>
          </Reveal>
        </div>

        {secret && (
          <div className="glass mt-6 border-dashed !border-accent p-5">
            <h3 className="font-bold">🎉 Secret unlocked!</h3>
            <p className="text-muted">You clearly know your way around a codebase. Let's build something together - <a className="text-accent underline" href={`mailto:${profile.email}`}>say hi →</a></p>
          </div>
        )}
      </div>
    </section>
  );
}
