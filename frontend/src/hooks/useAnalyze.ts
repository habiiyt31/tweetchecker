"use client";

import { useCallback, useState } from "react";

import {
  CONTRACT_ADDRESS,
  getReadClient,
  readVerdict,
  submitAnalysis,
  waitForVerdict,
} from "@/lib/genlayer";
import { isValidTweetUrl } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

export type AnalyzeStage =
  | "idle"
  | "fetching"
  | "submitting"
  | "consensus"
  | "done"
  | "error";

interface AnalyzeState {
  stage: AnalyzeStage;
  result: AnalysisResult | null;
  txHash: `0x${string}` | null;
  error: string | null;
  cached: boolean;
  rawOutput: string | null; // for debug when JSON parsing fails
}

const initial: AnalyzeState = {
  stage: "idle",
  result: null,
  txHash: null,
  error: null,
  cached: false,
  rawOutput: null,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll the contract for the verdict, retrying on null/parse-failure.
 * Studionet sometimes needs a few seconds after FINALIZED before state
 * is queryable, so we retry with backoff.
 */
async function pollVerdict(
  tweetUrl: string,
  maxAttempts = 6,
): Promise<{ result: AnalysisResult | null; raw: string | null }> {
  const client = getReadClient();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = (await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_result",
        args: [tweetUrl],
      })) as string;

      if (raw && raw !== "Not analyzed yet") {
        // Try to parse — sometimes LLMs add extra text around JSON
        try {
          // Strip common wrappers
          let cleaned = raw.trim();
          // Remove ```json fences if present
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
          cleaned = cleaned.replace(/\s*```$/i, "");
          // Find the first { and last } in case there's extra text
          const firstBrace = cleaned.indexOf("{");
          const lastBrace = cleaned.lastIndexOf("}");
          if (firstBrace >= 0 && lastBrace > firstBrace) {
            cleaned = cleaned.slice(firstBrace, lastBrace + 1);
          }
          const parsed = JSON.parse(cleaned) as AnalysisResult;
          return { result: parsed, raw };
        } catch (parseErr) {
          console.error("[verdict] JSON parse failed:", parseErr);
          console.log("[verdict] raw output:", raw);
          // Return raw so the UI can show it
          return { result: null, raw };
        }
      }

      console.log(`[verdict] attempt ${attempt}/${maxAttempts} — empty, waiting…`);
    } catch (err) {
      console.warn(`[verdict] attempt ${attempt}/${maxAttempts} error:`, err);
    }

    if (attempt < maxAttempts) {
      // Exponential backoff: 2s, 3s, 5s, 8s, 13s
      const wait = Math.min(2000 * Math.pow(1.6, attempt - 1), 15000);
      await sleep(wait);
    }
  }

  return { result: null, raw: null };
}

export function useAnalyze() {
  const [state, setState] = useState<AnalyzeState>(initial);

  const reset = useCallback(() => setState(initial), []);

  const analyze = useCallback(
    async (tweetUrl: string, address: `0x${string}` | null) => {
      if (!isValidTweetUrl(tweetUrl)) {
        setState({
          ...initial,
          stage: "error",
          error: "Please paste a valid Twitter/X status URL.",
        });
        return;
      }

      // 1 — try cached verdict first (free, no wallet needed)
      try {
        const cached = await readVerdict(tweetUrl);
        if (cached) {
          setState({
            stage: "done",
            result: cached,
            txHash: null,
            error: null,
            cached: true,
            rawOutput: null,
          });
          return;
        }
      } catch {
        /* fall through */
      }

      // 2 — need wallet for fresh analysis
      if (!address) {
        setState({
          ...initial,
          stage: "error",
          error: "Connect your wallet to submit a new analysis.",
        });
        return;
      }

      try {
        // 3 — fetch from twitterapi.io via server route
        setState({ ...initial, stage: "fetching" });
        const apiData = await fetchTwitterPayload(tweetUrl);

        // 4 — submit transaction
        setState((s) => ({ ...s, stage: "submitting" }));
        const txHash = await submitAnalysis(address, tweetUrl, apiData);
        console.log("[analyze] tx submitted:", txHash);

        // 5 — wait for consensus
        setState((s) => ({ ...s, stage: "consensus", txHash }));
        await waitForVerdict(txHash, address);
        console.log("[analyze] tx finalized");

        // 6 — give state a moment to commit, then poll
        await sleep(2000);
        const { result, raw } = await pollVerdict(tweetUrl);

        if (!result) {
          // Show the raw output if we have it -- helps debug LLM JSON issues
          setState({
            ...initial,
            stage: "error",
            txHash,
            rawOutput: raw,
            error: raw
              ? "The contract returned a verdict, but it wasn't valid JSON. See raw output below."
              : "Verdict not found after finalization. Try refreshing — the state may still be propagating.",
          });
          return;
        }

        setState({
          stage: "done",
          result,
          txHash,
          error: null,
          cached: false,
          rawOutput: null,
        });
      } catch (err: any) {
        console.error("[analyze] error:", err);
        setState({
          ...initial,
          stage: "error",
          error: err?.message ?? "Something went wrong.",
        });
      }
    },
    [],
  );

  return { ...state, analyze, reset };
}

async function fetchTwitterPayload(tweetUrl: string): Promise<string> {
  const res = await fetch("/api/twitter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tweetUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `MCP fetch failed (${res.status})`);
  }
  const data = await res.json();
  return JSON.stringify(data);
}