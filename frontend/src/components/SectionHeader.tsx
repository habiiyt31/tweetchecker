import { cn } from "@/lib/utils";

interface Props {
  kicker: string;
  title: React.ReactNode;
  className?: string;
}

export function SectionHeader({ kicker, title, className }: Props) {
  return (
    <div className={cn("mb-12 md:mb-20", className)}>
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
        [ {kicker} ]
      </div>
      <h2 className="mt-4 font-sans font-bold tracking-tightest text-ink text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.95]">
        {title}
      </h2>
    </div>
  );
}
