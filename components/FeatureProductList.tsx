"use client";

import { useFadeInOnScroll } from "@/hooks/use-fade-in-onscroll";
import { getBlobImageUrl } from "@/utils/r2-image";
import Image from "next/image";
import Link from "next/link";

export default function FeatureProductList() {
  const itemsRef = useFadeInOnScroll();

  return (
    <section className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
      {/* ZX9 */}
      <div
        className="bg-orange rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center px-10 py-12 text-white"
        ref={(el) => {
          itemsRef.current[0] = el;
        }}
      >
        <div className="flex justify-center">
          <Image
            src={getBlobImageUrl("./assets/home/desktop/image-speaker-zx9.png")}
            alt="ZX9 Speaker"
            width={300}
            height={300}
            className="w-48 md:w-64 lg:w-72"
            draggable={false}
          />
        </div>
        <div>
          <h2 className="text-white mb-6">ZX9 Speaker</h2>
          <p className="text-body text-white/80 mb-8">
            Upgrade to premium speakers that are phenomenally built to deliver
            truly remarkable sound.
          </p>
          <Link
            href="/product/speakers/zx9-speaker"
            className="inline-block bg-black text-white uppercase px-10 py-4 tracking-widest hover:bg-black/80 transition-colors"
          >
            See Product
          </Link>
        </div>
      </div>

      {/* ZX7 */}
      <div
        className="rounded-lg overflow-hidden px-10 py-12 grid grid-cols-2 relative"
        ref={(el) => {
          itemsRef.current[1] = el;
        }}
      >
        <div>
          <h2 className="mb-6">ZX7 Speaker</h2>
          <Link
            href="/product/speakers/zx7-speaker"
            className="inline-block border border-black text-black uppercase px-10 py-4 tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            See Product
          </Link>
        </div>
        <Image
          src={getBlobImageUrl("./assets/home/desktop/image-speaker-zx7.jpg")}
          alt="ZX7 Speaker"
          width={800}
          height={800}
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
          draggable={false}
        />
      </div>

      {/* YX1 */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        ref={(el) => {
          itemsRef.current[2] = el;
        }}
      >
        <Image
          src={getBlobImageUrl("./assets/home/desktop/image-earphones-yx1.jpg")}
          alt="YX1 Earphones"
          width={600}
          height={400}
          className="rounded-lg w-full h-full object-cover"
          draggable={false}
        />
        <div className="bg-gray rounded-lg px-10 py-12 flex flex-col justify-center items-start">
          <h2 className="mb-6">YX1 Earphones</h2>
          <Link
            href="/product/earphones/yx1-earphones"
            className="inline-block border border-black text-black uppercase px-10 py-4 tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            See Product
          </Link>
        </div>
      </div>
    </section>
  );
}
