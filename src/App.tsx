import { useCallback, useState } from "react";
import { About } from "./components/About";
import { Achievements } from "./components/Achievements";
import { Contact } from "./components/Contact";
import { CursorGlow } from "./components/CursorGlow";
import { Experience } from "./components/Experience";
import { Hero } from "./components/Hero";
import { MatrixRain } from "./components/MatrixRain";
import { Navbar } from "./components/Navbar";
import { ParticleBackground } from "./components/ParticleBackground";
import { Projects } from "./components/Projects";
import { ScrollProgress } from "./components/ScrollProgress";
import { DebugQuest } from "./components/DebugQuest";
import { Clubs } from "./components/Clubs";
import { Skills } from "./components/Skills";
import { Terminal } from "./components/Terminal";
import { ToastProvider, useToast } from "./components/Toast";
import { profile } from "./data/portfolio";
import { AskPortfolio } from "./components/AskPortfolio";
import { RecruiterStrip } from "./components/RecruiterStrip";
import { FocusProvider } from "./context/focus";
import { useKonami } from "./hooks/useKonami";
import { useTheme } from "./hooks/useTheme";

function Page() {
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const [matrix, setMatrix] = useState(false);
  const closeMatrix = useCallback(() => setMatrix(false), []);
  const [chatOpen, setChatOpen] = useState(false);
  const [seed, setSeed] = useState({ q: "", n: 0 });
  const openChat = useCallback((q?: string) => { setChatOpen(true); if (q) setSeed((s) => ({ q, n: s.n + 1 })); }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  useKonami(useCallback(() => { toast("🕹️ Konami unlocked! Entering the matrix..."); setMatrix(true); }, [toast]));

  return (
    <>
      <ScrollProgress />
      <ParticleBackground />
      <CursorGlow />
      <Navbar theme={theme} onToggle={toggle} />
      <main>
        <Hero onEasterEgg={(n) => n === 5 && toast("Stop poking me 😅 - try the game instead!")} />
        <RecruiterStrip onAsk={openChat} />
        <About />
        <Skills />
        <Experience />
        <Clubs />
        <Projects />
        <Achievements />
        <DebugQuest />
        <Terminal onTheme={toggle} onMatrix={() => setMatrix(true)} onAsk={() => openChat()} />
        <Contact />
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        Designed &amp; built by {profile.name} · © {new Date().getFullYear()}
      </footer>
      <AskPortfolio open={chatOpen} onOpen={() => openChat()} onClose={closeChat} seed={seed} />
      {matrix && <MatrixRain onDone={closeMatrix} />}
    </>
  );
}

export default function App() {
  return <FocusProvider><ToastProvider><Page /></ToastProvider></FocusProvider>;
}
