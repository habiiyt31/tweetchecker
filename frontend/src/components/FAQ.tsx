"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { SectionHeader } from "./SectionHeader";

const FAQ_ITEMS = [
  {
    q: "What is TweetChecker?",
    a: "TweetChecker is an onchain Twitter/X authenticity checker. You paste a tweet link, and an Intelligent Contract on GenLayer asks multiple AI validators to independently judge whether the post is legitimate, suspicious, or a scam. The verdict is recorded onchain and can be read by anyone — no central server.",
  },
  {
    q: "Why is this onchain at all?",
    a: "Because the verdict needs to be auditable and tamper-proof. A centralized service can quietly flip a flag, hide a result, or rate-limit the truth. With GenLayer, the prompt, the input data, the validators that ran it, and the final verdict all live on a public ledger.",
  },
  {
    q: "How is the verdict generated?",
    a: "A server-side API route fetches profile, tweet, and the last 20 posts from twitterapi.io. That payload is passed to the Intelligent Contract, which runs an LLM evaluation across multiple validators. GenLayer's Optimistic Democracy reconciles any disagreement before finalizing the result.",
  },
  {
    q: "Which network does it run on?",
    a: "GenLayer Studio Network (studionet). The same contract code can be deployed unchanged to localnet for development or testnet-asimov for pre-production testing.",
  },
  {
    q: "Do I need a wallet?",
    a: "Reading any existing verdict is free and requires no wallet — the contract returns the cached result instantly. You only need to connect MetaMask when you want to submit a brand new analysis, because that triggers a write transaction on GenLayer.",
  },
  {
    q: "Is my Twitter API key exposed?",
    a: "No. The key lives in the server-side environment variable TWITTER_API_KEY and is only read inside the Next.js API route. The browser only sees the cleaned-up JSON payload, never the key itself.",
  },
  {
    q: "Can the analysis be wrong?",
    a: "Yes — like any AI system, it can make mistakes. The signals it checks are strong heuristics, not proof. Treat the verdict as a starting point. The score, the per-signal breakdown, and the listed red flags are all visible so you can judge for yourself.",
  },
  {
    q: "What happens if a tweet was already analyzed?",
    a: "The contract returns the cached verdict instantly via get_result(url). No second LLM run, no new transaction, no twitterapi.io call. This makes lookups effectively free after the first analysis.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeader
          kicker="04 / FAQ"
          title={
            <>
              Questions,
              <br />
              <em className="font-serif font-normal italic text-accent">
                answered.
              </em>
            </>
          }
        />

        <div className="mx-auto max-w-[860px]">
          <ul className="border-t border-line">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={i} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors md:py-8"
                  >
                    <span className="flex items-start gap-5">
                      <span className="hidden font-mono text-xs text-ink-mute md:inline">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-2xl text-ink md:text-3xl lg:text-4xl">
                        {item.q}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform",
                        isOpen && "rotate-45 border-accent text-accent",
                      )}
                      aria-hidden
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                      isOpen
                        ? "grid-rows-[1fr] pb-6 md:pb-8"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="min-h-0">
                      <p className="max-w-[68ch] pl-0 text-base leading-relaxed text-ink-dim md:pl-12 md:text-lg">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}