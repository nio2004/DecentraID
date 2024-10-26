use anchor_lang::prelude::*;

declare_id!("AnsFYbT3wTVkL74bfvNnB2m7r9HgmQ6JkR1Vpz8Yytb");

#[program]
pub mod ipfs_hash_storage {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn store_ipfs_hash(_ctx: Context<StoreIpfsHash>, ipfs_hash: String) -> Result<()> {
        let user_account = &mut _ctx.accounts.user_account;
        user_account.ipfs_hash = ipfs_hash;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct StoreIpfsHash<'info> {
    #[account(init, payer = user, space = 8 + 64)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    pub ipfs_hash: String,
}