import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const facts = [
  "🎓 B.Tech CSE · SRMIST · 2023 – Present",
  "🏅 3rd - Techxcelerate, BITS Pilani Hyderabad",
  "🚀 3rd - Hack The Cosmos, CSI SRMIST",
  "🏭 Intel Industrial Training · Completed (Jul 2025)",
  "📍 Chennai, India",
];
const badges = ["Agentic AI", "RAG", "Cloud-Native", "Geospatial AI", "Leadership", "Clubs & Communities"];

export function About() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading n="01" tag="about" sub="Part engineer, part researcher, part team leader.">
          Who is <span className="text-gradient">Pratibimb?</span>
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="glass space-y-3 p-7 text-muted">
            <p>I'm a B.Tech Computer Science student at <b className="text-ink">SRM Institute of Science and Technology, Chennai</b>, honoured with the <b className="text-ink">Best Academic Achiever Award</b>.</p>
            <p>I love turning research ideas into shippable products: RAG pipelines that review code, browser extensions that read emotions in real time, and QGIS plugins that make satellite-imagery analysis a click away.</p>
            <p>Beyond code, I led the AI/ML &amp; Editorial vertical at Team Envision (until Jan 2026) and was Associate Lead at Founder's Club, SRM (until May 2026).</p>
          </Reveal>
          <Reveal delay={0.1} className="glass p-7">
            <h3 className="mb-3 font-bold">Quick facts</h3>
            <ul className="space-y-1.5 text-muted">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((b) => <span key={b} className="rounded-full border border-line bg-bg2 px-3 py-1 text-xs">{b}</span>)}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
