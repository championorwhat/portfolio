import { profile } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Contact() {
  return (
    <section id="contact" className="py-24 text-center">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading n="09" tag="contact" sub="Open to internships, research collaborations and interesting problems.">
          Let's <span className="text-gradient">talk</span>
        </SectionHeading>
        <Reveal>
          <a href={`mailto:${profile.email}`} className="text-gradient break-all text-[clamp(1.1rem,3.5vw,2rem)] font-bold">{profile.email}</a>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[["📞 " + profile.phone, `tel:${profile.phone.replace(/\s/g, "")}`], ["GitHub", profile.links.github], ["LinkedIn", profile.links.linkedin], ["LeetCode", profile.links.leetcode], ["📁 Certificates", profile.links.drive]].map(([l, h]) => (
              <a key={l} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="glass !rounded-xl px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-ink">{l}</a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
