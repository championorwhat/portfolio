// Vercel serverless function: POST /api/chat
import { handleChat } from "../server/chat-core";

interface Req { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; socket?: { remoteAddress?: string } }
interface Res { status(code: number): Res; json(body: unknown): void; setHeader(k: string, v: string): void }

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method_not_allowed" }); }
  const fwd = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  const out = await handleChat({
    ip: fwd || req.socket?.remoteAddress || "unknown",
    origin: typeof req.headers.origin === "string" ? req.headers.origin : undefined,
    body: req.body,
  });
  res.status(out.status).json(out.json);
}
