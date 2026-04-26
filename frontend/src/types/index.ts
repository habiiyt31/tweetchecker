/**
 * Shared TypeScript types for TweetChecker.
 *
 * Field names match the JSON output from the Intelligent Contract.
 */

// ----- Twitter API payload (server -> contract input) -------------

export interface TwitterApiPayload {
  profile: any;
  tweet: any;
  recent_tweets: any[];
}

// ----- Contract output (verdict that comes back from chain) -------

export type Verdict = "SCAM" | "SUSPICIOUS" | "LEGIT";
export type SignalColor = "red" | "yellow" | "green";

export interface AnalysisResult {
  verdict: Verdict;
  score: number;
  summary: string;
  explanation: {
    account_age: string;
    follower_ratio: string;
    engagement_ratios: string;
    historical_context: string;
    content: string;
  };
  signals: {
    account: SignalColor;
    followers: SignalColor;
    engagement: SignalColor;
    history: SignalColor;
    content: SignalColor;
  };
  red_flags: string[];
}

// ----- Wallet state -----------------------------------------------

export interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}