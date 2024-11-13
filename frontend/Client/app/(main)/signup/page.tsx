"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  ConnectionProvider, 
  WalletProvider, 
  useWallet 
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import rawIdl from "C:/Users/Nishant/Downloads/hoobank-app-landing-page-master/hoobank-app-landing-page-master/ipfs_hash_storage.json";

if (typeof window !== 'undefined') {
  require("@solana/wallet-adapter-react-ui/styles.css");
  require("buffer").Buffer;
}

const programId = new PublicKey("AnsFYbT3wTVkL74bfvNnB2m7r9HgmQ6JkR1Vpz8Yytb");
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

function SignUpForm() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  // const [message, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [userBlockchainData, setUserBlockchainData] = useState<any>(null);
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const connection = useMemo(() => new Connection(endpoint, "confirmed"), []);
  
  const provider = useMemo(
    () =>
      new AnchorProvider(
        connection,
        wallet as any,
        { preflightCommitment: "processed" }
      ),
    [connection, wallet]
  );

  const program = useMemo(() => {
    return new Program(rawIdl as any, programId, provider);
  }, [provider]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!fullname || !email || !address || !connected || !publicKey) {
      setError("All fields are required, and the wallet must be connected.");
      return;
    }
 
    try {
      const response = await axios.post("http://localhost:4000/check-user", {
        publickey: publicKey.toString(),
      });
      console.log("check-user")
      console.log(response.data)
      if (response.data.userExists) {
        setError("User Already Exists!");
      } else {
        const res = await axios.post("http://localhost:4000/create-new-userfile", {
          publickey: publicKey.toString(),
          username: fullname,
          email: email,
          address: address,
        });

        const ipfs = res.data.ipfsHash;

        // Insert the data into the blockchain
        const newuserAccount = await execTransac(ipfs);

        await axios.post("http://localhost:4000/add-user", {
          publickey: publicKey.toString(),
          useraccountid: newuserAccount?.publicKey,
        });

        setError("");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setError("An error occurred during form submission.");
    }
  };

  const execTransac = useCallback(
    async (ipfsHash: string) => {
      try {
        if (!wallet || !wallet.publicKey) {
          setError("Please connect your wallet first!");
          return null;
        }
  
        const initializeTx = await program.methods.initialize().rpc();
        console.log("Initialized smart contract. Tx:", initializeTx);
  
        if (!ipfsHash) {
          setError("Please enter a valid IPFS hash.");
          return null;
        }
  
        const userAccount = Keypair.generate();
        console.log("Generated user account public key:", userAccount.publicKey.toString());
  
        const storeIpfsHashTx = await program.methods
          .storeIpfsHash(ipfsHash)
          .accounts({
            userAccount: userAccount.publicKey,
            user: wallet.publicKey,
            system_program: SystemProgram.programId,
          })
          .signers([userAccount])
          .rpc();
  
        setError("IPFS Hash stored successfully! Tx: " + storeIpfsHashTx);
  
        const userAccountPublicKey = new PublicKey(userAccount.publicKey);
        const useripfs = await program.account.userAccount.fetch(userAccountPublicKey) as Object;
  
        console.log("Fetched IPFS data from user account:", useripfs);
        setError("IPFS Hash fetched successfully! " + JSON.stringify(useripfs));
  
        return userAccount;
      } catch (err) {
        console.error("Error executing smart contract:", err);
        setError("Error executing smart contract.");
        return null;
      }
    },
    [wallet, program]
  );

  const fetchBlockchainData = useCallback(async () => {
    if (!publicKey) return;
    
    try {
        const res = await axios.post("http://localhost:4000/getuserbykey", {
            publickey: publicKey
        });
        
        console.log("fetched useraccount public key " +res.data)
        const useraccount = res.data.accountId;
        const bdata:any = await program.account.userAccount.fetch(useraccount);
        console.log(bdata)
 
        const res1 = await axios.get("http://localhost:4000/get/" + bdata.ipfsHash);
        setUserBlockchainData(res1.data);
        console.log("Fetched user blockchain data:", res1.data);
    } catch (error) {
      console.error("Error fetching data from blockchain:", error);
    }
  }, [publicKey, program]);

  useEffect(() => {
    if (showPopup) {
      fetchBlockchainData();
    }
  }, [showPopup, fetchBlockchainData]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="bg-gray-600/50 p-6 px-20 mt-14 shadow-md w-full max-w-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue1">
        Sign Up
      </h2>

      {error && (
        <div className="mb-4 text-white/90 font-poppins font-semibold text-center">
          {error} !
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white">UserName</label>
          <input
            type="text"
            className="w-full bg-white/80 px-4 py-2 border rounded-md focus:outline-none"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white1">Email Address</label>
          <input
            type="email"
            className="w-full bg-white/80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white1">Address</label>
          <input
            type="text"
            className="w-full bg-white/80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="mt-3 mb-5 text-center">
          <WalletMultiButton />
        </div>
        <button
          type="submit"
          className="w-full bg-blue1/80 text-white1/80 font-bold py-2 rounded-md hover:bg-blue1/60 transition duration-300"
          // disabled={!connected}
        >
          Sign Up
        </button>
      </form>

      {/* <p>{message}</p> */}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black-gradient-2 rounded-lg p-8 shadow-lg w-[40vw]">
            <h3 className="text-lg font-bold mb-4 text-center text-white">
              Account Data on Blockchain
            </h3>
            <div className="p-2">
              <p className="text-gray-300 text-lg">
                <strong>Username:</strong> {userBlockchainData?.username}
              </p>
              <p className="text-gray-300 text-lg">
                <strong>Email:</strong> {userBlockchainData?.email}
              </p>
              <p className="text-gray-300 text-lg">
                <strong>Address:</strong> {userBlockchainData?.address}
              </p>
            </div>
            <button
              onClick={closePopup}
              className="mt-6 bg-white hover:bg-gray-100 text-blue1 font-semibold py-2 px-4 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  if (!isClient) return null;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SignUpForm />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
