// Tiny BM25 retriever. Pure TypeScript with no DOM or Node APIs, so the exact same
// code ranks chunks in the browser (offline mode) and in the serverless function.

export interface Chunk { id: string; title: string; text: string }
export interface Hit { chunk: Chunk; score: number; /** 0..1, relative to the best hit */ relevance: number }

const STOP = new Set(("a an the and or but if of to in on at for with by from as is are was were be been being do does did " +
  "i you he she it we they me my your his her their our this that these those what which who whom how why when where " +
  "can could would should will tell about please give show any have has had not no yes there here so than then too very").split(" "));

const SYNONYMS: Record<string, string[]> = {
  job: ["experience", "intern"], work: ["experience", "intern"], worked: ["experience", "intern"],
  internship: ["intern"], interned: ["intern"], company: ["intern", "experience"],
  study: ["education", "university"], studied: ["education", "university"], school: ["education", "university"], college: ["education", "university"], degree: ["education", "btech"],
  gpa: ["cgpa"], grade: ["cgpa"], marks: ["cgpa"],
  cert: ["certification"], certificate: ["certification"], credential: ["certification"],
  award: ["achievement", "position"], prize: ["position", "achievement"], hackathon: ["position", "achievement"],
  email: ["contact"], phone: ["contact"], reach: ["contact"], hire: ["contact", "resume"], cv: ["resume"],
  github: ["contact", "links"], linkedin: ["contact", "links"], leetcode: ["contact", "links", "dsa"],
  ml: ["ai", "machine"], llm: ["llms", "ai"], genai: ["ai", "llms"], aws: ["cloud", "aws"],
  club: ["society", "leadership"], clubs: ["society", "leadership"], lead: ["leadership"], team: ["leadership"],
  tech: ["skills", "stack"], stack: ["skills"], language: ["skills", "languages"], tool: ["skills", "tools"],
  built: ["project"], build: ["project"], made: ["project"], rag: ["rag", "retrieval"],
};

export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 6 && w.endsWith("ship")) w = w.slice(0, -4);
  return w;
}

export function tokenize(s: string): string[] {
  const out: string[] = [];
  for (const raw of s.toLowerCase().match(/[a-z0-9+#]+(?:\.[0-9]+)?/g) ?? []) {
    if (STOP.has(raw) || (raw.length < 2 && raw !== "c" && raw !== "r")) continue; // drops the stray "s" from "what's" / "Founder's"
    out.push(stem(raw));
  }
  return out;
}

export class Retriever {
  private docs: { chunk: Chunk; tf: Map<string, number>; len: number }[];
  private df = new Map<string, number>();
  private avg: number;

  constructor(chunks: Chunk[]) {
    this.docs = chunks.map((chunk) => {
      // titles count double: a question about "PwC" should land on the PwC chunk
      const toks = [...tokenize(chunk.title), ...tokenize(chunk.title), ...tokenize(chunk.text)];
      const tf = new Map<string, number>();
      for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return { chunk, tf, len: toks.length };
    });
    this.avg = this.docs.reduce((a, d) => a + d.len, 0) / Math.max(1, this.docs.length);
  }

  search(query: string, k = 4, minScore = 0.6): Hit[] {
    const base = tokenize(query);
    const terms = new Set(base);
    for (const raw of query.toLowerCase().match(/[a-z0-9+#]+/g) ?? []) for (const s of SYNONYMS[raw] ?? []) terms.add(stem(s));
    const N = this.docs.length, k1 = 1.4, b = 0.7;
    const scored = this.docs.map((d) => {
      let score = 0;
      for (const t of terms) {
        const f = d.tf.get(t); if (!f) continue;
        const n = this.df.get(t) ?? 0, idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / this.avg))) * (base.includes(t) ? 1 : 0.6);
      }
      return { chunk: d.chunk, score };
    }).filter((h) => h.score >= minScore).sort((a, z) => z.score - a.score).slice(0, k);
    const top = scored[0]?.score ?? 1;
    return scored.map((h) => ({ ...h, relevance: h.score / top }));
  }
}
