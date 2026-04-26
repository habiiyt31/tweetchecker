import { SectionHeader } from "@/components/SectionHeader";

interface SignalCard {
  num: string;
  title: string;
  description: string;
  examples: string[];
}

const SIGNALS: SignalCard[] = [
  {
    num: "01",
    title: "Account credibility",
    description:
      "How old is the account, is it verified, is the profile complete, is it marked as automated.",
    examples: [
      "Account < 30 days old",
      "Marked as automated bot",
      "Blank profile, no avatar",
    ],
  },
  {
    num: "02",
    title: "Follower quality",
    description:
      "Healthy accounts have followers >= following. Bots typically follow 10x more than they're followed.",
    examples: [
      "Following >> Followers (10x)",
      "Recently mass-followed pattern",
    ],
  },
  {
    num: "03",
    title: "Engagement ratios",
    description:
      "We use RATIOS, not absolute counts. A viral tweet is normal -- bot-pattern engagement isn't.",
    examples: [
      "Like rate > 10% (fake likes)",
      "Retweets > Likes (bot farms)",
      "Replies < 0.05% (paid views)",
    ],
  },
  {
    num: "04",
    title: "Historical context",
    description:
      "We compare this tweet's ratios vs the account's recent history. Higher views are fine -- wildly different ratios aren't.",
    examples: [
      "Sudden change in engagement pattern",
      "Ratios that don't match account history",
    ],
  },
  {
    num: "05",
    title: "Content red flags",
    description:
      "We scan tweet text for known scam patterns and impersonation attempts.",
    examples: [
      "'Send X get 2X' scams",
      "Unrealistic returns / urgency",
      "Impersonation of known projects",
    ],
  },
];

export function Signals() {
  return (
    <section
      id="signals"
      className="relative border-t border-line/10 px-6 py-24 sm:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Signals"
          title={
            <>
              Five signals,{" "}
              <span className="font-instrument italic text-ink-mute">
                weighted carefully
              </span>
            </>
          }
        />

        {/* Subtitle below the header (since SectionHeader doesn't have one) */}
        <p className="-mt-8 mb-16 max-w-2xl text-ink-mute md:-mt-16">
          Inspired by community feedback. We don't penalize tweets just for going
          viral. We look at the patterns that actually matter.
        </p>

        {/* SIGNAL CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNALS.map((signal) => (
            <div
              key={signal.num}
              className="group relative overflow-hidden rounded-2xl border border-line/15 bg-bg/40 p-6 backdrop-blur-sm transition hover:border-line/30"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-xs text-ink-mute">
                  {signal.num}
                </span>
                <h3 className="text-lg font-medium text-ink">{signal.title}</h3>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-ink-mute">
                {signal.description}
              </p>
              <ul className="space-y-1.5">
                {signal.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-ink-mute"
                  >
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}