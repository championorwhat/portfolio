import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LabelSprite } from "./LabelSprite";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { skillGroups } from "../data/portfolio";

const COLORS = ["#7c5cff", "#00e5c3", "#ff5c93", "#ffb84d", "#5ac8ff", "#a6e22e"];

function Globe() {
  const grp = useRef<THREE.Group>(null);
  const words = useMemo(() => {
    const all = skillGroups.flatMap((g, gi) => g.items.map((t) => ({ t, c: COLORS[gi % COLORS.length] })));
    const n = all.length, golden = Math.PI * (3 - Math.sqrt(5));
    return all.map((w, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      return { ...w, pos: [Math.cos(th) * r * 3.4, y * 3.4, Math.sin(th) * r * 3.4] as [number, number, number] };
    });
  }, []);
  useFrame((_, dt) => { grp.current!.rotation.y += dt * 0.06; });
  return (
    <group ref={grp}>
      <mesh><sphereGeometry args={[3.38, 32, 32]} /><meshBasicMaterial color="#7c5cff" wireframe transparent opacity={0.07} /></mesh>
      {words.map((w) => (
        <LabelSprite key={w.t} text={w.t} color={w.c} position={w.pos} size={0.46} fade />
      ))}
    </group>
  );
}

export default function SkillGlobe() {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 9.5], fov: 50 }} dpr={[1, 1.5]} frameloop={visible ? "always" : "never"} gl={{ alpha: true }}>
        <Globe />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} rotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
