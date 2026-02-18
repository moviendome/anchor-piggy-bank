use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program, system_instruction};

use crate::error;
use crate::state::Lock;

pub fn lock(ctx: Context<LockCtx>, amt: u64, exp: u64) -> Result<()> {
    let clock = Clock::get()?;

    require!(amt > 0, error::Error::InvalidAmount);

    require!(
        exp > u64::try_from(clock.unix_timestamp).unwrap(),
        error::Error::InvalidExpiration
    );

    let lock = &mut ctx.accounts.lock;
    lock.dst = ctx.accounts.dst.key();
    lock.exp = exp;

    let ix = system_instruction::transfer(
        &ctx.accounts.payer.key(),
        &ctx.accounts.lock.key(),
        amt,
    );
    program::invoke(&ix, &[
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.lock.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ])?;

    Ok(())
}

#[derive(Accounts)]
pub struct LockCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the destination account that will receive funds when unlocked
    pub dst: AccountInfo<'info>,

    #[account(
        init,
        payer = payer,
        space = Lock::LEN,
    )]
    pub lock: Account<'info, Lock>,

    pub system_program: Program<'info, System>,
}
