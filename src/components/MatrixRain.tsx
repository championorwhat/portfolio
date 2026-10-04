import { useEffect, useRef } from "react";

export function MatrixRain({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext("2d")!;
    c.width = innerWidth; c.height = innerHeight;
    const drops = Array(Math.floor(c.width / 16)).fill(0);
    const iv = setInterval(() => {
      x.fillStyle = "rgba(0,0,0,.08)"; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = "#0f0"; x.font = "16px monospace";
      drops.forEach((v, i) => {
        x.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 16, v * 16);
        drops[i] = v * 16 > c.height && Math.random() > 0.975 ? 0 : v + 1;
      });
    }, 45);
    const t = setTimeout(onDone, 7000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [onDone]);
  return <canvas ref={ref} onClick={onDone} className="fixed inset-0 z-[200] cursor-pointer bg-black" aria-label="Matrix rain. Click to close." />;
}
