import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

export function CursorGlow() {
  const x = useMotionValue(innerWidth / 2), y = useMotionValue(innerHeight / 3);
  const sx = useSpring(x, { stiffness: 80, damping: 20 }), sy = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const m = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); };
    addEventListener("pointermove", m, { passive: true });
    return () => removeEventListener("pointermove", m);
  }, [x, y]);
  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      className="pointer-events-none fixed left-0 top-0 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand)_25%,transparent),transparent_65%)]"
    />
  );
}
