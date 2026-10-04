# Pratibimb Gupta - Portfolio

Stack: Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion · Three.js (@react-three/fiber + drei) · Canvas API

## Run
    npm install
    npm run dev       # http://localhost:5173
    npm run build     # outputs dist/
    npm run preview

## Edit content
Everything (bio, skills, experience, projects, certs, links) is in `src/data/portfolio.ts`.
Search for `TODO`: Privacera details, per-certificate Drive links (currently all point at the Drive folder), project repo links, club blurbs.

## Structure
    src/
      game/                  Debug Quest engine (engine.ts), level data (levels.ts), sound (sfx.ts)
      data/portfolio.ts      content
      hooks/                 useTheme, useKonami, useActiveSection
      components/            Hero, About, Skills, Experience, Projects, Achievements,
                             SkillCatcher (game), Terminal, Contact, Matrix easter egg, ...
      index.css              Tailwind v4 theme + dark/light tokens
    public/                  resume PDF

Deploy: any static host (Vercel, Netlify, GitHub Pages - set `base` in vite.config.ts for Pages).

## "Ask my portfolio" assistant (free to run)
A small RAG chatbot. **Retrieval** (BM25 over `src/data/knowledge.ts`, which is generated from `portfolio.ts`) runs in
`src/lib/retrieve.ts`; **generation** is a free-tier LLM called from a serverless function, so the API key never reaches the browser.

- Works with **no setup at all**: without a key it answers from the retrieved passages (offline mode, costs nothing).
- To enable AI-written answers for free: create a key at https://console.groq.com/keys (no credit card), then
  - local: copy `.env.example` to `.env.local`, set `LLM_API_KEY`, run `npm run dev`
  - Vercel: Project -> Settings -> Environment Variables -> add `LLM_API_KEY`, redeploy
- Other free providers: set `LLM_BASE_URL` / `LLM_MODEL` (Gemini and OpenRouter `:free` models examples are in `.env.example`).
- Cost guard: `CHAT_LIMIT_PER_IP` (default 15/day) and `CHAT_LIMIT_GLOBAL` (default 250/day). When the provider's free quota is
  exhausted the site automatically falls back to retrieval-only answers.
- Files: `server/chat-core.ts` (logic), `api/chat.ts` (Vercel adapter), `vite.config.ts` (serves `/api/chat` in dev).
- Not on Vercel (e.g. GitHub Pages)? Static hosts can't run `api/`; the assistant then runs in offline mode, or deploy just the
  function elsewhere and change `ENDPOINT` in `src/components/AskPortfolio.tsx`.

## Recruiter strip
`focusModes` in `src/data/portfolio.ts` drives the "I'm hiring for..." switch (pitch, 3 metrics, suggested questions).
Projects, skills and experience carry a `focus` tag that re-ranks / highlights them for the selected role.
