"use client"
import { useState } from 'react';
import { close, logo, menu } from "@/public/assets";
import { navLinks } from "@/constants";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PhantomWallet from './Phantomwallet';

const Navbar: React.FC = () => {
  const [toggle, setToggle] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const Redirect = (url : any) => {
    router.push(url);
  }
  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected); // Update connection status
  };
  return (
    <nav className="w-full flex py-6 justify-between items-center navbar">
      <Image src={logo} alt="HooBank" width={124} height={32} />
      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] text-white ${index === navLinks.length - 1 ? 'mr-0' : 'mr-10'}`}
            onClick={()=> {Redirect(`${nav.id}`)}}>
            <a href={`#${nav.id}`} className='text-white text-lg hover:text-blue1'>
              {nav.title}
            </a>
          </li>
        ))}
        <li className={`mr-10 px-5 font-poppins font-normal cursor-pointer text-[16px] text-white hover:text-blue1`}>
          <PhantomWallet onConnectionChange={handleConnectionChange} />
        </li>
      </ul>
      <div className="sm:hidden flex flex-1 justify-end items-center">
        <Image src={toggle ? close : menu}
          alt="menu"
          className="object-contain"
          width={28}
          height={28}
          onClick={() => setToggle((prev) => !prev)} />
        <div className={`${toggle ? 'flex' : 'hidden'}
            p-6 bg-black-gradient absolute top-20 ring-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}>
          <ul className="list-none flex flex-col justify-end items-center flex-1">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-normal cursor-pointer text-[16px] text-white ${index === navLinks.length - 1 ? 'mr-0' : 'mb-4'}`}>
                <a href={`/${nav.id}`}>
                  {nav.title}
                </a>
              </li>
            ))}
          </ul>
            
        </div>
      </div>
    </nav>
  )
}

export default Navbar