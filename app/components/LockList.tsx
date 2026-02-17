"use client";

import { useLockAccounts, useUnlockSol, type LockAccount } from "@/hooks/usePiggyBank";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

function truncateAddress(address: PublicKey): string {
  const str = address.toBase58();
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

function formatExpiration(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

function isExpired(timestamp: number): boolean {
  return Date.now() / 1000 >= timestamp;
}

function LockCard({ lock }: { lock: LockAccount }) {
  const { mutate: unlockSol, isPending, error, isSuccess, data: txSig, reset } = useUnlockSol();
  const [showSuccess, setShowSuccess] = useState(false);

  const expired = isExpired(lock.exp);
  const solAmount = (lock.balance / LAMPORTS_PER_SOL).toFixed(4);

  const handleUnlock = () => {
    reset();
    unlockSol(
      { lockAddress: lock.address },
      {
        onSuccess: () => setShowSuccess(true),
      }
    );
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
        expired
          ? "border-accent/50 bg-bg-secondary"
          : "border-border bg-bg-secondary"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-text-muted">
              {truncateAddress(lock.address)}
            </span>
            <a
              href={`https://explorer.solana.com/address/${lock.address.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent underline transition-colors duration-200 hover:text-accent-dim"
            >
              explorer
            </a>
          </div>
          <p className="font-mono text-lg font-semibold text-text">
            {solAmount} SOL
          </p>
          <p className="text-sm text-text-secondary">
            {expired ? "expired" : "unlocks"}: {formatExpiration(lock.exp)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded border px-2 py-0.5 font-mono text-xs font-medium ${
              expired
                ? "border-accent bg-success-bg text-accent"
                : "border-border bg-bg-tertiary text-text-muted"
            }`}
          >
            {expired ? "expired" : "active"}
          </span>

          {expired && (
            <button
              onClick={handleUnlock}
              disabled={isPending}
              className="cursor-pointer rounded bg-accent px-3 py-1.5 font-mono text-sm font-semibold text-bg transition-all duration-200 hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "unlocking..." : "> unlock()"}
            </button>
          )}
        </div>
      </div>

      {showSuccess && txSig && (
        <div className="mt-3 rounded border border-accent bg-success-bg p-2 text-sm text-accent">
          Unlocked!{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-dim"
          >
            View transaction
          </a>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded border border-danger bg-danger-bg p-2 text-sm text-danger">
          {error.message}
        </div>
      )}
    </div>
  );
}

export default function LockList() {
  const { data: locks, isLoading, error, refetch } = useLockAccounts();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-lg font-semibold text-accent">
          # your_locks
        </h2>
        <button
          onClick={() => refetch()}
          className="cursor-pointer rounded border border-border bg-bg-tertiary px-3 py-1.5 font-mono text-sm text-text-secondary transition-all duration-200 hover:border-accent hover:text-accent"
        >
          refresh
        </button>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center font-mono text-text-muted">
          Loading locks...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger bg-danger-bg p-4 text-sm text-danger">
          {error.message}
        </div>
      )}

      {locks && locks.length === 0 && (
        <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center font-mono text-text-muted">
          No locks found. Lock some SOL to get started!
        </div>
      )}

      {locks && locks.length > 0 && (
        <div className="space-y-3">
          {locks.map((lock) => (
            <LockCard key={lock.address.toBase58()} lock={lock} />
          ))}
        </div>
      )}
    </div>
  );
}
