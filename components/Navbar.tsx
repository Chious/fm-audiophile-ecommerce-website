import logo from "@/assets/shared/desktop/logo.svg";
import Link from "next/link";
import { navItems } from "@/data/nav";
import CartButtonWithModal from "./CartButtonWithModal";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex w-full text-white bg-black px-4 py-8 items-center justify-between relative">
      <div className="absolute inset-0 bg-black -z-10 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen" />

      <Image
        alt="logo"
        src={logo}
        width={100}
        height={30}
        fetchPriority="high"
      />

      <ul className="flex gap-8">
        {navItems.map((nav) => (
          <Link href={nav.link} key={nav.name}>
            <li className="uppercase">{nav.name}</li>
          </Link>
        ))}
      </ul>

      <CartButtonWithModal />

      <div className="decoration-line bg-gray/20 bottom-0 absolute h-0.5 w-full "></div>
    </nav>
  );
}
