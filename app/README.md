# Piggy Bank Frontend

A Next.js frontend for the Piggy Bank Solana program. Lock SOL until a future date, then unlock it when the time expires.

Built as part of the [Cyfrin Updraft](https://updraft.cyfrin.io/) Rust & Solana course.

## Stack

- [Anchor](https://www.anchor-lang.com/) — Solana framework (TS client)
- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) — Wallet connection

## Program

Deployed on Devnet: [`ZaU8j7XCKSxmmkMvg7NnjrLNK6eiLZbHsJQAc2rFzEN`](https://explorer.solana.com/address/ZaU8j7XCKSxmmkMvg7NnjrLNK6eiLZbHsJQAc2rFzEN?cluster=devnet)

## Setup

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Get devnet SOL from [faucet.solana.com](https://faucet.solana.com/)
2. Connect a Solana wallet (Phantom, Solflare, etc.) set to Devnet
3. Pick an amount (0.1, 0.2, or 0.3 SOL) and a duration (2, 5, or 10 min)
4. Confirm the transaction in your wallet
5. Wait for the lock to expire
6. Hit unlock to withdraw your SOL

## Links

- [Blog Post](https://moviendo.me/time-locked-sol-savings-with-anchor-building-a-piggy-bank-on-solana)
- [GitHub](https://github.com/moviendome/anchor-piggy-bank)
