"use client";

import { useState } from "react";

import { useAnalyze, type AnalyzeStage } from "@/hooks/useAnalyze";
import { useWallet } from "@/hooks/useWallet";
import { CONTRACT_ADDRESS } from "@/lib/genlayer";
import { cn, isValidTweetUrl, shortAddr } from "@/lib/utils";

import { SectionHeader } from "./SectionHeader";
import { VerdictCard } from "./VerdictCard";

export function Demo() {
  const [url, setUrl] = useState("");
  const wallet = useWallet();
  const { stage, result, txHash, error, cached, analyze, reset } = useAnalyze();

  const isBusy =
    stage === "fetching" || stage === "submitting" || stage === "consensus";
  const isShowing = stage === "done" && result;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void analyze(url, wallet.address);
  };

  return (
    <section id="demo" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeader
          kicker="03 / Try it"
          title={
            <>
              Paste a link.
              <br />
              <em className="font-serif font-normal italic text-accent">
                Get a verdict.
              </em>
            </>
          }
        />

        <div className="overflow-hidden rounded-2xl border border-line bg-bg-card">
          {/* terminal bar */}
          <div className="flex items-center justify-between gap-4 border-b border-line bg-bg-soft px-4 py-3 md:px-5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-scam/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-susp/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-legit/60" />
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-ink-mute">
              <span className="hidden sm:inline">contract:</span>
              <span className="text-ink">
                {shortAddr(CONTRACT_ADDRESS, 6, 4)}
              </span>
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-accent">
                studionet
              </span>
            </div>
          </div>

          {/* body */}
          <div className="relative p-5 md:p-8">
            <form onSubmit={onSubmit} autoComplete="off">
              <label htmlFor="tweetUrl" className="visually-hidden">Tweet URL</label>

              <div className="flex flex-col gap-2 rounded-xl border border-line bg-bg-soft p-2 transition-colors focus-within:border-line-strong sm:flex-row sm:items-center sm:gap-0 sm:p-0">
                <div className="flex flex-1 items-center gap-3 px-3 sm:py-3">
                  <span className="text-ink-mute" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
                    </svg>
                  </span>
                  <input
                    id="tweetUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://x.com/username/status/1234567890"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isBusy}
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-ink-ghost focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBusy || !url.trim()}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-bg transition-transform hover:scale-[1.02] active:scale-95",
                    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
                    "sm:m-1.5",
                  )}
                >
                  {isBusy ? "Analyzing…" : "Analyze"}
                  <span aria-hidden>→</span>
                </button>
              </div>

              {/* hints */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                  Wallet:
                </span>
                <span className={cn(
                  "rounded-full border px-3 py-1 font-mono",
                  wallet.isConnected
                    ? "border-verdict-legit/40 text-verdict-legit"
                    : "border-line text-ink-mute",
                )}>
                  {wallet.isConnected ? shortAddr(wallet.address) : "not connected"}
                </span>

                {!wallet.isConnected && (
                  <button
                    type="button"
                    onClick={wallet.connect}
                    className="rounded-full border border-accent/40 px-3 py-1 font-mono text-accent hover:bg-accent/10"
                  >
                    connect →
                  </button>
                )}
              </div>

              {url && !isValidTweetUrl(url) && (
                <p className="mt-3 font-mono text-xs text-verdict-susp">
                  ↳ that doesn&apos;t look like a Twitter/X status URL.
                </p>
              )}

              {error && (
                <p className="mt-3 font-mono text-xs text-verdict-scam">
                  ↳ {error}
                </p>
              )}
            </form>

            <div className="my-7 border-t border-line" />

            {!isBusy && !isShowing && <EmptyState />}
            {isBusy && <PipelineState stage={stage} />}
            {isShowing && result && (
              <div className="space-y-5">
                <VerdictCard
                  result={result}
                  txHash={txHash}
                  cached={cached}
                />
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setUrl("");
                  }}
                  className="font-mono text-xs text-ink-mute underline-offset-4 hover:text-ink hover:underline"
                >
                  ← analyze another tweet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* helper note */}
        <p className="mt-4 font-mono text-[11px] text-ink-mute">
          Reading a cached verdict is free and instant. New analyses require
          MetaMask to sign a single transaction on the Studio Network.
        </p>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center md:py-14">
      <svg viewBox="0 0 200 120" className="h-20 w-32 text-ink-ghost md:h-28 md:w-44" fill="none">
        <rect x="20" y="20" width="160" height="80" rx="12" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="48" y1="50" x2="152" y2="50" stroke="currentColor" strokeWidth="1" />
        <line x1="48" y1="64" x2="120" y2="64" stroke="currentColor" strokeWidth="1" />
        <line x1="48" y1="78" x2="138" y2="78" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="48" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
      <p className="max-w-[40ch] text-sm text-ink-dim">
        Paste a Twitter/X link above. Reading a cached result is free; submitting a fresh analysis requires a wallet signature.
      </p>
    </div>
  );
}

function PipelineState({ stage }: { stage: AnalyzeStage }) {
  const steps: { key: AnalyzeStage; label: string; sub: string }[] = [
    {
      key: "fetching",
      label: "Fetching from twitterapi.io",
      sub: "/api/twitter → profile + tweet + last 20 posts",
    },
    {
      key: "submitting",
      label: "Submitting to GenLayer",
      sub: "client.writeContract({ functionName: 'analyze' })",
    },
    {
      key: "consensus",
      label: "Validators reaching consensus",
      sub: "Optimistic Democracy across the validator set",
    },
  ];
  const current = steps.findIndex((s) => s.key === stage);

  return (
    <div className="space-y-2 py-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.key} className={cn(
            "flex items-start gap-4 rounded-xl border border-line bg-bg-soft p-4 transition-opacity",
            !done && !active && "opacity-40",
          )}>
            <div className={cn(
              "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
              done && "border-verdict-legit bg-verdict-legit/10 text-verdict-legit",
              active && "border-accent bg-accent/10 text-accent",
              !done && !active && "border-line text-ink-mute",
            )}>
              {done ? "✓" : active ? <span className="animate-pulse-dot">●</span> : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-ink">{s.label}</div>
              <div className="font-mono text-[11px] text-ink-mute">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
