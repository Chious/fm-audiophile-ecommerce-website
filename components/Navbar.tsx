"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import logo from "@/assets/shared/desktop/logo.svg";
import Link from "next/link";
import { navItems } from "@/data/nav";
import CartButtonWithModal from "./CartButtonWithModal";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import Sheet components to avoid hydration mismatch
const MobileMenu = dynamic(
  () =>
    import("@/components/ui/sheet").then((mod) => {
      const { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } =
        mod;
      return function MobileMenuComponent({
        isMenuOpen,
        setIsMenuOpen,
      }: {
        isMenuOpen: boolean;
        setIsMenuOpen: (open: boolean) => void;
      }) {
        return (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-white">
              <SheetHeader>
                <SheetTitle className="text-left">menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 p-4">
                <ul className="flex flex-col gap-4">
                  {navItems.map((nav) => (
                    <li key={nav.name}>
                      <Link
                        href={nav.link}
                        onClick={() => setIsMenuOpen(false)}
                        className="uppercase text-black hover:text-orange transition-colors"
                      >
                        {nav.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        );
      };
    }),
  { ssr: false }
);

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex w-full text-white bg-black px-4 py-8 items-center justify-between relative h-20">
      <div className="absolute inset-0 bg-black -z-10 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen" />

      {/* Hamburger Menu - visible on tablet and below */}
      <div className="w-10 h-10 lg:hidden flex items-center justify-center shrink-0">
        <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
      {/* Placeholder for desktop - ensures consistent spacing */}
      <div className="hidden lg:block w-10 h-10 shrink-0" />

      {/* Logo - fixed size container */}
      <div className="w-[143px] h-[25px] shrink-0">
        <Link href="/">
          <Image
            alt="logo"
            src={logo}
            width={143}
            height={25}
            fetchPriority="high"
            className="w-full h-full object-contain cursor-pointer"
          />
        </Link>
      </div>

      {/* Navigation Links - hidden on tablet, visible on desktop */}
      <ul className="hidden lg:flex gap-8 flex-1 justify-center">
        {navItems.map((nav) => (
          <li className="uppercase" key={nav.name}>
            <Link
              href={nav.link}
              className="uppercase text-white hover:text-orange transition-colors"
            >
              {nav.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Cart Button - fixed size container */}
      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        <CartButtonWithModal />
      </div>

      <div className="decoration-line bg-gray/20 bottom-0 absolute h-0.5 w-full "></div>
    </nav>
  );
}
