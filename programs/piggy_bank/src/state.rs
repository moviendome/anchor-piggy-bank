use anchor_lang::prelude::*;

#[account]
pub struct Lock {
    pub dst: Pubkey,  // destination address to receive funds
    pub exp: u64,     // expiration timestamp
}

impl Lock {
    pub const LEN: usize = 8 + 32 + 8; // discriminator + pubkey + u64
}
