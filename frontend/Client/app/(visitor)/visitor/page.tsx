"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import PhantomWallet from "@components/Phantomwallet";

export default function Page() {
  const searchParams = useSearchParams();
  const prevRoute = searchParams.get("url"); // Get the prevRoute parameter
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false); // Track wallet connection status
  const [blockchainData, setBlockchainData] = useState<any>(null); // Store blockchain data
  const [userExists, setUserExists] = useState<boolean | null>(null); // Track if the user exists
  const [hasCheckedUser, setHasCheckedUser] = useState(false); // Track if user has been checked

  // Redirect to previous route or default
  const handleRedirect = () => {
    if (prevRoute) {
      router.push(prevRoute); // Navigate back to prevRoute if it exists
    }
  };

  // Handle connection status and blockchain data change
  const handleConnectionChange = (connected: boolean, data: any) => {
    setIsConnected(connected); // Update connection status
    setBlockchainData(data);   // Store blockchain data
  };

  const checkUserAndRedirect = async () => {
    if (blockchainData && blockchainData?.publicKey && prevRoute && !hasCheckedUser) {
      try {
        console.log(blockchainData.publicKey); // Log for debugging
        const response = await axios.post("http://localhost:4000/check-user", {
          publickey: blockchainData?.publicKey, // Send the public key for user check
        });
        console.log(response.data); // Log response for debugging

        if (response.data?.userExists) {
          // Redirect with blockchain data if user exists
         
            console.log(blockchainData)
            // router.push(`${prevRoute}?userData=${JSON.stringify(blockchainData)}`);
        } else {
          setUserExists(false); // If user does not exist, set state to false
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setHasCheckedUser(true); // Mark as checked to prevent further checks
      }
    }
  };

  // Run check when connected or blockchainData changes
  useEffect(() => {
    if (isConnected && blockchainData) {
      checkUserAndRedirect();
    }
    console.log("useeffect");
    console.log(isConnected);
    console.log(blockchainData);
  }, [isConnected, blockchainData]);

  const handleSignupRedirect = () => {
    router.push("/signup"); // Redirect to signup page when clicked
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20 gap-10">
      <div className="text-gradient text-[40px] font-poppins font-semibold">
        Visitor Page
      </div>
      <div className="text-white font-poppins font-semibold">
        Redirected From:{" "}
        <span
          onClick={handleRedirect}
          className={`text-blue-400 ${prevRoute ? "cursor-pointer" : "cursor-not-allowed"}`}
        >
          {prevRoute || "No previous route"}
        </span>
      </div>
      <div className="text-white font-poppins font-semibold mt-4">
        Wallet Status: {isConnected ? "Connected" : "Disconnected"}
      </div>
      <div className="text-white box-shadow bg-black-gradient p-5 border-white rounded-lg">
        <PhantomWallet onConnectionChange={handleConnectionChange} />
      </div>

      {userExists === false && (
        <div
          onClick={handleSignupRedirect}
          className="mt-4 p-4 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
        >
          It seems like you don't have an account. Click here to sign up.
        </div>
      )}
    </div>
  );
}
