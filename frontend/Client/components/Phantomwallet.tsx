import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import rawIdl from "C:/Users/Nishant/Downloads/hoobank-app-landing-page-master/hoobank-app-landing-page-master/ipfs_hash_storage.json";

interface PhantomWalletProps {
  onConnectionChange: (isConnected: boolean, userData?: any) => void;
}

const programId = new PublicKey("AnsFYbT3wTVkL74bfvNnB2m7r9HgmQ6JkR1Vpz8Yytb");
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

const MainContent: React.FC<PhantomWalletProps> = ({ onConnectionChange }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userBlockchainData, setUserBlockchainData] = useState<any>(null);
  const publicKey = walletAddress; // assuming `walletAddress` is equivalent to `publicKey`
  const wallet = useWallet();
  const connection = useMemo(() => new Connection(endpoint, "confirmed"), []);
  const provider = useMemo(
    () => new AnchorProvider(connection, wallet as any, { preflightCommitment: "processed" }),
    [connection, wallet]
  );
  const program = useMemo(() => new Program(rawIdl as any, programId, provider), [provider]);

  // UseEffect to fetch blockchain data when walletAddress is available
  useEffect(() => {
    if (walletAddress) {
      fetchBlockchainData();
    }
  }, [walletAddress]); // This will trigger when walletAddress changes

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        console.log('Connected with Public Key:', response.publicKey.toString());
      } catch (err) {
        console.error('Connection error:', err);
      }
    } else {
      alert('Phantom wallet not found. Please install it.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDropdownOpen(false);
    setUserBlockchainData(null);
    console.log('Disconnected');
  };

  const toggleDropdown = () => {
    if (!showPopup) {
      setDropdownOpen((prev) => !prev);
    }
  };

  const fetchBlockchainData = useCallback(async () => {
    if (!publicKey) return;

    try {
      const res = await axios.post('http://localhost:4000/getuserbykey', { publickey: publicKey });
      console.log('Fetched user account public key:', res.data);
      const useraccount = res.data.accountId;
      const bdata: any = await program.account.userAccount.fetch(useraccount);
      console.log(bdata);

      const res1 = await axios.get('http://localhost:4000/get/' + bdata.ipfsHash);
      const fetchedData = res1.data;
      setUserBlockchainData(fetchedData);
      console.log('Fetched user blockchain data:', fetchedData);

      // Call onConnectionChange with the user data and wallet public key
      onConnectionChange(true, { publicKey: walletAddress, blockchainData: fetchedData });
    } catch (error) {
      console.error('Error fetching data from blockchain:', error);
    }
  }, [publicKey, walletAddress, onConnectionChange]);

  const handleGetDetails = () => {
    setShowPopup(true);
    fetchBlockchainData();
  };

  const closePopup = () => setShowPopup(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {walletAddress ? (
        <button onClick={toggleDropdown}>Connected</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {dropdownOpen && walletAddress && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '200px',
          marginTop: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          zIndex: 1000,
        }}
        className="font-poppins text-white bg-black-gradient-2">
          <p className="text-transparent bg-clip-text bg-text-gradient font-extrabold">Wallet Address:</p>
          <p style={{ wordBreak: 'break-word', fontSize: '0.9em' }}>{walletAddress}</p>
          <button onClick={disconnectWallet} className="text-gray-00" style={{ marginTop: '8px', width: '100%' }}>
            Disconnect
          </button>
          <button onClick={handleGetDetails} className="text-gray-00" style={{ marginTop: '8px', width: '100%' }}>
            Get Details
          </button>
        </div>
      )}

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
            <button onClick={closePopup} className="mt-6 bg-white hover:bg-gray-100 text-blue1 font-semibold py-2 px-4 rounded w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PhantomWallet: React.FC<PhantomWalletProps> = ({ onConnectionChange }) => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MainContent onConnectionChange={onConnectionChange} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default PhantomWallet;
