import { SectionHeader } from "./SectionHeader";

const SIGNALS = [
  { n: "01", tag: "Identity", title: "Account source & age", body: "How old? Verified? Profile complete? Accounts younger than 30 days lose 25 points.", red: "4 days old, no bio, no avatar", green: "6 years old, verified, full profile" },
  { n: "02", tag: "Network", title: "Followers & following ratio", body: "Real accounts grow inbound. Bots follow thousands hoping for follow-backs.", red: "Following 5,000 / 80 followers", green: "Following 500 / 2,000 followers" },
  { n: "03", tag: "Behavior", title: "Recent tweet pattern", body: "The last 20 posts tell a story. A real human posts varied content. A scam account posts identical promotions on a timer.", red: "20/20 are token shilling", green: "Mix of opinions, news, replies" },
  { n: "04", tag: "★ Most important", title: "Engagement spike", body: "The single strongest scam tell. We compare views on this tweet against the account average.", red: "Avg 80 / this tweet 12,400", green: "Avg 5,000 / this tweet 8,200", feature: true },
  { n: "05", tag: "Language", title: "Tweet content", body: "Unrealistic returns, urgency, send-to-receive scams, celebrity impersonation, suspicious contract addresses.", red: "Send 1 ETH, get 2 back. Last hour!", green: "Just launched our v2 docs, feedback welcome." },
];

export function Signals() {
  return (
    <section id="signals" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeader
          kicker="02 / The five signals"
          title={<>What the AI<br /><em className="font-serif font-normal italic text-accent">actually checks.</em></>}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SIGNALS.map((s) => (
            <article
              key={s.n}
              className={
                "flex flex-col gap-5 rounded-2xl border border-line p-6 transition-colors hover:border-line-strong md:p-7 " +
                (s.feature ? "bg-gradient-to-b from-accent/[0.06] to-transparent ring-1 ring-accent/20" : "bg-bg-card")
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-mute">{s.n}</span>
                <span className={
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] " +
                  (s.feature ? "border-accent/40 text-accent" : "border-line text-ink-mute")
                }>{s.tag}</span>
              </div>

              <h3 className="font-serif text-3xl text-ink md:text-4xl">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-dim md:text-base">{s.body}</p>

              <div className="mt-auto space-y-2 border-t border-line pt-4 font-mono text-[12px] text-ink-dim">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-verdict-scam" />
                  <span>{s.red}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-verdict-legit" />
                  <span>{s.green}</span>
                </div>
              </div>
            </article>
          ))}

          <article className="flex flex-col gap-5 rounded-2xl border border-line bg-bg-card p-6 md:p-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-mute">∑</span>
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">Verdict</span>
            </div>
            <h3 className="font-serif text-3xl text-ink md:text-4xl">One score, three verdicts</h3>
            <p className="text-sm leading-relaxed text-ink-dim md:text-base">
              Each signal removes points from a starting score of 100. The final number maps to a clear verdict — and lives onchain, queryable by anyone.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-verdict-legit/40 bg-verdict-legit/10 px-3 py-1.5 font-mono text-xs text-verdict-legit">✓ LEGIT</span>
              <span className="rounded-full border border-verdict-susp/40 bg-verdict-susp/10 px-3 py-1.5 font-mono text-xs text-verdict-susp">! SUSPICIOUS</span>
              <span className="rounded-full border border-verdict-scam/40 bg-verdict-scam/10 px-3 py-1.5 font-mono text-xs text-verdict-scam">× SCAM</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
