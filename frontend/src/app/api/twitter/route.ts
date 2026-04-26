/**
 * /api/twitter -- server-side proxy to twitterapi.io.
 *
 * IMPORTANT: twitterapi.io free tier allows only 1 request per 5 seconds.
 * We therefore call the 3 endpoints SEQUENTIALLY with a delay between them,
 * not in parallel. Total time: ~10-12s for a fresh fetch.
 */

import { NextResponse } from "next/server";

import { parseTweetUrl } from "@/lib/utils";
import type { TwitterApiPayload } from "@/types";

const API_BASE = "https://api.twitterapi.io";

// Free tier: 1 req / 5s. We use 5500ms to add a small safety margin.
const RATE_LIMIT_DELAY_MS = 5500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Single fetch helper with retry on 429                              */
/* ------------------------------------------------------------------ */

async function fetchWithRetry(
  url: string,
  apiKey: string,
  label: string,
  maxRetries = 3,
): Promise<{ ok: boolean; status: number; data: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 200) };
    }

    if (res.status === 429 && attempt < maxRetries) {
      console.log(
        `[/api/twitter] ${label} hit 429 (attempt ${attempt}/${maxRetries}), waiting ${RATE_LIMIT_DELAY_MS}ms…`,
      );
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    return { ok: res.ok, status: res.status, data };
  }

  return { ok: false, status: 429, data: { error: "Too Many Requests" } };
}

/* ------------------------------------------------------------------ */
/* Route handler                                                      */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  let body: { tweetUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!body.tweetUrl) {
    return NextResponse.json({ error: "tweetUrl required" }, { status: 400 });
  }

  const parsed = parseTweetUrl(body.tweetUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "URL must look like https://x.com/<user>/status/<id>" },
      { status: 400 },
    );
  }

  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey) {
    console.error("[/api/twitter] TWITTER_API_KEY is missing in env");
    return NextResponse.json(
      { error: "TWITTER_API_KEY is not configured on the server" },
      { status: 500 },
    );
  }

  console.log("[/api/twitter] Fetching:", { handle: parsed.handle, id: parsed.id });

  try {
    // ----------------------------------------------------------------
    // SEQUENTIAL fetch -- free-tier is 1 req / 5 seconds
    // ----------------------------------------------------------------
    const profileUrl = `${API_BASE}/twitter/user/info?userName=${encodeURIComponent(parsed.handle)}`;
    const tweetUrl = `${API_BASE}/twitter/tweets?tweet_ids=${encodeURIComponent(parsed.id)}`;
    const recentUrl = `${API_BASE}/twitter/user/last_tweets?userName=${encodeURIComponent(parsed.handle)}&count=20`;

    console.log("[/api/twitter] Step 1/3 — fetching profile…");
    const profile = await fetchWithRetry(profileUrl, apiKey, "profile");

    if (profile.ok) {
      console.log("[/api/twitter] waiting 5.5s for rate limit…");
      await sleep(RATE_LIMIT_DELAY_MS);
    }

    console.log("[/api/twitter] Step 2/3 — fetching tweet…");
    const tweet = await fetchWithRetry(tweetUrl, apiKey, "tweet");

    if (tweet.ok) {
      console.log("[/api/twitter] waiting 5.5s for rate limit…");
      await sleep(RATE_LIMIT_DELAY_MS);
    }

    console.log("[/api/twitter] Step 3/3 — fetching recent tweets…");
    const recent = await fetchWithRetry(recentUrl, apiKey, "recent");

    // ----------------------------------------------------------------
    // Check for failures
    // ----------------------------------------------------------------
    if (!profile.ok || !tweet.ok || !recent.ok) {
      console.error("[/api/twitter] Some calls failed:", {
        profile: { status: profile.status, body: profile.data },
        tweet: { status: tweet.status, body: tweet.data },
        recent: { status: recent.status, body: recent.data },
      });
      return NextResponse.json(
        {
          error: "twitterapi.io upstream error",
          detail: {
            profile: profile.data?.message ?? profile.data?.error ?? `HTTP ${profile.status}`,
            tweet: tweet.data?.message ?? tweet.data?.error ?? `HTTP ${tweet.status}`,
            recent: recent.data?.message ?? recent.data?.error ?? `HTTP ${recent.status}`,
          },
        },
        { status: 502 },
      );
    }

    // ----------------------------------------------------------------
    // Normalize response shapes
    // ----------------------------------------------------------------
    const profileData =
      profile.data?.data ??
      profile.data?.user ??
      profile.data;

    const tweetsList: any[] =
      tweet.data?.tweets ??
      tweet.data?.data ??
      (Array.isArray(tweet.data) ? tweet.data : []);
    const tweetData = tweetsList[0] ?? tweet.data?.tweet ?? {};

    const recentList: any[] =
      recent.data?.tweets ??
      recent.data?.data?.tweets ??
      recent.data?.data ??
      (Array.isArray(recent.data) ? recent.data : []);

    const payload: TwitterApiPayload = {
      profile: profileData,
      tweet: tweetData,
      recent_tweets: Array.isArray(recentList) ? recentList : [],
    };

    console.log("[/api/twitter] Success:", {
      handle: parsed.handle,
      hasProfile: !!profileData?.userName,
      hasTweet: !!tweetData?.id,
      recentCount: payload.recent_tweets.length,
    });

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("[/api/twitter] Exception:", err);
    return NextResponse.json(
      { error: err?.message ?? "twitterapi.io fetch failed" },
      { status: 502 },
    );
  }
}