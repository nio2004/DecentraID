import { useCallback, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import rawIdl from "/home/nio/DecentraID/decentraid_smartcontract/target/idl/ipfs_hash_storage.json";
import "./App.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;
// Program ID for the smart contract
const programId = new PublicKey("AnsFYbT3wTVkL74bfvNnB2m7r9HgmQ6JkR1Vpz8Yytb");

// Wallet configuration
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

function WalletSetup() {
  const [message, setMessage] = useState<string>("");
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const wallet = useWallet();

  // Connection setup
  const connection = new Connection(endpoint, "confirmed");

  // Anchor provider initialization
  const provider = useMemo(
    () =>
      new AnchorProvider(
        connection,
        wallet as any,
        { preflightCommitment: "processed" }
      ),
    [connection, wallet]
  );

  // Create the program instance using raw IDL directly
  const program = useMemo(() => {
    return new Program(rawIdl as any, programId, provider);
  }, [provider]);

  // Handle smart contract initialization and IPFS hash storage
  const onClick = useCallback(async () => {
    try {
      if (!wallet || !wallet.publicKey) {
        setMessage("Please connect your wallet first!");
        return;
      }

      // Initialize the smart contract
      const initializeTx = await program.methods.initialize().rpc();
      console.log("Initialized smart contract. Tx:", initializeTx);

      // Store IPFS hash
      if (!ipfsHash) {
        setMessage("Please enter an IPFS hash.");
        return;
      }
      const userAccount = Keypair.generate();
      console.log(userAccount.publicKey.toString());

      const storeIpfsHashTx = await program.methods
        .storeIpfsHash(ipfsHash)
        .accounts({
          userAccount: userAccount.publicKey, // Assuming the user is the payer and user account
          user: wallet.publicKey,
          system_program: SystemProgram.programId, // System program for initializing the account
        })
        .signers([userAccount])
        .rpc();

      setMessage('IPFS Hash stored successfully! Tx:' + storeIpfsHashTx);

      const userAccountPublicKey = new PublicKey(userAccount.publicKey); // Replace with appropriate method to get user's account public key
      const useripfs  = await program.account.userAccount.fetch(userAccountPublicKey) as Object;

      // Access the IPFS hash stored in the user's account
      // setFetchedIpfsHash(userAccount.ipfsHash);
      console.log(useripfs)
      setMessage("IPFS Hash fetched successfully!"+(useripfs));
    } catch (err) {
      console.error("Error executing smart contract:", err);
      setMessage("Error executing smart contract.");
    }
  }, [wallet, program, ipfsHash]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Hello Solana</h1>
      <WalletMultiButton />
      
      <input
        type="text"
        placeholder="Enter IPFS Hash"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        style={{ marginTop: "20px", padding: "10px", width: "300px" }}
      />
      
      <button
        onClick={onClick}
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}
      >
        Initialize and Store IPFS Hash
      </button>
      
      <p>{message}</p>
    </div>
  );
}

function App() {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletSetup />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;