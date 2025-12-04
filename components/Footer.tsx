import { navItems, socialLinks } from "@/data/nav";
import Link from "next/link";
import Image from "next/image";
import { getBlobImageUrl } from "@/utils/r2-image";

export default function Footer() {
  return (
    <footer className="relative p-8 flex flex-col gap-8 pt-0">
      <div className="absolute inset-0 bg-black -z-10 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen" />

      <div className="decorate-line w-[200px] h-1.5 bg-orange relative left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0" />
      <Image
        alt="logo"
        src={getBlobImageUrl("./assets/shared/desktop/logo.svg")}
        width={100}
        height={30}
        priority
      />
      <ul className="flex gap-8">
        {navItems.map((nav) => (
          <Link href={nav.link} key={nav.name}>
            <li className="uppercase text-white">{nav.name}</li>
          </Link>
        ))}
      </ul>
      <p className="text-subtitle text-gray/20 text-center md:text-start">
        {`Audiophile is an all in one stop to fulfill your audio needs. We're a
        small team of music lovers and sound specialists who are devoted to
        helping you get the most out of personal audio. Come and visit our demo
        facility - we're open 7 days a week.`}
      </p>
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <p className="text-gray/20 text-subtitle text-center">
          Copyright 2021. All Rights Reserved
        </p>
        <div className="social links flex gap-4 flex-row items-center justify-center">
          {socialLinks.map((link) => (
            <Link key={link.name} href={link.link}>
              <Image
                src={getBlobImageUrl(link.image)}
                alt={link.name}
                width={20}
                height={20}
              />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
