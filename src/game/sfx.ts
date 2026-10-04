let ctx: AudioContext | null = null;
export let muted = false;
export const setMuted = (m: boolean) => { muted = m; };

export function initAudio() {
  if (!ctx) { try { ctx = new AudioContext(); } catch { /* unsupported */ } }
  void ctx?.resume();
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.05, slide = 0) {
  if (!ctx || muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
}

export const sfx = {
  kill: () => tone(520, 0.09, "square", 0.04, 300),
  hit: () => tone(180, 0.25, "sawtooth", 0.07, -120),
  pickup: () => { tone(660, 0.08, "triangle", 0.06); setTimeout(() => tone(990, 0.1, "triangle", 0.06), 70); },
  bomb: () => tone(120, 0.5, "sawtooth", 0.08, -80),
  boss: () => tone(90, 0.4, "square", 0.06, 60),
  clear: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.15, "triangle", 0.06), i * 110)),
  over: () => [400, 300, 200].forEach((f, i) => setTimeout(() => tone(f, 0.25, "sawtooth", 0.06), i * 160)),
};
