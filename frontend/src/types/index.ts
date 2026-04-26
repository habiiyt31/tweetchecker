export type Verdict = "LEGIT" | "SUSPICIOUS" | "SCAM";
export type SignalLevel = "red" | "yellow" | "green";
export type SignalKey =
  | "account_age"
  | "follower_ratio"
  | "recent_tweets"
  | "engagement_spike"
  | "content";

export interface AnalysisResult {
  verdict: Verdict;
  score: number;
  summary: string;
  explanation: Record<SignalKey, string>;
  signals: Record<SignalKey, SignalLevel>;
  red_flags: string[];
}

export interface TwitterProfile {
  userName?: string;
  name?: string;
  description?: string;
  location?: string;
  url?: string;
  followers?: number;
  following?: number;
  createdAt?: string;
  isBlueVerified?: boolean;
  isAutomated?: boolean;
  profilePicture?: string;
}

export interface TwitterTweet {
  id?: string;
  text?: string;
  createdAt?: string;
  viewCount?: number;
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  url?: string;
}

export interface TwitterApiPayload {
  profile: TwitterProfile;
  tweet: TwitterTweet;
  recent_tweets: TwitterTweet[];
}

export interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
