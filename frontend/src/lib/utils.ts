export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function shortAddr(addr?: string | null, head = 4, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, 2 + head)}…${addr.slice(-tail)}`;
}

const TWEET_RE =
  /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i;

export function parseTweetUrl(
  url: string,
): { handle: string; id: string } | null {
  const m = url.trim().match(TWEET_RE);
  if (!m) return null;
  return { handle: m[1], id: m[2] };
}

export function isValidTweetUrl(url: string): boolean {
  return parseTweetUrl(url) !== null;
}
