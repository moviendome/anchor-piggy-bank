# Piggy Bank - Solana Anchor Program

<p align="center">
  <img src="./assets/piggy-bank-banner.png" alt="Piggy Bank - Time-locked SOL savings" width="400">
</p>

A time-locked savings program built with Anchor framework for Solana. This program allows users to lock SOL until a specified expiration time, after which the funds can be withdrawn to a designated destination address.

## Overview

The Piggy Bank program implements a simple time-lock mechanism:

1. **Lock**: Deposit SOL into a lock account with an expiration timestamp
2. **Unlock**: Withdraw all funds to the destination address after expiration

This is part of the [Cyfrin Solana Course](https://updraft.cyfrin.io/) - Section 5.

## Project Structure

```
piggy_bank/
├── programs/piggy_bank/src/
│   ├── lib.rs                 # Program entry point
│   ├── error.rs               # Custom error codes
│   ├── state.rs               # Lock account structure
│   └── instructions/
│       ├── mod.rs             # Module exports
│       ├── lock.rs            # Lock instruction
│       └── unlock.rs          # Unlock instruction
├── tests/
│   └── piggy_bank.ts          # TypeScript tests
└── README.md
```

## Prerequisites

- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) and Yarn

## Setup

```bash
# Initialize the project (already done)
anchor init piggy_bank

# Sync program keys
anchor keys sync

# Build the program
anchor build

# Run tests
anchor test
```

## Program Instructions

### 1. Lock

Locks SOL in a new account until the expiration time.

**Parameters:**
- `amt: u64` - Amount of lamports to lock (must be > 0)
- `exp: u64` - Unix timestamp when funds can be unlocked (must be in the future)

**Accounts:**
- `payer` (signer, mutable) - The account funding the lock
- `dst` - Destination account to receive funds on unlock
- `lock` (mutable) - The lock account to create
- `system_program` - System program

**Validations:**
- Amount must be greater than 0 (`InvalidAmount`)
- Expiration must be in the future (`InvalidExpiration`)

### 2. Unlock

Withdraws all funds from a lock account to the destination after expiration.

**Accounts:**
- `lock` (mutable) - The lock account to close
- `dst` (mutable) - Destination account (must match stored destination)

**Validations:**
- Current time must be >= expiration time (`LockNotExpired`)
- Destination must match the one stored at lock time (`has_one` constraint)

## Code Walkthrough

### State: Lock Account

```rust
#[account]
pub struct Lock {
    pub dst: Pubkey,  // destination address to receive funds
    pub exp: u64,     // expiration timestamp
}

impl Lock {
    pub const LEN: usize = 8 + 32 + 8; // discriminator + pubkey + u64
}
```

The Lock account stores:
- **dst**: The public key that will receive funds on unlock
- **exp**: Unix timestamp when the lock expires

Account size calculation:
- 8 bytes: Anchor discriminator
- 32 bytes: Pubkey (destination)
- 8 bytes: u64 (expiration)

### Custom Errors

```rust
#[error_code]
pub enum Error {
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Expiration must be in the future")]
    InvalidExpiration,
    #[msg("Lock has not expired yet")]
    LockNotExpired,
}
```

### Lock Instruction

```rust
pub fn lock(ctx: Context<LockCtx>, amt: u64, exp: u64) -> Result<()> {
    let clock = Clock::get()?;

    // Validation
    require!(amt > 0, error::Error::InvalidAmount);
    require!(
        exp > u64::try_from(clock.unix_timestamp).unwrap(),
        error::Error::InvalidExpiration
    );

    // Store lock state
    let lock = &mut ctx.accounts.lock;
    lock.dst = ctx.accounts.dst.key();
    lock.exp = exp;

    // Transfer SOL using CPI
    let ix = system_instruction::transfer(
        &ctx.accounts.payer.key(),
        &ctx.accounts.lock.key(),
        amt,
    );
    invoke(
        &ix,
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.lock.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    Ok(())
}
```

