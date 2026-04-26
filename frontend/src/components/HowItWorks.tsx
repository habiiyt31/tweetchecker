import { SectionHeader } from "./SectionHeader";

const STEPS = [
  { n: "01", title: "Drop the link", body: "Paste any public Twitter/X URL. Reading verdicts is free; you only sign a transaction when you want a fresh analysis." },
  { n: "02", title: "Server fetches data", body: "A Next.js API route uses the twitterapi.io key (server-side only) to pull profile, tweet, and the last 20 posts." },
  { n: "03", title: "Send to the contract", body: <>The data is passed to the Intelligent Contract via <code className="font-mono text-ink">client.writeContract</code>.</> },
  { n: "04", title: "Validators reach consensus", body: "Multiple validators independently run the LLM. Optimistic Democracy resolves disagreements." },
  { n: "05", title: "Read the verdict", body: <>Anyone can call <code className="font-mono text-ink">get_result(url)</code> to retrieve the score and breakdown — straight from the chain.</> },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeader
          kicker="01 / How it works"
          title={<>Five steps,<br /><em className="font-serif font-normal italic text-accent">three seconds.</em></>}
        />
        <ol className="space-y-px">
          {STEPS.map((s) => (
            <li key={s.n} className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-line py-7 md:grid-cols-[6rem_1fr_auto] md:gap-x-10 md:py-10 lg:py-12">
              <div className="font-mono text-sm text-ink-mute md:text-base">{s.n}</div>
              <div className="max-w-[60ch]">
                <h3 className="mb-2 font-serif text-3xl text-ink md:text-4xl lg:text-5xl">{s.title}</h3>
                <p className="text-base leading-relaxed text-ink-dim md:text-lg">{s.body}</p>
              </div>
              <div className="hidden font-mono text-xs text-ink-ghost md:flex md:items-start md:justify-end md:pt-2">
                step.{s.n}
              </div>
            </li>
          ))}
          <li className="border-t border-line" aria-hidden />
        </ol>
      </div>
    </section>
  );
}
