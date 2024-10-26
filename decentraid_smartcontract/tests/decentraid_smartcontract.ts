import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IpfsHashStorage } from "../target/types/ipfs_hash_storage";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as assert from "assert";

describe("ipfs_hash_storage", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // const program = anchor.workspace.IpfsHashStorage as Program<IpfsHashStorage>;
  const program = anchor.workspace.IpfsHashStorage;

  let userAccount: Keypair; // Keypair for user account

  before(async () => {
    // Generate a new keypair for the user account
    userAccount = Keypair.generate();
  });

  it("Initializes the program", async () => {
    // Run the initialize method
    const txSig = await program.methods
      .initialize()
      .accounts({})
      .rpc();

    console.log("Program initialized. Tx Signature:", txSig);
  });

  it("Stores the IPFS hash", async () => {
    // The IPFS hash to be stored
    const ipfsHash = "QmExampleHash123456789";

    // Create the user account and store the IPFS hash
    const txSig = await program.methods
      .storeIpfsHash(ipfsHash)
      .accounts({
        userAccount: userAccount.publicKey, // Public key of the user account
        user: provider.wallet.publicKey,    // The wallet paying for the transaction
        systemProgram: SystemProgram.programId, // System program for creating the account
      })
      .signers([userAccount]) // Include both the userAccount and provider wallet as signers
      .rpc();

    console.log("Transaction signature for storing IPFS hash:", txSig);

    // Fetch the newly created user account and verify the stored IPFS hash
    const accountData = await program.account.userAccount.fetch(userAccount.publicKey);

    assert.strictEqual(accountData.ipfsHash, ipfsHash);
    console.log("Stored IPFS hash:", accountData.ipfsHash);
  });
});
