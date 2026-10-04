import { LEVELS, type BossKind, type EnemyKind, type Pattern } from "./levels";
import { sfx } from "./sfx";

export const W = 600;
export const H = 760;

export interface Hud { charge: number; score: number; lives: number; level: number; combo: number; mult: number; weapon: number; shield: boolean; boss: number }
export interface Callbacks {
  onHud: (h: Hud) => void;
  onClear: (levelIdx: number, score: number) => void;
  onOver: (score: number, levelIdx: number) => void;
  onWin: (score: number) => void;
}

interface Enemy { kind: EnemyKind | BossKind; x: number; y: number; vx: number; vy: number; hp: number; max: number; r: number; t: number; cd: number; emoji: string; pts: number; boss: boolean; x0: number; flash: number }
interface Bullet { x: number; y: number; vx: number; vy: number; dmg: number; r: number }
interface Pickup { x: number; y: number; kind: "power" | "shield" | "bomb" | "life" }
interface Ring { x: number; y: number; r: number; max: number; life: number; color: string }
interface Pop { x: number; y: number; text: string; life: number; color: string; big: boolean }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }

const EMOJI: Record<EnemyKind, string> = { drift: "🐞", wave: "🦟", zig: "🪲", shooter: "👾", tank: "🐛", dive: "🦂" };
const PICK: Record<Pickup["kind"], { emoji: string; label: string; color: string }> = {
  power: { emoji: "🐍", label: "Python", color: "#ffd24d" },
  shield: { emoji: "☁️", label: "AWS", color: "#5ac8ff" },
  bomb: { emoji: "💥", label: "Go", color: "#ff8c42" },
  life: { emoji: "❤️", label: "+1", color: "#ff5c93" },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// ---- cached glow sprites (cheap additive lighting) ----
const glowCache = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string): HTMLCanvasElement {
  if (/^#[0-9a-f]{3}$/i.test(color)) color = "#" + [...color.slice(1)].map((ch) => ch + ch).join("");
  let c = glowCache.get(color);
  if (!c) {
    c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, color); g.addColorStop(0.35, color + "88"); g.addColorStop(1, color + "00");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); glowCache.set(color, c);
  }
  return c;
}

const PALETTES: [string, string, string][] = [
  ["#3b1d8f", "#0b6d86", "#4a1a6b"], ["#1d4d8f", "#6d2b9a", "#0a7a6a"], ["#0b6d86", "#1d3f9a", "#2a8f6b"],
  ["#8f1d3f", "#4a1d8f", "#8f4a1d"], ["#2a8f6b", "#1d6a8f", "#5a1d8f"], ["#8f1d7a", "#1d2f8f", "#1d8f8a"],
  ["#8f6a1d", "#8f1d3f", "#3a1d8f"], ["#8f1d1d", "#5a1d6a", "#1d1d6a"],
];

function makeNebula(level: number): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d")!, pal = PALETTES[level % PALETTES.length];
  x.fillStyle = "#05060f"; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = "lighter";
  let seed = level * 9301 + 49297; const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 9; i++) {
    const bx = r() * W, by = r() * H, br = 140 + r() * 220, col = pal[i % 3];
    for (const oy of [-H, 0, H]) {
      const g = x.createRadialGradient(bx, by + oy, 0, bx, by + oy, br);
      g.addColorStop(0, col + "66"); g.addColorStop(1, col + "00");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
  }
  // a distant ringed planet
  x.globalCompositeOperation = "source-over";
  const px = 80 + r() * (W - 160), py = 120 + r() * (H - 240), pr = 34 + r() * 26;
  const pg = x.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
  pg.addColorStop(0, pal[1] + "ff"); pg.addColorStop(1, "#05060f");
  x.globalAlpha = 0.55; x.fillStyle = pg; x.beginPath(); x.arc(px, py, pr, 0, 6.283); x.fill();
  x.strokeStyle = pal[0] + "cc"; x.lineWidth = 3; x.beginPath(); x.ellipse(px, py, pr * 1.7, pr * 0.4, -0.35, 0, 6.283); x.stroke();
  x.globalAlpha = 1;
  return c;
}

