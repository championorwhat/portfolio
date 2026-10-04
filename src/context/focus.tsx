import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Focus } from "../data/portfolio";

interface FocusCtx { focus: Focus; setFocus: (f: Focus) => void }
const Ctx = createContext<FocusCtx>({ focus: "ai", setFocus: () => {} });
export const useFocus = () => useContext(Ctx);

const read = (): Focus => {
  try { const v = localStorage.getItem("focus"); if (v === "ai" || v === "cloud" || v === "research") return v; } catch { /* ignore */ }
  return "ai";
};

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, set] = useState<Focus>(read);
  useEffect(() => { try { localStorage.setItem("focus", focus); } catch { /* ignore */ } }, [focus]);
  const setFocus = useCallback((f: Focus) => set(f), []);
  const value = useMemo(() => ({ focus, setFocus }), [focus, setFocus]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
