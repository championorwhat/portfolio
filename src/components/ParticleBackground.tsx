import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number };

export function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ps: P[] = [];
    let raf = 0;
    const mouse = { x: -999, y: -999 };

    const resize = () => {
      cv.width = innerWidth; cv.height = innerHeight;
      ps = Array.from({ length: Math.min(90, (innerWidth / 14) | 0) }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }));
    };
    const move = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });

    const frame = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const rgb = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#7c5cff";
      ps.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cv.width) p.vx *= -1;
        if (p.y < 0 || p.y > cv.height) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120 && d > 0) { p.x += (dx / d) * 1.5; p.y += (dy / d) * 1.5; }
        ctx.globalAlpha = 0.7; ctx.fillStyle = rgb;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j], l = Math.hypot(p.x - q.x, p.y - q.y);
          if (l < 110) {
            ctx.globalAlpha = 0.2 * (1 - l / 110); ctx.strokeStyle = rgb;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      });
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move); };
  }, []);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 -z-20 h-full w-full" />;
}
