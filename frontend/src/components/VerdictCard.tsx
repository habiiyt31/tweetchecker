"use client";

import type { AnalysisResult, SignalColor } from "@/types";

interface Props {
  result: AnalysisResult;
  cached?: boolean;
  txHash?: `0x${string}` | null;
}

const VERDICT_STYLES: Record<
  string,
  { bg: string; ring: string; label: string; emoji: string; text: string }
> = {
  LEGIT: {
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/40",
    label: "LEGIT",
    emoji: "✓",
    text: "text-emerald-400",
  },
  SUSPICIOUS: {
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/40",
    label: "SUSPICIOUS",
    emoji: "!",
    text: "text-amber-400",
  },
  SCAM: {
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/40",
    label: "SCAM",
    emoji: "✗",
    text: "text-rose-400",
  },
};

const SIGNAL_DOT: Record<SignalColor, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-rose-400",
};

// New signal labels matching the contract output
const SIGNAL_LABELS: Record<keyof AnalysisResult["signals"], string> = {
  account: "Account credibility",
  followers: "Follower quality",
  engagement: "Engagement ratios",
  history: "Historical context",
  content: "Content red flags",
};

const EXPLANATION_LABELS: Record<keyof AnalysisResult["explanation"], string> = {
  account_age: "Account age & verification",
  follower_ratio: "Followers vs following",
  engagement_ratios: "Engagement ratios (likes / RTs / replies)",
  historical_context: "How this tweet compares to history",
  content: "Tweet content analysis",
};

export function VerdictCard({ result, cached, txHash }: Props) {
  const style = VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES.SUSPICIOUS;

  return (
    <div
      className={`rounded-3xl border border-line/20 ${style.bg} ring-1 ${style.ring} p-8 backdrop-blur-sm`}
    >
      {/* HEADER --------------------------------------------------------- */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${style.bg} ${style.text} text-xl font-bold ring-1 ${style.ring}`}
            >
              {style.emoji}
            </span>
            <h3 className={`text-3xl font-bold tracking-tight ${style.text}`}>
              {style.label}
            </h3>
            {cached && (
              <span className="rounded-full border border-line/30 bg-bg/40 px-3 py-1 text-[10px] uppercase tracking-widest text-ink-mute">
                cached onchain
              </span>
            )}
          </div>
          <p className="mt-3 max-w-xl text-ink-mute">{result.summary}</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-5xl font-bold tabular-nums text-ink">
            {result.score}
            <span className="text-2xl text-ink-mute">/100</span>
          </div>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-ink-mute">
            authenticity score
          </span>
        </div>
      </div>

      {/* SIGNALS -------------------------------------------------------- */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(SIGNAL_LABELS) as Array<keyof typeof SIGNAL_LABELS>).map(
          (key) => {
            const color = result.signals?.[key] ?? "yellow";
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-xl border border-line/15 bg-bg/40 px-3 py-2"
              >
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${SIGNAL_DOT[color]}`}
                />
                <span className="text-xs text-ink-mute">
                  {SIGNAL_LABELS[key]}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* EXPLANATIONS --------------------------------------------------- */}
      <div className="mt-8 space-y-4">
        <h4 className="text-[11px] uppercase tracking-widest text-ink-mute">
          Detailed analysis
        </h4>
        {(Object.keys(EXPLANATION_LABELS) as Array<keyof typeof EXPLANATION_LABELS>).map(
          (key) => {
            const text = result.explanation?.[key];
            if (!text) return null;
            return (
              <div
                key={key}
                className="rounded-xl border border-line/15 bg-bg/40 p-4"
              >
                <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-mute">
                  {EXPLANATION_LABELS[key]}
                </p>
                <p className="text-sm leading-relaxed text-ink">{text}</p>
              </div>
            );
          },
        )}
      </div>

      {/* RED FLAGS ------------------------------------------------------ */}
      {result.red_flags && result.red_flags.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-3 text-[11px] uppercase tracking-widest text-ink-mute">
            Red flags detected
          </h4>
          <ul className="space-y-2">
            {result.red_flags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-200"
              >
                <span className="mt-0.5 text-rose-400">→</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TX FOOTER ------------------------------------------------------ */}
      {txHash && (
        <div className="mt-8 flex items-center justify-between border-t border-line/10 pt-5 text-xs text-ink-mute">
          <span className="uppercase tracking-widest">Verified onchain</span>
          <a
            href={`https://explorer-studio.genlayer.com/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono underline-offset-4 hover:underline"
          >
            {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </a>
        </div>
      )}
    </div>
  );
}