import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Serves POST /api/chat during `npm run dev` using the same core as the Vercel function. */
function chatDevApi(): Plugin {
  return {
    name: "chat-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
        let raw = "";
        req.on("data", (c) => { raw += c; if (raw.length > 20_000) req.destroy(); });
        req.on("end", async () => {
          try {
            const { handleChat } = (await server.ssrLoadModule("/server/chat-core.ts")) as typeof import("./server/chat-core");
            let body: unknown = {}; try { body = JSON.parse(raw || "{}"); } catch { /* bad json -> empty question */ }
            const out = await handleChat({ ip: req.socket.remoteAddress ?? "dev", body });
            res.statusCode = out.status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(out.json));
          } catch (e) {
            res.statusCode = 500; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // expose .env.local values (e.g. LLM_API_KEY) to the dev API only, never to the browser bundle
  const env = loadEnv(mode, process.cwd(), "");
  for (const k of ["LLM_API_KEY", "GROQ_API_KEY", "LLM_BASE_URL", "LLM_MODEL", "CHAT_LIMIT_PER_IP", "CHAT_LIMIT_GLOBAL", "ALLOWED_ORIGIN"]) if (env[k]) process.env[k] = env[k];
  return { plugins: [react(), tailwindcss(), chatDevApi()] };
});
