import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PiggyBank } from "../target/types/piggy_bank";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("piggy_bank", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PiggyBank as Program<PiggyBank>;

  it("locks SOL and unlocks after expiration", async () => {
    // Generate a new keypair for the lock account
    const lockKeypair = Keypair.generate();

    // Destination wallet that will receive the funds
    const destination = Keypair.generate();

    // Amount to lock (0.1 SOL)
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

    // Expiration: 3 seconds from now
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = new anchor.BN(currentTime + 3);

    // Lock SOL
    const lockTx = await program.methods
      .lock(amount, expiration)
      .accounts({
        payer: provider.wallet.publicKey,
        dst: destination.publicKey,
        lock: lockKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([lockKeypair])
      .rpc();

    console.log("Lock transaction signature:", lockTx);

    // Verify the lock account was created
    const lockAccount = await program.account.lock.fetch(lockKeypair.publicKey);
    expect(lockAccount.dst.toString()).to.equal(destination.publicKey.toString());
    expect(lockAccount.exp.toNumber()).to.equal(expiration.toNumber());

    // Wait for expiration (6 seconds to allow validator clock to advance)
    console.log("Waiting for lock to expire...");
    await new Promise((resolve) => setTimeout(resolve, 6000));

    // Get destination balance before unlock
    const balanceBefore = await provider.connection.getBalance(destination.publicKey);

    // Unlock
    const unlockTx = await program.methods
      .unlock()
      .accounts({
        lock: lockKeypair.publicKey,
        dst: destination.publicKey,
      })
      .rpc();

    console.log("Unlock transaction signature:", unlockTx);

    // Verify funds were transferred to destination
    const balanceAfter = await provider.connection.getBalance(destination.publicKey);
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
    console.log("Destination received:", (balanceAfter - balanceBefore) / LAMPORTS_PER_SOL, "SOL");
  });

  it("fails to lock with zero amount", async () => {
    const lockKeypair = Keypair.generate();
    const destination = Keypair.generate();
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = new anchor.BN(currentTime + 10);

    try {
      await program.methods
        .lock(new anchor.BN(0), expiration)
        .accounts({
          payer: provider.wallet.publicKey,
          dst: destination.publicKey,
          lock: lockKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([lockKeypair])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.toString()).to.include("InvalidAmount");
    }
  });

  it("fails to lock with past expiration", async () => {
    const lockKeypair = Keypair.generate();
    const destination = Keypair.generate();
    const pastExpiration = new anchor.BN(1000); // A timestamp in the past

    try {
      await program.methods
        .lock(new anchor.BN(LAMPORTS_PER_SOL), pastExpiration)
        .accounts({
          payer: provider.wallet.publicKey,
          dst: destination.publicKey,
          lock: lockKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([lockKeypair])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.toString()).to.include("InvalidExpiration");
    }
  });

  it("fails to unlock before expiration", async () => {
    const lockKeypair = Keypair.generate();
    const destination = Keypair.generate();
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

    // Set expiration far in the future (1 hour)
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = new anchor.BN(currentTime + 3600);

    // Lock SOL
    await program.methods
      .lock(amount, expiration)
      .accounts({
        payer: provider.wallet.publicKey,
        dst: destination.publicKey,
        lock: lockKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([lockKeypair])
      .rpc();

    // Try to unlock immediately (should fail)
    try {
      await program.methods
        .unlock()
        .accounts({
          lock: lockKeypair.publicKey,
          dst: destination.publicKey,
        })
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.toString()).to.include("LockNotExpired");
    }
  });
});
