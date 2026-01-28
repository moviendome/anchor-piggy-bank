use anchor_lang::prelude::*;

use crate::error;
use crate::state::Lock;

pub fn unlock(ctx: Context<UnlockCtx>) -> Result<()> {
    let clock = Clock::get()?;
    let lock = &ctx.accounts.lock;

    require!(
        u64::try_from(clock.unix_timestamp).unwrap() >= lock.exp,
        error::Error::LockNotExpired
    );

    let amt = ctx.accounts.lock.to_account_info().lamports();
    **ctx
        .accounts
        .lock
        .to_account_info()
        .try_borrow_mut_lamports()? -= amt;
    **ctx
        .accounts
        .dst
        .to_account_info()
        .try_borrow_mut_lamports()? += amt;

    Ok(())
}

#[derive(Accounts)]
pub struct UnlockCtx<'info> {
    #[account(
        mut,
        close = dst,
        has_one = dst,
    )]
    pub lock: Account<'info, Lock>,

    /// CHECK: Validated by has_one constraint on lock account
    #[account(mut)]
    pub dst: AccountInfo<'info>,
}
