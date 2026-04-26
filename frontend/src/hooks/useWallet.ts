"use client";

import { useCallback, useEffect, useState } from "react";

import type { WalletState } from "@/types";

/**
 * GenLayer Studionet network info -- official from
 * https://docs.genlayer.com/developers/networks
 */
const STUDIONET_NETWORK = {
  chainId: "0xf21f", // 61999 in hex
  chainName: "GenLayer Studionet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: ["https://studio.genlayer.com/api"],
  blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // hydrate from existing connection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) return;

    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts?.[0]) {
          setState((s) => ({
            ...s,
            address: accounts[0] as `0x${string}`,
            isConnected: true,
          }));
        }
      })
      .catch(() => {});

    const onAccountsChanged = (accounts: string[]) => {
      setState((s) => ({
        ...s,
        address: (accounts[0] as `0x${string}`) ?? null,
        isConnected: !!accounts[0],
      }));
    };
    eth.on?.("accountsChanged", onAccountsChanged);
    return () => eth.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  /**
   * Add or switch to GenLayer Studionet in MetaMask.
   * Returns true if successfully on the right network.
   */
  const ensureCorrectNetwork = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const eth = (window as any).ethereum;
    if (!eth) return false;

    try {
      // First try to switch
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: STUDIONET_NETWORK.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // 4902 = network not added yet
      if (switchError?.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [STUDIONET_NETWORK],
          });
          return true;
        } catch (addError: any) {
          console.error("Failed to add Studionet network:", addError);
          setState((s) => ({
            ...s,
            error: "Could not add GenLayer Studionet to MetaMask.",
          }));
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) {
      setState((s) => ({ ...s, error: "MetaMask not detected." }));
      return;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      // 1. Request accounts
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });

      // 2. Auto-add/switch to Studionet
      await ensureCorrectNetwork();

      setState({
        address: (accounts[0] as `0x${string}`) ?? null,
        isConnected: !!accounts[0],
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err?.message ?? "Connection rejected.",
      }));
    }
  }, [ensureCorrectNetwork]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  return { ...state, connect, disconnect, ensureCorrectNetwork };
}