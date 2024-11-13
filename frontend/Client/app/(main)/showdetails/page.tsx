"use client";
import { robot } from "@public/assets";
import styles from "@styles/style";
import Image from "next/image";
import React from "react";
import { useSearchParams } from "next/navigation";

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const fullname = searchParams.get("fullname");
  const email = searchParams.get("email");
  const address = searchParams.get("address");

  return (
    <>
      <div className="h-fit w-fit min-h-[50vh] flex items-center justify-center">
        <div className="bg-black-gradient-2 p-6 px-20 shadow-md w-full max-w-md rounded-2xl">
          <div className="flex text-white">
            <strong>Username:  </strong> {fullname || "N/A"}
          </div>
          <div className="flex text-white">
            <strong>Email Address:  </strong> {email || "N/A"}
          </div>
          <div className="flex text-white">
            <strong>Address:  </strong> {address || "N/A"}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
