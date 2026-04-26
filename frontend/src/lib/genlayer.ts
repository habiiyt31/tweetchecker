/**
 * GenLayer client wrapper.
 *
 * Uses genlayer-js v1.1.7+ API:
 *   - Two-client pattern: read client (no wallet) + write client (with provider)
 *   - provider: window.ethereum for MetaMask signing
 *   - client.connect() to auto-switch MetaMask to the right network
 */

import { createClient, type GenLayerClient } from "genlayer-js";
import {
  studionet,
  localnet,
  testnetAsimov,
} from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

import type { AnalysisResult } from "@/types";

const CHAIN_NAME = (process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet") as
  | "studionet"
  | "localnet"
  | "testnetAsimov";

const CHAIN_MAP = { studionet, localnet, testnetAsimov } as const;
export const chain = CHAIN_MAP[CHAIN_NAME] ?? studionet;
export const CHAIN_KEY = CHAIN_NAME;

export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  ("0x0000000000000000000000000000000000000000" as const);

export const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL;

/* ------------------------------------------------------------------ */
/* Read client — no wallet needed                                     */
/* ------------------------------------------------------------------ */

let _readClient: GenLayerClient<any> | null = null;

export function getReadClient(): GenLayerClient<any> {
  if (_readClient) return _readClient;
  _readClient = createClient({
    chain,
    endpoint: RPC_URL,
  });
  return _readClient;
}

/* ------------------------------------------------------------------ */
/* Write client — bound to MetaMask via window.ethereum               */
/* ------------------------------------------------------------------ */

export function getWriteClient(address: `0x${string}`): GenLayerClient<any> {
  const provider =
    typeof window !== "undefined" ? (window as any).ethereum : undefined;

  return createClient({
    chain,
    endpoint: RPC_URL,
    account: address,
    provider, // genlayer-js routes signing through this provider (MetaMask)
  });
}

/* ------------------------------------------------------------------ */
/* Read helpers                                                       */
/* ------------------------------------------------------------------ */

export async function readVerdict(
  tweetUrl: string,
): Promise<AnalysisResult | null> {
  const client = getReadClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_result",
    args: [tweetUrl],
  })) as string;

  if (!raw || raw === "Not analyzed yet") return null;
  try {
    return JSON.parse(raw) as AnalysisResult;
  } catch {
    return null;
  }
}

export async function readAllVerdicts(): Promise<Record<string, AnalysisResult>> {
  const client = getReadClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_all_results",
    args: [],
  })) as Record<string, string>;

  const out: Record<string, AnalysisResult> = {};
  for (const [url, value] of Object.entries(raw ?? {})) {
    try {
      out[url] = JSON.parse(value) as AnalysisResult;
    } catch {
      /* skip */
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Write — submit a new analysis                                      */
/* ------------------------------------------------------------------ */

export async function submitAnalysis(
  address: `0x${string}`,
  tweetUrl: string,
  apiData: string,
): Promise<`0x${string}`> {
  const client = getWriteClient(address);

  // Make sure the wallet is on the correct GenLayer chain.
  // This will prompt the user to add or switch to it if needed.
  try {
    await client.connect(CHAIN_KEY);
  } catch (err) {
    console.warn("client.connect() failed (continuing anyway):", err);
  }

  // Initialize consensus before write -- per docs.
  await client.initializeConsensusSmartContract();

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "analyze",
    args: [tweetUrl, apiData],
    value: 0n,
  });

  return txHash as `0x${string}`;
}

export async function waitForVerdict(
  txHash: `0x${string}`,
  address: `0x${string}`,
) {
  const client = getWriteClient(address);
  return client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.FINALIZED,
    retries: 100,
    interval: 5000,
  });
}