Key concepts:
- **Clock::get()**: Retrieves the current cluster time
- **require!**: Anchor macro for validation with custom errors
- **system_instruction::transfer**: Creates a SOL transfer instruction
- **invoke**: Executes a Cross-Program Invocation (CPI)

### Unlock Instruction

```rust
pub fn unlock(ctx: Context<UnlockCtx>) -> Result<()> {
    let clock = Clock::get()?;
    let lock = &ctx.accounts.lock;

    // Validation
    require!(
        u64::try_from(clock.unix_timestamp).unwrap() >= lock.exp,
        error::Error::LockNotExpired
    );

    // Direct lamport manipulation
    let amt = ctx.accounts.lock.to_account_info().lamports();
    **ctx.accounts.lock.to_account_info().try_borrow_mut_lamports()? -= amt;
    **ctx.accounts.dst.to_account_info().try_borrow_mut_lamports()? += amt;

    Ok(())
}
```

Key concepts:
- **try_borrow_mut_lamports()**: Directly manipulates account lamports
- **close = dst**: Anchor constraint that closes the account after instruction
- **has_one = dst**: Validates that `dst` matches the stored destination

## Testing

The test suite covers:

1. **Happy path**: Lock SOL, wait for expiration, unlock successfully
2. **Invalid amount**: Rejects zero amount with `InvalidAmount`
3. **Invalid expiration**: Rejects past timestamps with `InvalidExpiration`
4. **Premature unlock**: Rejects unlock before expiration with `LockNotExpired`

### Running Tests

```bash
anchor test
```

### Test Output

```
  piggy_bank
    ✔ locks SOL and unlocks after expiration (7034ms)
    ✔ fails to lock with zero amount (78ms)
    ✔ fails to lock with past expiration (67ms)
    ✔ fails to unlock before expiration (311ms)

  4 passing (8s)
```

## Key Learnings

### 1. Account Constraints

Anchor provides powerful account validation through attributes:

```rust
#[account(
    init,           // Creates the account
    payer = payer,  // Specifies who pays for account creation
    space = Lock::LEN,  // Allocates space
)]
pub lock: Account<'info, Lock>,

#[account(
    mut,            // Account is mutable
    close = dst,    // Close account and send rent to dst
    has_one = dst,  // Validates dst matches stored value
)]
pub lock: Account<'info, Lock>,
```

### 2. Time Handling

Solana provides cluster time through the Clock sysvar:

```rust
let clock = Clock::get()?;
let current_time = clock.unix_timestamp; // i64
```

### 3. SOL Transfers

Two approaches for transferring SOL:

**CPI (Cross-Program Invocation):**
```rust
let ix = system_instruction::transfer(&from, &to, amount);
invoke(&ix, &[from_info, to_info, system_program])?;
```

**Direct lamport manipulation:**
```rust
**from.try_borrow_mut_lamports()? -= amount;
**to.try_borrow_mut_lamports()? += amount;
```

### 4. Error Handling

Custom errors with the `#[error_code]` attribute:

```rust
#[error_code]
pub enum Error {
    #[msg("Human readable message")]
    ErrorVariant,
}

// Usage
require!(condition, error::Error::ErrorVariant);
```

### 5. Testing Time-Based Logic

When testing time-dependent logic on localnet:
- The validator clock may not sync immediately with real time
- Add buffer time (e.g., 6 seconds wait for 3 second expiration)
- Use longer timeouts for time-sensitive tests

## Common Issues & Solutions

### Issue: `LockNotExpired` during tests

The local validator's clock doesn't advance in real-time immediately. Solution: Add extra wait time in tests.

```typescript
// Wait longer than the expiration time
await new Promise((resolve) => setTimeout(resolve, 6000));
```

### Issue: Chai ESM compatibility

Modern versions of chai use ESM which can conflict with ts-mocha. Solution: Use chai v4.

```bash
yarn add chai@4 @types/chai@4
```

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Cyfrin Updraft - Solana Course](https://updraft.cyfrin.io/)
- [Solana Program Library](https://spl.solana.com/)

## License

MIT
