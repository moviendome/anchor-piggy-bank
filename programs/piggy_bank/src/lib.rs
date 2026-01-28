use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("ZaU8j7XCKSxmmkMvg7NnjrLNK6eiLZbHsJQAc2rFzEN");

#[program]
pub mod piggy_bank {
    use super::*;

    pub fn lock(ctx: Context<LockCtx>, amt: u64, exp: u64) -> Result<()> {
        instructions::lock::lock(ctx, amt, exp)
    }

    pub fn unlock(ctx: Context<UnlockCtx>) -> Result<()> {
        instructions::unlock::unlock(ctx)
    }
}
