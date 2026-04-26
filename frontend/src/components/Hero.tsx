"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 12847, label: "Tweets analyzed" },
  { value: 2391, label: "Scams flagged" },
  { value: 5, label: "AI validators" },
  { value: 3, label: "Avg verdict time", suffix: "s" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-28 md:pt-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-lines" />
      </div>

      <div className="container-x relative">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-bg-card/60 py-1.5 pl-2 pr-4 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-verdict-legit/60" />
            <span className="relative h-2 w-2 rounded-full bg-verdict-legit" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
            Live on GenLayer Studio Network
          </span>
        </div>

        <h1 className="mt-8 max-w-[14ch] font-sans font-bold tracking-tightest text-ink text-[clamp(3rem,9.2vw,8.5rem)] leading-[0.92]">
          Catch the scam<br />
          <em className="font-serif font-normal italic text-accent">before</em>{" "}
          it&nbsp;catches you.
        </h1>

        <p className="mt-7 max-w-[58ch] text-base leading-relaxed text-ink-dim md:text-lg">
          Drop any Twitter/X link. In seconds, multiple AI validators reach
          consensus on whether the post is authentic, suspicious, or a scam —
          and the verdict is recorded onchain forever.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#demo" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-medium text-bg transition-transform hover:scale-[1.02] active:scale-95">
            Analyze a tweet <span aria-hidden>→</span>
          </a>
          <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-base text-ink transition-colors hover:border-line-strong">
            How it works
          </a>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-y-8 border-t border-line pt-10 md:mt-28 md:grid-cols-4 md:gap-x-10">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1400;
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setN(Math.round(value * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref}>
      <div className="font-serif text-4xl text-ink md:text-5xl">
        {n.toLocaleString()}
        {suffix ? <span className="text-3xl text-ink-mute">{suffix}</span> : null}
      </div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </div>
    </div>
  );
}
