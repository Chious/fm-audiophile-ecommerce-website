"use client";

import { useFadeInOnScroll } from "@/hooks/use-fade-in-onscroll";
import Image from "next/image";

type Props = {
  imageSrc: string;
  alt: string;
  heading: React.ReactNode;
  body: React.ReactNode;
};

export function AboutSection({ imageSrc, alt, heading, body }: Props) {
  const itemsRef = useFadeInOnScroll();

  return (
    <section className="mb-24 md:mb-32 grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
      <Image
        src={imageSrc}
        alt={alt}
        width={500}
        height={500}
        fetchPriority="high"
        className="w-full h-auto rounded-lg aspect-video object-cover order-1 lg:order-2"
        ref={(el) => {
          itemsRef.current[0] = el;
        }}
      />
      <div
        ref={(el) => {
          itemsRef.current[1] = el;
        }}
        className="order-2 lg:order-1"
      >
        {heading}
        {body}
      </div>
    </section>
  );
}
