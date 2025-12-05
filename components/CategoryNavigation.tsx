"use client";

import { useFadeInStagger } from "@/hooks/use-fade-in-stagger";
import { categoryLinks } from "@/data/nav";
import { getBlobImageUrl } from "@/utils/r2-image";
import Image from "next/image";
import Link from "next/link";

export function CategoryNavigation() {
  const containerRef = useFadeInStagger({
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px",
    stagger: 0.15,
  });

  return (
    <section className="mb-24 md:mb-32" ref={containerRef}>
      <div className="flex flex-col gap-4 md:flex-row md:gap-3 lg:gap-8">
        {categoryLinks.map((categoryItem) => (
          <div
            key={categoryItem.name}
            data-stagger-item
            className="relative flex-1 flex items-center justify-center flex-col"
          >
            <Image
              className="relative z-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 hover:scale-105 duration-300 transition"
              alt={categoryItem.name}
              src={getBlobImageUrl(categoryItem.image)}
              width={200}
              height={200}
            />
            <div className="bg-gray flex flex-col items-center justify-center gap-4 p-6 md:p-8 rounded-lg w-full pt-20 md:pt-24 lg:pt-28 relative -top-16 md:-top-20 lg:-top-24">
              <h6 className="text-black">{categoryItem.name}</h6>
              <Link
                href={categoryItem.link}
                className="text-body text-black/50 uppercase hover:text-orange transition-colors after-arrow-right"
              >
                Shop
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
