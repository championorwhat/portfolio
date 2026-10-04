import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** A pill-shaped text label rendered to a canvas texture and drawn as a camera-facing sprite. */
export function LabelSprite({ text, color = "#ffffff", size = 0.62, position, fade = false }: { text: string; color?: string; size?: number; position: [number, number, number]; fade?: boolean }) {
  const sprite = useRef<THREE.Sprite>(null);
  const mat = useRef<THREE.SpriteMaterial>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { texture, aspect } = useMemo(() => {
    const dpr = 2, fs = 30 * dpr, padX = 22 * dpr, h = 54 * dpr;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = `600 ${fs}px 'JetBrains Mono', ui-monospace, monospace`;
    const w = Math.ceil(ctx.measureText(text).width + padX * 2);
    c.width = w; c.height = h;
    ctx.font = `600 ${fs}px 'JetBrains Mono', ui-monospace, monospace`;
    ctx.fillStyle = "rgba(8,10,24,.72)";
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, (h - 4) / 2); ctx.fill();
    ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { texture: t, aspect: w / h };
  }, [text, color]);

  useEffect(() => () => texture.dispose(), [texture]);

  // fade labels that face away from the camera so the globe reads clearly
  useFrame(({ camera }) => {
    if (!fade || !sprite.current || !mat.current) return;
    sprite.current.getWorldPosition(tmp).normalize();
    const d = tmp.dot(camera.position.clone().normalize());
    const k = Math.min(1, Math.max(0, (d + 0.15) / 0.75));
    mat.current.opacity = 0.1 + 0.9 * k * k * (3 - 2 * k);
    const sc = 0.8 + 0.3 * k;
    sprite.current.scale.set(size * aspect * sc, size * sc, 1);
  });

  return (
    <sprite ref={sprite} position={position} scale={[size * aspect, size, 1]}>
      <spriteMaterial ref={mat} map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}
