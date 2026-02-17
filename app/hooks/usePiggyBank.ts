"use client";

import { useMemo } from "react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PiggyBank } from "@/anchor/idlType";
import idl from "@/anchor/idl.json";

const PROGRAM_ID = new PublicKey(idl.address);

// --- Provider & Program ---

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);
}

export function useProgram() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) return null;
    return new Program<PiggyBank>(idl as PiggyBank, provider);
  }, [provider]);
}

// --- Queries ---

export interface LockAccount {
  address: PublicKey;
  dst: PublicKey;
  exp: number; // unix timestamp
  balance: number; // lamports
}

export function useLockAccounts() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useProgram();

  return useQuery<LockAccount[]>({
    queryKey: ["lockAccounts", wallet?.publicKey?.toBase58()],
    queryFn: async () => {
      if (!wallet || !program) return [];

      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: 48 }, // 8 discriminator + 32 dst + 8 exp
          {
            memcmp: {
              offset: 8, // after Anchor discriminator
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ],
      });

      return accounts.map((acc) => {
        const decoded = program.coder.accounts.decode("lock", acc.account.data);
        return {
          address: acc.pubkey,
          dst: decoded.dst,
          exp: (decoded.exp as BN).toNumber(),
          balance: acc.account.lamports,
        };
      });
    },
    enabled: !!wallet && !!program,
    staleTime: 15_000,
  });
}

// --- Mutations ---

export function useLockSol() {
  const program = useProgram();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amountSol,
      expirationDate,
    }: {
      amountSol: number;
      expirationDate: Date;
    }) => {
      if (!program || !wallet) throw new Error("Wallet not connected");

      const lockKeypair = Keypair.generate();
      const amountLamports = new BN(Math.floor(amountSol * LAMPORTS_PER_SOL));
      const expTimestamp = new BN(Math.floor(expirationDate.getTime() / 1000));

      const tx = await program.methods
        .lock(amountLamports, expTimestamp)
        .accounts({
          payer: wallet.publicKey,
          dst: wallet.publicKey,
          lock: lockKeypair.publicKey,
        })
        .signers([lockKeypair])
        .rpc();

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockAccounts"] });
    },
  });
}

export function useUnlockSol() {
  const program = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lockAddress }: { lockAddress: PublicKey }) => {
      if (!program) throw new Error("Wallet not connected");

      const tx = await program.methods
        .unlock()
        .accounts({
          lock: lockAddress,
        })
        .rpc();

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockAccounts"] });
    },
  });
}
