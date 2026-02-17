"use client";

import { useState } from "react";
import { useLockSol } from "@/hooks/usePiggyBank";

const AMOUNT_OPTIONS = [0.1, 0.2, 0.3];
const DURATION_OPTIONS = [
  { label: "2 min", minutes: 2 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
];

export default function LockForm() {
  const [amount, setAmount] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const { mutate: lockSol, isPending, isSuccess, data: txSig, error, reset } = useLockSol();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!amount || !duration) return;

    const expirationDate = new Date(Date.now() + duration * 60 * 1000);

    lockSol(
      { amountSol: amount, expirationDate },
      {
        onSuccess: () => {
          setAmount(null);
          setDuration(null);
        },
      }
    );
  };

  return (
    <div className="rounded-lg border border-accent/30 bg-bg-secondary p-6 transition-all duration-300">
      <h2 className="mb-4 font-mono text-lg font-semibold text-accent">
        # lock_sol
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            amount (SOL)
          </label>
          <div className="flex gap-2">
            {AMOUNT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAmount(opt)}
                className={`flex-1 cursor-pointer rounded border px-3 py-2 font-mono text-sm font-medium transition-all duration-200 ${
                  amount === opt
                    ? "border-accent bg-accent text-bg"
                    : "border-border bg-bg-tertiary text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {opt} SOL
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            unlock_after
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                onClick={() => setDuration(opt.minutes)}
                className={`flex-1 cursor-pointer rounded border px-3 py-2 font-mono text-sm font-medium transition-all duration-200 ${
                  duration === opt.minutes
                    ? "border-accent bg-accent text-bg"
                    : "border-border bg-bg-tertiary text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !amount || !duration}
          className="w-full cursor-pointer rounded bg-accent px-4 py-2 font-mono text-sm font-semibold text-bg transition-all duration-200 hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "> locking..." : "> lock_sol()"}
        </button>
      </form>

      {isSuccess && txSig && (
        <div className="mt-4 rounded border border-accent bg-success-bg p-3 text-sm text-accent">
          Locked successfully!{" "}
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
        <div className="mt-4 rounded border border-danger bg-danger-bg p-3 text-sm text-danger">
          {error.message}
        </div>
      )}
    </div>
  );
}
