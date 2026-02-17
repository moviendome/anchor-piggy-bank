"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { WalletError, Adapter } from "@solana/wallet-adapter-base";
import { Buffer } from "buffer";

import "@solana/wallet-adapter-react-ui/styles.css";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Wallet Standard wallets (Phantom, Solflare, etc.) are auto-detected
  const wallets = useMemo(() => [], [network]);

  const onError = useCallback((error: WalletError, adapter?: Adapter) => {
    console.error("Wallet error:", error, adapter);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
