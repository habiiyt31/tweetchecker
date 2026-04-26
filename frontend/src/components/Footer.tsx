import { CONTRACT_ADDRESS } from "@/lib/genlayer";
import { shortAddr } from "@/lib/utils";

export function Footer() {

  return (
    <footer className="relative mt-12 border-t border-line">
      <div className="container-x py-16 md:py-20">
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 md:flex-row md:items-center">
          <span className="font-mono text-xs text-ink-mute">
            © {new Date().getFullYear()} TweetChecker · MIT License
          </span>
        </div>
      </div>
    </footer>
  );
}
