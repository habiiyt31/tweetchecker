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
      "Account age, verification status, profile completeness, and the isAutomated flag.",
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
      "We compare metrics WITHIN a single tweet. A viral tweet is normal -- bot-pattern engagement is not.",
    examples: [
      "Likes > 70% of views (impossible organic)",
      "Retweets > Likes (RT bots)",
      "Replies < 0.05% (paid views)",
    ],
  },
  {
    num: "04",
    title: "Content red flags",
    description:
      "We scan tweet text for known scam patterns and impersonation attempts.",
    examples: [
      "Send X get 2X scams",
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
              Four signals,{" "}
              <span className="font-instrument italic text-ink-mute">
                ratios that matter
              </span>
            </>
          }
        />

        <p className="-mt-8 mb-16 max-w-2xl text-ink-mute md:-mt-16">
          We compare engagement ratios within a single tweet. A viral hit is not
          suspicious. Likes greater than 70% of views, or retweets greater than
          likes -- those are.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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