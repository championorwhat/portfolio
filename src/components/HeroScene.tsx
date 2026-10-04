import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { LabelSprite } from "./LabelSprite";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const ORBIT = ["Python", "AWS", "LLMs", "RAG", "FastAPI", "Go", "SQL", "Java"];

function Core({ onPoke }: { onPoke: () => void }) {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((s, dt) => {
    const g = group.current!;
    // follow pointer smoothly
    g.rotation.y += (s.pointer.x * 0.6 - g.rotation.y) * Math.min(1, dt * 2.5);
    g.rotation.x += (-s.pointer.y * 0.4 - g.rotation.x) * Math.min(1, dt * 2.5);
    ring1.current!.rotation.z += dt * 0.5;
    ring2.current!.rotation.x += dt * 0.35;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh onClick={onPoke} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
          <icosahedronGeometry args={[1.25, 12]} />
          <MeshDistortMaterial color="#7c5cff" emissive="#4a2fd0" emissiveIntensity={1.1} roughness={0.25} metalness={0.25} distort={0.38} speed={2.2} />
        </mesh>
        <mesh scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#00e5c3" wireframe transparent opacity={0.28} />
        </mesh>
      </Float>
      <mesh ref={ring1} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.15, 0.012, 16, 160]} />
        <meshBasicMaterial color="#00e5c3" />
      </mesh>
      <mesh ref={ring2} rotation={[0.4, 0.6, 0]}>
        <torusGeometry args={[2.6, 0.01, 16, 160]} />
        <meshBasicMaterial color="#ff5c93" transparent opacity={0.8} />
      </mesh>
      <Orbiters />
    </group>
  );
}

function Orbiters() {
  const ref = useRef<THREE.Group>(null);
  const pts = useMemo(() => ORBIT.map((label, i) => ({ label, a: (i / ORBIT.length) * Math.PI * 2, r: 2.9 + (i % 2) * 0.35, y: Math.sin(i * 1.7) * 1.1 })), []);
  useFrame((_, dt) => { ref.current!.rotation.y += dt * 0.25; });
  return (
    <group ref={ref}>
      {pts.map((p) => (
        <group key={p.label} position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]}>
          <mesh><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh>
          <LabelSprite text={p.label} position={[0, 0.28, 0]} size={0.42} color="#e8eaf6" />
        </group>
      ))}
    </group>
  );
}

export default function HeroScene({ onPoke }: { onPoke: () => void }) {
  return (
    <Canvas camera={{ position: [0, 0, 9.6], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} color="#00e5c3" />
      <pointLight position={[-5, -3, 4]} intensity={50} color="#ff5c93" />
      <Core onPoke={onPoke} />
      <Sparkles count={70} scale={[10, 7, 6]} size={2.4} speed={0.4} color="#9aa0ff" />
    </Canvas>
  );
}
