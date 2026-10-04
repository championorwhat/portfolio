import { useEffect } from "react";

const CODE = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      i = e.key.toLowerCase() === CODE[i] ? i + 1 : 0;
      if (i === CODE.length) { i = 0; onUnlock(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onUnlock]);
}
