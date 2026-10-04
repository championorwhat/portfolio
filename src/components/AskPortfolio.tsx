import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { focusModes, profile } from "../data/portfolio";
import { knowledge } from "../data/knowledge";
import { Retriever } from "../lib/retrieve";
import { useFocus } from "../context/focus";

interface Source { id: string; title: string; relevance: number }
interface Msg { role: "user" | "assistant"; content: string; sources?: Source[]; mode?: "live" | "offline"; model?: string; note?: string }

const ENDPOINT = "/api/chat";

export function AskPortfolio({ open, onOpen, onClose, seed }: { open: boolean; onOpen: () => void; onClose: () => void; seed: { q: string; n: number } }) {
  const { focus } = useFocus();
  const retriever = useMemo(() => new Retriever(knowledge), []);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [trace, setTrace] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSeed = useRef(0);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 250); }, [open]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && open && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open, onClose]);

  // offline mode: answer straight from the retrieved passages (no LLM) so the widget never dies
  const offline = (q: string, note: string): Msg => {
    const hits = retriever.search(q, 3);
    const sources = hits.map((h) => ({ id: h.chunk.id, title: h.chunk.title, relevance: h.relevance }));
    if (!hits.length) return { role: "assistant", mode: "offline", sources, note, content: `I couldn't find that in Pratibimb's portfolio. Try asking about his projects, internships, skills or certifications, or email ${profile.email}.` };
    return { role: "assistant", mode: "offline", sources, note, content: hits.slice(0, 2).map((h) => h.chunk.text).join("\n\n") };
  };

  const ask = async (q: string) => {
    q = q.trim(); if (!q || busy) return;
    const history = msgs.slice(-4).map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => [...m, { role: "user", content: q }]); setText(""); setBusy(true);
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, history }) });
      const ct = r.headers.get("content-type") ?? "";
      const data = ct.includes("json") ? await r.json() : null;
      if (r.ok && data?.answer) {
        setRemaining(typeof data.remaining === "number" ? data.remaining : null);
        setMsgs((m) => [...m, { role: "assistant", content: data.answer, sources: data.sources, mode: "live", model: data.model }]);
      } else if (r.status === 429) {
        setRemaining(0);
        setMsgs((m) => [...m, offline(q, "The free AI quota is used up for now, so this answer comes straight from the retrieved passages.")]);
      } else {
        // shows WHY the backend failed, e.g. "502: upstream_error / provider 401 - Invalid API Key"
        const why = `${r.status}${data?.error ? `: ${data.error}` : ""}${data?.upstream ? ` / provider ${data.upstream}` : ""}${data?.detail ? ` - ${data.detail}` : ""}`;
        setMsgs((m) => [...m, offline(q, `AI backend unavailable (${why}), so this answer comes straight from the retrieved passages.`)]);
      }
    } catch {
      setMsgs((m) => [...m, offline(q, "AI backend unreachable (network error), so this answer comes straight from the retrieved passages.")]);
    } finally { setBusy(false); }
  };

  // questions injected from outside (strip buttons / terminal)
  useEffect(() => { if (seed.n !== lastSeed.current) { lastSeed.current = seed.n; if (seed.q) void ask(seed.q); } });

  const submit = (e: FormEvent) => { e.preventDefault(); void ask(text); };

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} onClick={onOpen} aria-label="Ask my portfolio"
          className="bg-gradient-brand fixed bottom-5 right-5 z-[95] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#05060d] shadow-[0_10px_40px_-8px_var(--brand)]"
        >
          <span className="text-lg">✨</span> Ask my portfolio
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog" aria-label="Ask my portfolio"
            initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }}
            className="fixed inset-x-3 bottom-3 z-[96] flex h-[min(78svh,640px)] flex-col overflow-hidden rounded-2xl border border-line bg-bg2/95 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px]"
          >
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <b className="text-sm">✨ Ask my portfolio</b>
                <p className="text-[11px] text-muted">Retrieval-augmented · answers only from my resume &amp; projects{remaining !== null && ` · ${remaining} left today`}</p>
              </div>
              <button onClick={onClose} aria-label="Close chat" className="grid size-8 place-items-center rounded-full hover:bg-white/10">✕</button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
              {msgs.length === 0 && (
                <div className="space-y-3">
                  <p className="text-muted">Hi! I'm a small RAG assistant. I search Pratibimb's portfolio, then answer from what I find - and you can see exactly which passages I used.</p>
                  <div className="flex flex-wrap gap-2">
                    {[...focusModes[focus].questions, "How can I contact him?"].map((q) => (
                      <button key={q} onClick={() => void ask(q)} className="rounded-full border border-line bg-bg/60 px-3 py-1.5 text-xs text-ink transition hover:border-accent hover:text-accent">{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 ${m.role === "user" ? "bg-gradient-brand text-[#05060d]" : "border border-line bg-bg/60"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    {m.role === "assistant" && (
                      <>
                        {m.note && <p className="mt-2 text-[11px] text-muted">ℹ {m.note}</p>}
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-2">
                            <button onClick={() => setTrace(trace === i ? null : i)} className="text-[11px] font-semibold text-accent hover:underline">
                              {trace === i ? "▾" : "▸"} How I found this · {m.sources.length} passage{m.sources.length > 1 ? "s" : ""} · {m.mode === "live" ? `answered by ${m.model ?? "AI"}` : "offline retrieval"}
                            </button>
                            {trace === i && (
                              <ul className="mt-2 space-y-1.5">
                                {m.sources.map((s, j) => (
                                  <li key={s.id} className="text-[11px]">
                                    <div className="flex justify-between gap-2"><span className="truncate">{j + 1}. {s.title}</span><span className="font-mono text-muted">{Math.round(s.relevance * 100)}%</span></div>
                                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${s.relevance * 100}%` }} className="bg-gradient-brand h-full" /></div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {busy && <div className="flex gap-1 px-2" aria-label="Thinking">{[0, 1, 2].map((d) => <motion.span key={d} className="size-2 rounded-full bg-accent" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: d * 0.12 }} />)}</div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
              <input
                ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Ask about projects, experience, skills…"
                aria-label="Your question" className="min-w-0 flex-1 rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button disabled={busy || !text.trim()} className="bg-gradient-brand rounded-xl px-4 text-sm font-bold text-[#05060d] disabled:opacity-40">Ask</button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}