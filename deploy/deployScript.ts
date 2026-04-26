/**
 * deployScript.ts -- run with `genlayer deploy` after `genlayer network studionet`
 */

import { readFileSync } from "fs";
import { resolve } from "path";

import { createClient, createAccount, type GenLayerClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export default async function main(client?: GenLayerClient<any>): Promise<void> {
  const c =
    client ??
    createClient({
      chain: studionet,
      account: createAccount(),
    });

  console.log("→ Initializing consensus smart contract…");
  await c.initializeConsensusSmartContract();

  const code = readFileSync(
    resolve(__dirname, "../contracts/tweeter.py"),
    "utf-8",
  );

  console.log("→ Deploying TweetChecker to studionet…");
  const txHash = await c.deployContract({
    code,
    args: [],
    leaderOnly: false,
  });

  const receipt = await c.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.FINALIZED,
    retries: 100,
    interval: 5000,
  });

  const addr =
    (receipt as any).contract_address ?? (receipt as any).contractAddress;

  console.log("\n✓ Deployed.");
  console.log(`  contract: ${addr}`);
  console.log(`  network : studionet`);
  console.log(`\nPaste this into frontend/.env :`);
  console.log(`  NEXT_PUBLIC_CONTRACT_ADDRESS=${addr}`);
}