function makeVignette(): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d")!, g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.65)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,.025)"; for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 1); // faint scanlines
  return c;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  running = false;

  private lvl = 0;
  private frame = 0;
  private spawned = 0;
  private score = 0;
  private lives = 3;
  private weapon = 1;
  private shield = 0;
  private invuln = 0;
  private combo = 0;
  private lastKill = -999;
  private fireCd = 0;
  private bannerT = 0;
  private shake = 0;
  private flash = 0;
  private px = W / 2; private py = H - 120;
  private tx = W / 2; private ty = H - 120;
  private keys = { l: false, r: false, u: false, d: false };
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private ebullets: Bullet[] = [];
  private pickups: Pickup[] = [];
  private sparks: Spark[] = [];
  private stars = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), z: rand(0.3, 1.6) }));
  private charge = 0;
  private ult = 0;
  private queue: { at: number; kind: EnemyKind; x: number; y: number; vx?: number }[] = [];
  private rings: Ring[] = [];
  private pops: Pop[] = [];
  private nebula: HTMLCanvasElement;
  private vignette = makeVignette();
  private bank = 0;
  private lastHud = "";
  private bossRef: Enemy | null = null;
  private ending = false;

  constructor(private cv: HTMLCanvasElement, private cb: Callbacks) {
    this.ctx = cv.getContext("2d")!;
    this.nebula = makeNebula(0);
    this.drawIdle();
  }

  // ---------- input ----------
  setPointer(clientX: number, clientY: number, touch: boolean) {
    const r = this.cv.getBoundingClientRect();
    this.tx = ((clientX - r.left) / r.width) * W;
    this.ty = ((clientY - r.top) / r.height) * H - (touch ? 80 : 0);
    this.tx = Math.max(24, Math.min(W - 24, this.tx));
    this.ty = Math.max(H * 0.25, Math.min(H - 40, this.ty));
  }
  /** Overclock super: a piercing beam that follows the ship. Needs a full charge. */
  fireUlt() {
    if (!this.running || this.ending || this.ult > 0 || this.charge < 100) return false;
    this.ult = 110; this.charge = 0; this.shake = 20; this.flash = 6; sfx.bomb();
    this.rings.push({ x: this.px, y: this.py, r: 10, max: 140, life: 24, color: "#9dfdff" });
    return true;
  }
  setKey(k: "l" | "r" | "u" | "d", v: boolean) { this.keys[k] = v; }

  // ---------- lifecycle ----------
  startRun() {
    this.score = 0; this.lives = 3; this.weapon = 1; this.shield = 0; this.combo = 0; this.charge = 0;
    this.startLevel(0);
  }
  startLevel(i: number) {
    this.lvl = i; this.frame = 0; this.spawned = 0; this.ending = false; this.bossRef = null; this.queue = []; this.ult = 0;
    this.enemies = []; this.bullets = []; this.ebullets = []; this.pickups = []; this.rings = []; this.pops = [];
    this.nebula = makeNebula(i);
    this.invuln = 90; this.bannerT = 150; this.px = this.tx = W / 2; this.py = this.ty = H - 120;
    const L = LEVELS[i];
    if (L.boss) this.spawnBoss(L.boss);
    this.resume();
  }
  resume() {
    if (this.running) return;
    this.running = true; this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }
  pause() { this.running = false; cancelAnimationFrame(this.raf); }
  destroy() { this.pause(); }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(2.5, (now - this.last) / 16.667);
    this.last = now;
    this.update(dt);
    this.render();
    if (this.running) this.raf = requestAnimationFrame(this.loop);
  };

  // ---------- spawning ----------
  private spawn(kind: EnemyKind, x = rand(40, W - 40), y = -30) {
    const L = LEVELS[this.lvl], s = L.speed;
    const base = { x, y, x0: x, vx: 0, vy: 1.4 * s, hp: 1, max: 1, r: 16, t: 0, cd: rand(30, 90), emoji: EMOJI[kind], pts: 10, boss: false, flash: 0 };
    const e: Enemy = { kind, ...base };
    if (kind === "wave") { e.vy = 1.2 * s; e.pts = 15; }
    if (kind === "zig") { e.vy = 1.5 * s; e.vx = Math.random() < 0.5 ? -2.3 : 2.3; e.hp = e.max = 2; e.pts = 20; }
    if (kind === "shooter") { e.hp = e.max = 3; e.r = 20; e.pts = 30; e.vy = 2; }
    if (kind === "tank") { e.hp = e.max = 6; e.r = 26; e.vy = 0.8 * s; e.pts = 50; }
    if (kind === "dive") { e.vy = 3; e.pts = 25; e.cd = 0; }
    this.enemies.push(e);
  }
  private spawnBoss(kind: BossKind) {
    const hydra = kind === "hydra";
    const hp = hydra ? 170 : 90;
    const b: Enemy = { kind, x: W / 2, y: -90, x0: W / 2, vx: 1.6, vy: 1, hp, max: hp, r: hydra ? 74 : 62, t: 0, cd: 80, emoji: hydra ? "🐙" : "👹", pts: hydra ? 2000 : 1000, boss: true, flash: 0 };
    this.enemies.push(b); this.bossRef = b; sfx.boss();
  }
  private spawnTick() {
    // delayed members of a wave (snakes, dive groups)
    for (const q of this.queue) if (this.frame >= q.at) { this.spawn(q.kind, q.x, q.y); if (q.vx !== undefined) this.enemies[this.enemies.length - 1].vx = q.vx; q.at = Infinity; }
    this.queue = this.queue.filter((q) => q.at !== Infinity);

    const L = LEVELS[this.lvl];
    if (this.spawned >= L.total || this.frame % L.interval !== 20) return;
    if (L.boss && this.bossRef && this.bossRef.y < 60) return;
    const sum = L.waves.reduce((a, w) => a + w[2], 0);
    let r = Math.random() * sum, pick = L.waves[0];
    for (const w of L.waves) { if ((r -= w[2]) <= 0) { pick = w; break; } }
    this.spawnPattern(pick[0], pick[1]);
    this.spawned++;
  }

  private spawnPattern(p: Pattern, kind: EnemyKind) {
    const f = this.frame, cx = rand(110, W - 110);
    switch (p) {
      case "single": this.spawn(kind); break;
      case "line": { const n = kind === "shooter" ? 3 : 5, gap = kind === "shooter" ? 150 : 100; for (let i = 0; i < n; i++) this.spawn(kind, W / 2 + (i - (n - 1) / 2) * gap); break; }
      case "vee": for (let i = -2; i <= 2; i++) this.spawn(kind, cx + i * 44, -30 - (2 - Math.abs(i)) * 34); break;
      case "snake": for (let i = 0; i < 6; i++) this.queue.push({ at: f + i * 13, kind, x: cx, y: -30 }); break;
      case "pincer":
        for (let i = 0; i < 3; i++) {
          this.queue.push({ at: f + i * 20, kind, x: -20, y: 90 + i * 70, vx: 3.2 });
          this.queue.push({ at: f + i * 20, kind, x: W + 20, y: 90 + i * 70, vx: -3.2 });
        }
        break;
      case "dive": for (let i = 0; i < 3; i++) this.queue.push({ at: f + i * 30, kind: "dive", x: rand(60, W - 60), y: -30 }); break;
    }
  }

  // ---------- update ----------
  private update(dt: number) {
    this.frame++;
    const L = LEVELS[this.lvl];
    // player
    const sp = 9 * dt;
    if (this.keys.l) this.tx -= sp; if (this.keys.r) this.tx += sp;
    if (this.keys.u) this.ty -= sp; if (this.keys.d) this.ty += sp;
    this.tx = Math.max(24, Math.min(W - 24, this.tx)); this.ty = Math.max(H * 0.25, Math.min(H - 40, this.ty));
    this.px += (this.tx - this.px) * Math.min(1, 0.28 * dt); this.py += (this.ty - this.py) * Math.min(1, 0.28 * dt);
    this.bank += (Math.max(-1, Math.min(1, (this.tx - this.px) / 40)) - this.bank) * 0.2 * dt;
    if (this.frame % 2 === 0) this.sparks.push({ x: this.px + rand(-3, 3), y: this.py + 16, vx: rand(-0.3, 0.3), vy: rand(2, 3.5), life: 16, max: 16, color: "#ffb84d", size: rand(2, 3.5) });
    if (this.invuln > 0) this.invuln -= dt; if (this.shield > 0) this.shield -= dt;
    if (this.bannerT > 0) this.bannerT -= dt; if (this.shake > 0) this.shake -= dt; if (this.flash > 0) this.flash -= dt;

    // auto fire
    this.fireCd -= dt;
    if (this.fireCd <= 0 && !this.ending) {
      this.fireCd = this.weapon >= 4 ? 7 : 10;
      const w = this.weapon;
      const shots: [number, number][] = w === 1 ? [[0, 0]] : w === 2 ? [[-9, 0], [9, 0]] : [[0, 0], [-12, -1.4], [12, 1.4]];
      if (w >= 4) shots.push([-22, -2.6], [22, 2.6]);
      for (const [dx, vx] of shots) this.bullets.push({ x: this.px + dx, y: this.py - 18, vx, vy: -13, dmg: 1, r: 4 });
    }

    if (!this.ending) this.spawnTick();

    // bullets
    for (const b of this.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
    this.bullets = this.bullets.filter((b) => b.y > -20 && b.x > -20 && b.x < W + 20);
    for (const b of this.ebullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
    this.ebullets = this.ebullets.filter((b) => b.y < H + 30 && b.y > -40 && b.x > -30 && b.x < W + 30);

    // enemies
    for (const e of this.enemies) this.updateEnemy(e, dt);
    this.enemies = this.enemies.filter((e) => e.y < H + 60);

    // overclock beam
    if (this.ult > 0) {
      this.ult -= dt; this.invuln = Math.max(this.invuln, 6);
      for (const e of this.enemies) if (Math.abs(e.x - this.px) < 38 + e.r && e.y < this.py) { e.hp -= (e.boss ? 0.55 : 1.3) * dt; e.flash = 3; if (e.hp <= 0) this.kill(e); }
      for (const b of this.ebullets) if (Math.abs(b.x - this.px) < 44 && b.y < this.py) b.y = 9999;
      if (this.frame % 2 === 0) this.sparks.push({ x: this.px + rand(-30, 30), y: rand(0, this.py), vx: rand(-1, 1), vy: rand(-2, 2), life: 18, max: 18, color: "#9dfdff", size: rand(2, 4) });
      this.shake = Math.max(this.shake, 4);
    }

    // bullet vs enemy
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (e.hp <= 0 || e.y < -e.r + 10) continue;
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
          b.y = -999; e.hp -= b.dmg; e.flash = 4;
          this.burst(b.x, b.y < 0 ? e.y : b.y, "#fff", 2, 2);
          if (e.hp <= 0) this.kill(e);
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.y > -900);
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // hits on player
    if (this.invuln <= 0 && !this.ending) {
      for (const b of this.ebullets) if (Math.hypot(b.x - this.px, b.y - this.py) < b.r + 6) { b.y = 9999; this.hurt(); break; }
      for (const e of this.enemies) if (!e.boss && Math.hypot(e.x - this.px, e.y - this.py) < e.r + 7) { e.hp = 0; this.kill(e, true); this.hurt(); break; }
      this.ebullets = this.ebullets.filter((b) => b.y < 9000);
      this.enemies = this.enemies.filter((e) => e.hp > 0);
    }
    this.ebullets = this.ebullets.filter((b) => b.y < 9000);
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // pickups
    for (const p of this.pickups) {
      p.y += 1.7 * dt;
      const dx = this.px - p.x, dy = this.py - p.y, dd = Math.hypot(dx, dy);
      if (dd < 150 && dd > 1) { p.x += (dx / dd) * 5 * dt; p.y += (dy / dd) * 5 * dt; }
      if (Math.hypot(p.x - this.px, p.y - this.py) < 34) { this.collect(p); p.y = 9999; }
    }
    this.pickups = this.pickups.filter((p) => p.y < H + 30);

    // particles + stars
    for (const s of this.sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; }
    this.sparks = this.sparks.filter((s) => s.life > 0);
    for (const r of this.rings) { r.life -= dt; r.r += (r.max - r.r) * 0.12 * dt; }
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const p of this.pops) { p.y -= 0.9 * dt; p.life -= dt; }
    this.pops = this.pops.filter((p) => p.life > 0);
    for (const st of this.stars) { st.y += st.z * 1.2 * dt; if (st.y > H) { st.y = 0; st.x = rand(0, W); } }

    // combo decay
    if (this.frame - this.lastKill > 110) this.combo = 0;

    // level end
    if (!this.ending) {
      const done = L.boss ? this.bossRef !== null && this.bossRef.hp <= 0 : this.spawned >= L.total && this.queue.length === 0 && this.enemies.length === 0;
      if (done) this.finishLevel();
    }
    this.emitHud();
  }

  private updateEnemy(e: Enemy, dt: number) {
    e.t += dt; if (e.flash > 0) e.flash -= dt;
    switch (e.kind) {
      case "wave": e.y += e.vy * dt; e.x = e.x0 + Math.sin(e.t * 0.06) * 90; break;
      case "zig": e.y += e.vy * dt; e.x += e.vx * dt; if ((e.x < 24 && e.vx < 0) || (e.x > W - 24 && e.vx > 0)) e.vx *= -1; break;
      case "dive": {
        if (e.cd === 0) { e.y += 3.2 * dt; if (e.y > 90 + (e.x0 % 60)) e.cd = 1; }
        else if (e.cd < 40) { e.cd += dt; e.flash = 2; } // telegraph
        else if (e.cd < 41) { const a = Math.atan2(this.py - e.y, this.px - e.x); e.vx = Math.cos(a) * 3; e.vy = Math.sin(a) * 3; e.cd = 41; }
        else { e.vx *= 1.018; e.vy *= 1.018; e.x += e.vx * dt; e.y += e.vy * dt; }
        break; }
      case "shooter":
        if (e.y < 110 + (e.x0 % 80)) e.y += e.vy * dt; else { e.x += Math.sin(e.t * 0.03 + e.x0) * 1.3 * dt; e.y += 0.05 * dt; }
        e.cd -= dt;
        if (e.cd <= 0 && e.y > 40) { e.cd = 140; this.aim(e.x, e.y, 3.5); }
        break;
      case "monolith": {
        if (e.y < 130) e.y += 1.2 * dt; else {
          e.x += e.vx * dt; if (e.x < 90 || e.x > W - 90) e.vx *= -1;
          e.cd -= dt; const rage = e.hp < e.max / 2;
          if (e.cd <= 0) {
            e.cd = rage ? 70 : 95;
            for (const a of [-0.35, 0, 0.35]) this.ebullets.push({ x: e.x, y: e.y + 40, vx: Math.sin(a) * 3.8, vy: Math.cos(a) * 3.8, dmg: 1, r: 7 });
            if (rage) this.aim(e.x, e.y, 4.2);
          }
          if (Math.floor(e.t) % 170 === 0 && e.t % 1 < dt && this.enemies.length < 9) { this.spawn("drift", e.x - 50, e.y + 20); this.spawn("drift", e.x + 50, e.y + 20); }
        }
        break;
      }
      case "hydra": {
        if (e.y < 140) e.y += 1.2 * dt; else {
          e.x = W / 2 + Math.sin(e.t * 0.012) * (W / 2 - 110);
          e.cd -= dt; const rage = e.hp < e.max / 2;
          if (e.cd <= 0) {
            e.cd = rage ? 8 : 12;
            const a = e.t * 0.12;
            this.ebullets.push({ x: e.x, y: e.y + 30, vx: Math.cos(a) * 2.9, vy: Math.abs(Math.sin(a)) * 2.9 + 1.1, dmg: 1, r: 6 });
            if (rage) this.ebullets.push({ x: e.x, y: e.y + 30, vx: Math.cos(a + Math.PI) * 2.9, vy: Math.abs(Math.sin(a + Math.PI)) * 2.9 + 1.1, dmg: 1, r: 6 });
          }
          if (Math.floor(e.t) % 120 === 0 && e.t % 1 < dt) this.aim(e.x, e.y, 4.2);
        }
        break;
      }
      default: e.y += e.vy * dt;
    }
  }

  private aim(x: number, y: number, speed: number) {
    const a = Math.atan2(this.py - y, this.px - x);
    this.ebullets.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg: 1, r: 6 });
  }

  private kill(e: Enemy, rammed = false) {
    this.combo = this.frame - this.lastKill < 110 ? this.combo + 1 : 1;
    this.lastKill = this.frame;
    const mult = Math.min(5, 1 + Math.floor(this.combo / 5));
    if (!rammed) this.score += e.pts * mult;
    this.burst(e.x, e.y, e.boss ? "#ffd24d" : "#00e5c3", e.boss ? 60 : 14, e.boss ? 9 : 5);
    this.rings.push({ x: e.x, y: e.y, r: e.r * 0.5, max: e.boss ? 260 : e.r * 3, life: e.boss ? 40 : 22, color: e.boss ? "#ffd24d" : "#00e5c3" });
    if (!rammed) this.pops.push({ x: e.x, y: e.y - e.r, text: `+${e.pts * mult}${mult > 1 ? ` x${mult}` : ""}`, life: 45, color: mult > 1 ? "#ffd24d" : "#ffffff", big: e.boss });
    sfx.kill();
    if (e.boss) { this.charge = 100; this.shake = 40; this.flash = 14; this.ebullets = []; for (const o of this.enemies) if (o !== e) { o.hp = 0; this.burst(o.x, o.y, "#ff5c93", 10, 4); } return; }
    this.charge = Math.min(100, this.charge + (e.kind === "tank" ? 7 : 3.5));
    if (e.kind === "tank" && !rammed) { for (const d of [-26, 26]) { this.spawn("drift", e.x + d, e.y); const n = this.enemies[this.enemies.length - 1]; n.vx = d / 14; n.vy = 2.2; } }
    const drop = e.kind === "tank" ? 0.5 : e.kind === "shooter" ? 0.3 : e.kind === "dive" ? 0.15 : 0.11;
    if (Math.random() < drop) {
      const r = Math.random();
      this.pickups.push({ x: e.x, y: e.y, kind: r < 0.5 ? "power" : r < 0.75 ? "shield" : r < 0.93 ? "bomb" : "life" });
    }
  }

  private hurt() {
    sfx.hit(); this.shake = 14;
    this.burst(this.px, this.py, "#ff5c93", 22, 6);
    if (this.shield > 0) { this.shield = 0; this.invuln = 60; return; }
    this.lives--; this.weapon = Math.max(1, this.weapon - 1); this.invuln = 170; this.combo = 0;
    if (this.lives <= 0) { this.ending = true; this.pause(); this.render(); sfx.over(); this.cb.onOver(this.score, this.lvl); }
  }

  private collect(p: Pickup) {
    sfx.pickup();
    this.burst(p.x, p.y, PICK[p.kind].color, 12, 4);
    this.rings.push({ x: p.x, y: p.y, r: 10, max: 70, life: 25, color: PICK[p.kind].color });
    this.pops.push({ x: p.x, y: p.y - 24, text: p.kind === "power" ? "WEAPON UP!" : p.kind === "shield" ? "SHIELD!" : p.kind === "bomb" ? "BLAST!" : "+1 LIFE", life: 55, color: PICK[p.kind].color, big: false });
    this.score += 25; this.charge = Math.min(100, this.charge + 8);
    if (p.kind === "power") this.weapon = Math.min(4, this.weapon + 1);
    if (p.kind === "shield") this.shield = 420;
    if (p.kind === "life") this.lives = Math.min(5, this.lives + 1);
    if (p.kind === "bomb") {
      sfx.bomb(); this.flash = 12; this.shake = 18; this.ebullets = [];
      for (const e of this.enemies) { e.hp -= e.boss ? 15 : 6; e.flash = 6; if (e.hp <= 0) this.kill(e); }
    }
  }

  private finishLevel() {
    this.ending = true; this.ebullets = [];
    this.lives = Math.min(5, this.lives + 1); this.charge = Math.max(this.charge, 50); // reward for clearing a level
    sfx.clear();
    setTimeout(() => {
      this.pause();
      if (this.lvl >= LEVELS.length - 1) this.cb.onWin(this.score); else this.cb.onClear(this.lvl, this.score);
    }, 900);
  }

  private burst(x: number, y: number, color: string, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, v = rand(0.4, 1) * speed;
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(20, 40), max: 40, color, size: rand(2, 4.5) });
    }
  }

  private emitHud() {
    if (this.frame % 4 !== 0) return;
    const h: Hud = {
      charge: Math.floor(this.charge), score: this.score, lives: this.lives, level: this.lvl + 1, combo: this.combo,
      mult: Math.min(5, 1 + Math.floor(this.combo / 5)), weapon: this.weapon, shield: this.shield > 0,
      boss: this.bossRef ? Math.max(0, this.bossRef.hp / this.bossRef.max) : -1,
    };
    const key = JSON.stringify(h);
    if (key !== this.lastHud) { this.lastHud = key; this.cb.onHud(h); }
  }

  // ---------- render ----------
  private drawBg() {
    const g = this.ctx;
    const off = (this.frame * 0.35) % H;
    g.drawImage(this.nebula, 0, off); g.drawImage(this.nebula, 0, off - H);
    for (const s of this.stars) {
      const tw = 0.55 + 0.45 * Math.sin(this.frame * 0.05 + s.x);
      g.globalAlpha = (0.2 + s.z * 0.35) * tw; g.fillStyle = s.z > 1.2 ? "#cfe6ff" : "#fff";
      g.fillRect(s.x, s.y, s.z * 1.7, s.z * (s.z > 1.2 ? 4 : 1.7)); // fast stars streak
    }
    g.globalAlpha = 1;
  }

  private drawIdle() { this.drawBg(); this.ctx.drawImage(this.vignette, 0, 0); }

  private glow(x: number, y: number, size: number, color: string, alpha = 1) {
    const g = this.ctx; g.globalAlpha = alpha; g.drawImage(glowSprite(color), x - size / 2, y - size / 2, size, size);
  }

  private bug(e: Enemy) {
    const g = this.ctx, t = e.t, r = e.r;
    g.save(); g.translate(e.x, e.y);
    if (e.flash > 0) g.globalAlpha = 0.55;
    const col = { drift: "#ff5c93", wave: "#00e5c3", zig: "#ffb84d", shooter: "#b36bff", tank: "#5be37a", dive: "#ff3355" }[e.kind as EnemyKind] ?? "#fff";
    g.globalCompositeOperation = "lighter"; this.glow(0, 0, r * 4.2, col, 0.55); g.globalCompositeOperation = "source-over";
    g.lineCap = "round"; g.strokeStyle = col; g.lineWidth = 2;
    const legs = (n: number, len: number) => { for (let i = 0; i < n; i++) { const a = (i / (n - 1) - 0.5) * 2.4, w = Math.sin(t * 0.3 + i) * 0.35; g.beginPath(); g.moveTo(Math.sin(a) * r * 0.5, Math.cos(a) * r * 0.2); g.lineTo(Math.sin(a + w) * (r + len), Math.cos(a + w) * (r * 0.4 + len) ); g.stroke(); } };
    const eyes = (dx: number, dy: number, er: number) => {
      const ax = Math.atan2(this.py - e.y, this.px - e.x);
      for (const s of [-1, 1]) { g.fillStyle = "#fff"; g.beginPath(); g.arc(s * dx, dy, er, 0, 6.283); g.fill(); g.fillStyle = "#12091f"; g.beginPath(); g.arc(s * dx + Math.cos(ax) * er * 0.4, dy + Math.sin(ax) * er * 0.4, er * 0.5, 0, 6.283); g.fill(); }
    };
    switch (e.kind) {
      case "wave": { // mosquito: flapping wings
        const f = Math.sin(t * 0.9) * 0.5;
        g.fillStyle = "rgba(160,255,240,.35)";
        for (const s of [-1, 1]) { g.save(); g.rotate(s * (0.7 + f)); g.beginPath(); g.ellipse(s * r * 0.9, -r * 0.3, r * 0.95, r * 0.38, 0, 0, 6.283); g.fill(); g.restore(); }
        g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, r * 0.55, r * 0.85, 0, 0, 6.283); g.fill();
        g.beginPath(); g.moveTo(0, r * 0.8); g.lineTo(0, r * 1.5); g.stroke(); eyes(r * 0.22, -r * 0.3, r * 0.2); break; }
      case "zig": { // beetle shell
        legs(6, 6); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, r * 0.95, r * 1.05, 0, 0, 6.283); g.fill();
        g.strokeStyle = "#7a4a00"; g.beginPath(); g.moveTo(0, -r); g.lineTo(0, r); g.stroke();
        g.fillStyle = "#7a4a00"; for (const [px, py] of [[-0.45, -0.2], [0.45, -0.2], [-0.4, 0.4], [0.4, 0.4]]) { g.beginPath(); g.arc(px * r, py * r, r * 0.13, 0, 6.283); g.fill(); }
        eyes(r * 0.3, -r * 0.85, r * 0.17); break; }
      case "shooter": { // alien with a tracking eye
        g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.lineTo(r, r * 0.45); for (let i = 4; i >= 0; i--) g.lineTo(-r + (i * 2 * r) / 4, r * 0.45 + (i % 2 ? 7 : 0) + Math.sin(t * 0.2 + i) * 2); g.closePath(); g.fill();
        g.fillStyle = "#fff"; g.beginPath(); g.arc(0, -r * 0.15, r * 0.45, 0, 6.283); g.fill();
        const ax = Math.atan2(this.py - e.y, this.px - e.x); g.fillStyle = "#ff2d6a"; g.beginPath(); g.arc(Math.cos(ax) * r * 0.2, -r * 0.15 + Math.sin(ax) * r * 0.2, r * 0.22, 0, 6.283); g.fill(); break; }
      case "tank": { // armoured caterpillar
        for (let i = 2; i >= 0; i--) { const ox = Math.sin(t * 0.1 + i) * 5, oy = i * r * 0.7 - r * 0.2; g.fillStyle = i === 0 ? col : "#3fb15e"; g.beginPath(); g.arc(ox, oy, r * (1 - i * 0.12), 0, 6.283); g.fill(); g.strokeStyle = "#1f6a36"; g.stroke(); }
        eyes(r * 0.33, -r * 0.2, r * 0.22); g.strokeStyle = col; g.beginPath(); g.moveTo(-r * 0.3, -r); g.lineTo(-r * 0.5, -r * 1.35); g.moveTo(r * 0.3, -r); g.lineTo(r * 0.5, -r * 1.35); g.stroke(); break; }
      default: { // classic bug
        legs(6, 7); g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
        g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.arc(0, r * 0.3, r * 0.75, 0, Math.PI); g.fill();
        eyes(r * 0.38, -r * 0.2, r * 0.28); g.strokeStyle = col; g.beginPath(); g.moveTo(-r * 0.3, -r * 0.9); g.lineTo(-r * 0.6, -r * 1.4); g.moveTo(r * 0.3, -r * 0.9); g.lineTo(r * 0.6, -r * 1.4); g.stroke(); }
    }
    g.restore();
  }

  private bossDraw(e: Enemy) {
    const g = this.ctx, pulse = 1 + Math.sin(e.t * 0.08) * 0.08, hydra = e.kind === "hydra", col = hydra ? "#ff2d6a" : "#ffb84d";
    g.globalCompositeOperation = "lighter"; this.glow(e.x, e.y, e.r * 4.5 * pulse, col, 0.6);
    for (let i = 0; i < 8; i++) { const a = e.t * (hydra ? 0.04 : -0.03) + (i / 8) * 6.283; this.glow(e.x + Math.cos(a) * (e.r + 26), e.y + Math.sin(a) * (e.r + 26), 26, hydra ? "#ff8fb0" : "#ffd24d", 0.9); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = e.flash > 0 ? 0.6 : 1;
    g.font = `${e.r * 1.9}px serif`; g.fillText(e.emoji, e.x, e.y + 4); g.globalAlpha = 1;
    // name plate + hp bar (top of screen)
    const bw = W - 120, by = 18, frac = Math.max(0, e.hp / e.max);
    g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(60, by, bw, 12);
    const gr = g.createLinearGradient(60, 0, 60 + bw, 0); gr.addColorStop(0, "#ff5c93"); gr.addColorStop(1, col);
    g.fillStyle = gr; g.fillRect(60, by, bw * frac, 12); g.strokeStyle = "rgba(255,255,255,.4)"; g.strokeRect(60, by, bw, 12);
    g.fillStyle = "#fff"; g.font = "700 12px 'JetBrains Mono', monospace"; g.fillText(hydra ? "MEMORY LEAK HYDRA" : "THE MONOLITH", W / 2, by + 28);
  }

  private render() {
    const g = this.ctx;
    g.save();
    if (this.shake > 0) g.translate(rand(-1, 1) * this.shake * 0.4, rand(-1, 1) * this.shake * 0.4);
    this.drawBg();
    g.textAlign = "center"; g.textBaseline = "middle";

    // expanding rings
    for (const r of this.rings) { g.globalAlpha = Math.max(0, r.life / 30); g.strokeStyle = r.color; g.lineWidth = 3; g.beginPath(); g.arc(r.x, r.y, r.r, 0, 6.283); g.stroke(); }
    g.globalAlpha = 1;

    // pickups
    for (const p of this.pickups) {
      const c = PICK[p.kind], pu = 1 + Math.sin(this.frame * 0.15) * 0.12;
      g.globalCompositeOperation = "lighter"; this.glow(p.x, p.y, 70 * pu, c.color, 0.75); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
      g.fillStyle = "rgba(8,10,26,.85)"; g.beginPath(); g.arc(p.x, p.y, 19, 0, 6.283); g.fill();
      g.strokeStyle = c.color; g.lineWidth = 2; g.setLineDash([6, 5]); g.lineDashOffset = -this.frame * 0.6; g.beginPath(); g.arc(p.x, p.y, 23, 0, 6.283); g.stroke(); g.setLineDash([]);
      g.font = "20px serif"; g.fillStyle = "#fff"; g.fillText(c.emoji, p.x, p.y + 1);
      g.font = "700 10px 'JetBrains Mono', monospace"; g.fillStyle = c.color; g.fillText(c.label, p.x, p.y + 36);
    }

    // enemies
    for (const e of this.enemies) { if (e.boss) this.bossDraw(e); else { this.bug(e); if (e.max > 1) { const w = 38, y = e.y - e.r - 12; g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(e.x - w / 2, y, w, 4); g.fillStyle = "#00e5c3"; g.fillRect(e.x - w / 2, y, w * Math.max(0, e.hp / e.max), 4); } } }

    // bullets (additive, with trails)
    g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    for (const b of this.bullets) {
      const gr = g.createLinearGradient(b.x, b.y + 18, b.x, b.y - 8); gr.addColorStop(0, "rgba(0,229,195,0)"); gr.addColorStop(1, "#b8fff2");
      g.strokeStyle = gr; g.lineWidth = 4; g.beginPath(); g.moveTo(b.x - b.vx, b.y + 18); g.lineTo(b.x, b.y - 8); g.stroke();
      this.glow(b.x, b.y - 6, 26, "#00e5c3", 0.7);
    }
    for (const b of this.ebullets) { this.glow(b.x, b.y, b.r * 5, "#ff2d6a", 0.9); this.glow(b.x, b.y, b.r * 2.2, "#ffd0e0", 1); }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";

    // overclock beam
    if (this.ult > 0) {
      const k = Math.min(1, this.ult / 20), fl = 0.85 + Math.random() * 0.15, bw = 70 * fl;
      g.globalCompositeOperation = "lighter";
      const bg = g.createLinearGradient(this.px - bw / 2, 0, this.px + bw / 2, 0);
      bg.addColorStop(0, "rgba(90,200,255,0)"); bg.addColorStop(0.35, `rgba(120,230,255,${0.55 * k})`); bg.addColorStop(0.5, `rgba(255,255,255,${k})`); bg.addColorStop(0.65, `rgba(120,230,255,${0.55 * k})`); bg.addColorStop(1, "rgba(90,200,255,0)");
      g.fillStyle = bg; g.fillRect(this.px - bw / 2, 0, bw, this.py);
      this.glow(this.px, this.py - 20, 160, "#7de3ff", 0.8 * k);
      g.globalCompositeOperation = "source-over";
    }

    // player ship
    if (!this.ending || this.lives > 0) {
      const blink = this.invuln > 0 && Math.floor(this.frame / 4) % 2 === 0;
      if (!blink) {
        const x = this.px, y = this.py;
        g.save(); g.translate(x, y); g.rotate(this.bank * 0.28);
        g.globalCompositeOperation = "lighter"; this.glow(0, 4, 90, "#7c5cff", 0.55); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
        // flame
        const fl = 14 + Math.random() * 10, fg = g.createLinearGradient(0, 10, 0, 10 + fl); fg.addColorStop(0, "#fff7c2"); fg.addColorStop(0.4, "#ffb84d"); fg.addColorStop(1, "rgba(255,92,147,0)");
        g.fillStyle = fg; g.beginPath(); g.moveTo(-6, 10); g.lineTo(0, 10 + fl); g.lineTo(6, 10); g.closePath(); g.fill();
        // wings
        const wg = g.createLinearGradient(-22, 0, 22, 0); wg.addColorStop(0, "#5b3df5"); wg.addColorStop(0.5, "#9d86ff"); wg.addColorStop(1, "#5b3df5");
        g.fillStyle = wg; g.beginPath(); g.moveTo(0, -26); g.lineTo(9, -4); g.lineTo(24, 14); g.lineTo(11, 11); g.lineTo(0, 16); g.lineTo(-11, 11); g.lineTo(-24, 14); g.lineTo(-9, -4); g.closePath(); g.fill();
        g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = "#00e5c3"; g.beginPath(); g.moveTo(-23, 13); g.lineTo(-19, 5); g.lineTo(-16, 12); g.closePath(); g.moveTo(23, 13); g.lineTo(19, 5); g.lineTo(16, 12); g.closePath(); g.fill();
        const cg = g.createRadialGradient(0, -8, 1, 0, -6, 10); cg.addColorStop(0, "#e8fffb"); cg.addColorStop(1, "#00b8a0");
        g.fillStyle = cg; g.beginPath(); g.ellipse(0, -5, 5, 10, 0, 0, 6.283); g.fill();
        g.restore();
      }
      if (this.shield > 0) {
        const fade = this.shield < 90 && Math.floor(this.frame / 5) % 2 ? 0.25 : 1;
        g.globalCompositeOperation = "lighter"; this.glow(this.px, this.py, 110, "#5ac8ff", 0.5 * fade); g.globalCompositeOperation = "source-over";
        g.globalAlpha = 0.85 * fade; g.strokeStyle = "#8fdcff"; g.lineWidth = 2.5; g.beginPath(); g.arc(this.px, this.py, 34, 0, 6.283); g.stroke(); g.globalAlpha = 1;
      }
    }

    // particles (additive)
    g.globalCompositeOperation = "lighter";
    for (const s of this.sparks) { const a = Math.max(0, s.life / s.max); g.globalAlpha = a; g.fillStyle = s.color; g.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size); this.glow(s.x, s.y, s.size * 5, s.color, a * 0.5); }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";

    // floating text
    g.textAlign = "center";
    for (const p of this.pops) { g.globalAlpha = Math.min(1, p.life / 20); g.fillStyle = p.color; g.font = `800 ${p.big ? 26 : 14}px Inter, sans-serif`; g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 3; g.strokeText(p.text, p.x, p.y); g.fillText(p.text, p.x, p.y); }
    g.globalAlpha = 1;

    // vignette + low-health alarm
    g.drawImage(this.vignette, 0, 0);
    if (this.lives === 1 && !this.ending) { g.fillStyle = `rgba(255,30,80,${0.05 + 0.06 * Math.sin(this.frame * 0.12)})`; g.fillRect(0, 0, W, H); }

    // wave progress + overclock meter
    const Lv = LEVELS[this.lvl];
    if (!Lv.boss) {
      const wp = Math.min(1, this.spawned / Lv.total);
      g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(60, 10, W - 120, 5);
      g.fillStyle = "#7c5cff"; g.fillRect(60, 10, (W - 120) * wp, 5);
      g.fillStyle = "rgba(255,255,255,.55)"; g.font = "600 10px 'JetBrains Mono', monospace"; g.textAlign = "center"; g.fillText(`WAVE ${Math.min(this.spawned + 1, Lv.total)}/${Lv.total}`, W / 2, 28);
    }
    {
      const bw = 220, bx = W / 2 - bw / 2, by = H - 22, ready = this.charge >= 100, pulse = ready ? 0.6 + 0.4 * Math.sin(this.frame * 0.25) : 1;
      g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(bx, by, bw, 10);
      const cg = g.createLinearGradient(bx, 0, bx + bw, 0); cg.addColorStop(0, "#5ac8ff"); cg.addColorStop(1, ready ? "#ffffff" : "#7c5cff");
      g.globalAlpha = pulse; g.fillStyle = cg; g.fillRect(bx, by, (bw * Math.min(100, this.charge)) / 100, 10); g.globalAlpha = 1;
      g.strokeStyle = ready ? "#fff" : "rgba(255,255,255,.35)"; g.strokeRect(bx, by, bw, 10);
      g.fillStyle = ready ? "#fff" : "rgba(255,255,255,.6)"; g.font = "700 10px 'JetBrains Mono', monospace"; g.textAlign = "center";
      g.fillText(ready ? "⚡ OVERCLOCK READY - SPACE / TAP ⚡" : "OVERCLOCK", W / 2, by - 8);
    }

    // level banner
    if (this.bannerT > 0) {
      const L = LEVELS[this.lvl], a = Math.max(0, Math.min(1, this.bannerT / 40, (150 - this.bannerT) / 20 + 0.2));
      g.globalAlpha = a; g.textAlign = "center";
      if (L.boss) { g.fillStyle = Math.floor(this.frame / 8) % 2 ? "#ff2d6a" : "#ffd24d"; g.font = "900 22px Inter, sans-serif"; g.fillText("⚠ WARNING ⚠", W / 2, H / 2 - 100); }
      g.fillStyle = "#fff"; g.font = "800 44px Inter, sans-serif"; g.shadowColor = "#7c5cff"; g.shadowBlur = 24; g.fillText(`LEVEL ${this.lvl + 1}`, W / 2, H / 2 - 56);
      g.shadowColor = "#00e5c3"; g.fillStyle = "#00e5c3"; g.font = "800 28px Inter, sans-serif"; g.fillText(L.name, W / 2, H / 2 - 10); g.shadowBlur = 0;
      g.fillStyle = "#c9cdf5"; g.font = "500 14px 'JetBrains Mono', monospace"; g.fillText(L.tech, W / 2, H / 2 + 24);
      g.globalAlpha = 1;
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash / 18})`; g.fillRect(0, 0, W, H); }
    g.restore();
  }
}
