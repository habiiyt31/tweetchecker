"use client";

import Link from "next/link";
import { useState } from "react";

import { useWallet } from "@/hooks/useWallet";
import { cn, shortAddr } from "@/lib/utils";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#signals", label: "Signals" },
  { href: "#demo", label: "Demo" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { address, isConnected, isConnecting, connect, disconnect } =
    useWallet();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/55 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between md:h-[72px]">
          <Link
            href="#top"
            className="flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-tight"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0a0a0c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
            <span className="text-ink">TweetChecker</span>
          </Link>

          <nav className="hidden gap-7 lg:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-dim transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <WalletButton
              address={address}
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connect}
              onDisconnect={disconnect}
            />
            <a href="#demo" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.02] active:scale-95">
              Launch app <span aria-hidden>→</span>
            </a>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 top-0 h-0.5 w-full bg-ink transition-transform", open && "translate-y-1.5 rotate-45")} />
              <span className={cn("absolute bottom-0 left-0 h-0.5 w-full bg-ink transition-transform", open && "-translate-y-1 -rotate-45")} />
            </span>
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top transition-all lg:hidden",
          "border-b border-line bg-bg/95 backdrop-blur-xl",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="container-x flex flex-col gap-4 py-6">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-2xl font-medium text-ink" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <WalletButton
              address={address}
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connect}
              onDisconnect={disconnect}
              full
            />
            <a href="#demo" onClick={() => setOpen(false)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-3 text-sm font-medium text-bg">
              Launch app →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function WalletButton({
  address, isConnected, isConnecting, onConnect, onDisconnect, full,
}: {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={isConnected ? onDisconnect : onConnect}
      disabled={isConnecting}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-line-strong",
        full && "w-full justify-center py-3",
      )}
    >
      <span className={cn("inline-block h-2 w-2 rounded-full", isConnected ? "bg-verdict-legit" : "bg-ink-mute", isConnected && "animate-pulse-dot")} />
      <span className="font-mono text-xs">
        {isConnecting ? "Connecting…" : isConnected ? shortAddr(address) : "Connect wallet"}
      </span>
    </button>
  );
}
