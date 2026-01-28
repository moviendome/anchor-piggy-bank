use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Expiration must be in the future")]
    InvalidExpiration,
    #[msg("Lock has not expired yet")]
    LockNotExpired,
}
