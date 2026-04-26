"use client";

import { cn } from "@/lib/utils";
import type {
  AnalysisResult,
  SignalKey,
  SignalLevel,
  Verdict,
} from "@/types";

interface Props {
  result: AnalysisResult;
  txHash?: `0x${string}` | null;
  cached?: boolean;
}

const VERDICT_STYLES: Record<
  Verdict,
  { label: string; ring: string; bg: string; text: string }
> = {
  LEGIT: {
    label: "✓ LEGIT",
    ring: "ring-verdict-legit/40",
    bg: "bg-verdict-legit/10",
    text: "text-verdict-legit",
  },
  SUSPICIOUS: {
    label: "! SUSPICIOUS",
    ring: "ring-verdict-susp/40",
    bg: "bg-verdict-susp/10",
    text: "text-verdict-susp",
  },
  SCAM: {
    label: "× SCAM",
    ring: "ring-verdict-scam/40",
    bg: "bg-verdict-scam/10",
    text: "text-verdict-scam",
  },
};

const LEVEL_DOT: Record<SignalLevel, string> = {
  green: "bg-verdict-legit",
  yellow: "bg-verdict-susp",
  red: "bg-verdict-scam",
};

const SIGNAL_LABELS: Record<SignalKey, string> = {
  account_age: "Account age",
  follower_ratio: "Follower ratio",
  recent_tweets: "Recent tweets",
  engagement_spike: "Engagement spike",
  content: "Tweet content",
};

const SIGNAL_ORDER: SignalKey[] = [
  "account_age",
  "follower_ratio",
  "recent_tweets",
  "engagement_spike",
  "content",
];

export function VerdictCard({ result, txHash, cached }: Props) {
  const v = VERDICT_STYLES[result.verdict];

  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid gap-5 rounded-2xl border border-line bg-bg-card p-5 md:grid-cols-[auto_1fr] md:items-center md:gap-8 md:p-7">
        <div className={cn("inline-flex items-center justify-center rounded-2xl px-5 py-3 ring-1", v.bg, v.ring)}>
          <span className={cn("font-mono text-sm font-semibold", v.text)}>
            {v.label}
          </span>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-baseline gap-3">
            <span className="font-serif text-5xl text-ink md:text-6xl">{result.score}</span>
            <span className="font-mono text-xs text-ink-mute">/ 100</span>
            {cached && (
              <span className="ml-auto rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                cached onchain
              </span>
            )}
          </div>
          <div className="score-track">
            <div className="score-fill" style={{ width: `${result.score}%` }} />
            <div className="score-thumb" style={{ left: `${result.score}%` }} />
          </div>
          <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-ink-dim md:text-base">
            {result.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SIGNAL_ORDER.map((key) => (
          <div key={key} className="rounded-xl border border-line bg-bg-card p-4 md:p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", LEVEL_DOT[result.signals[key]])} />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                  {SIGNAL_LABELS[key]}
                </span>
              </div>
              <span className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                result.signals[key] === "green" && "text-verdict-legit",
                result.signals[key] === "yellow" && "text-verdict-susp",
                result.signals[key] === "red" && "text-verdict-scam",
              )}>
                {result.signals[key]}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink">
              {result.explanation[key]}
            </p>
          </div>
        ))}
      </div>

      {result.red_flags?.length > 0 && (
        <div className="rounded-xl border border-verdict-scam/30 bg-verdict-scam/5 p-5">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-verdict-scam">
            Red flags ({result.red_flags.length})
          </div>
          <ul className="space-y-2">
            {result.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-verdict-scam" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {txHash && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-bg-soft px-4 py-3 font-mono text-xs text-ink-mute">
          <span>
            <span className="text-ink-ghost">tx:</span>{" "}
            <span className="text-ink">{txHash.slice(0, 22)}…</span>
          </span>
          <span className="rounded-full border border-line px-2 py-0.5">
            studionet · finalized
          </span>
        </div>
      )}
    </div>
  );
}
