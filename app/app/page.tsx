"use client";

import WalletMultiButton from "@/components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import LockForm from "@/components/LockForm";
import LockList from "@/components/LockList";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-accent/30 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-semibold text-accent">
              $ piggy_bank
            </h1>
            <span className="rounded border border-accent/40 bg-bg-tertiary px-2 py-0.5 font-mono text-xs font-medium text-accent">
              devnet
            </span>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-6 py-8">
          {!connected ? (
            <div className="space-y-6">
              {/* Hero */}
              <div className="rounded-lg border border-accent/30 bg-bg-secondary p-8 transition-all duration-300">
                <h2 className="mb-3 font-mono text-2xl font-semibold text-accent">
                  // piggy_bank
                </h2>
                <p className="mb-4 text-lg text-text-secondary">
                  A Solana program that lets you lock SOL until a future date.
                  Once the time expires, you can withdraw your funds &mdash; not a second before.
                </p>
              </div>

              {/* Stack */}
              <div className="rounded-lg border border-border bg-bg-secondary p-6">
                <h3 className="mb-3 font-mono text-sm font-semibold text-accent">
                  # stack
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { name: "Anchor", desc: "Solana framework", href: "https://www.anchor-lang.com/" },
                    { name: "Next.js", desc: "React framework", href: "https://nextjs.org/" },
                    { name: "Tailwind", desc: "Styling", href: "https://tailwindcss.com/" },
                    { name: "Wallet Adapter", desc: "Wallet connection", href: "https://github.com/anza-xyz/wallet-adapter" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-border bg-bg-tertiary px-3 py-2 text-center transition-all duration-200 hover:border-accent hover:-translate-y-0.5"
                    >
                      <p className="font-mono text-sm font-medium text-text">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* How to test */}
              <div className="rounded-lg border border-border bg-bg-secondary p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent">
                  # how_to_test
                </h3>
                <ol className="space-y-3">
                  {[
                    {
                      step: "Get devnet SOL",
                      detail: "Grab free tokens from the faucet — you'll need some to lock.",
                      link: { label: "faucet.solana.com", href: "https://faucet.solana.com/" },
                    },
                    {
                      step: "Connect your wallet",
                      detail: "Use Phantom, Solflare, or any Solana wallet. Make sure it's set to Devnet.",
                    },
                    {
                      step: "Pick amount & duration",
                      detail: "Choose how much SOL to lock and for how long (2, 5, or 10 minutes).",
                    },
                    {
                      step: "Confirm the transaction",
                      detail: "Your wallet will ask you to approve. The SOL is transferred to a lock account on-chain.",
                    },
                    {
                      step: "Wait for expiration",
                      detail: "The lock card will show \"active\" until the time is up, then it switches to \"expired\".",
                    },
                    {
                      step: "Unlock your SOL",
                      detail: "Hit the unlock button — the program verifies the time and sends your SOL back.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-accent/40 font-mono text-xs font-semibold text-accent">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-mono text-sm font-medium text-text">{item.step}</p>
                        <p className="text-sm text-text-muted">
                          {item.detail}
                          {item.link && (
                            <>
                              {" "}
                              <a
                                href={item.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline transition-colors duration-200 hover:text-accent-dim"
                              >
                                {item.link.label}
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Connect CTA */}
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <LockForm />
              <LockList />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-accent/20 py-6">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 font-mono text-sm text-text-muted">
          <span>$ piggy_bank v0.1.0</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/moviendome/anchor-piggy-bank"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors duration-200 hover:text-accent"
            >
              GitHub
            </a>
            <a
              href="https://moviendo.me/time-locked-sol-savings-with-anchor-building-a-piggy-bank-on-solana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors duration-200 hover:text-accent"
            >
              Blog Post
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
