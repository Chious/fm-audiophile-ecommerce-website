"use client";

import { product } from "@/app/api/modules/products/model";
import { useFadeInOnScroll } from "@/hooks/use-fade-in-onscroll";
import { getResponsiveBlobImageUrl } from "@/utils/r2-image";
import Image from "next/image";
import Link from "next/link";

export default function ProductList({ products }: { products: product[] }) {
  const itemsRef = useFadeInOnScroll();

  return (
    <section className="mb-24 md:mb-32 lg:mb-40">
      <div className="flex flex-col gap-20 md:gap-32 lg:gap-40">
        {products.map((product: (typeof products)[number], index: number) => (
          <div
            key={product.id}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-32 items-center ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
          >
            {/* Product Image */}
            <div
              className={`w-full relative aspect-square ${
                index % 2 === 1 ? "md:order-2" : "md:order-1"
              }`}
            >
              <Image
                src={getResponsiveBlobImageUrl(product.categoryImage)}
                alt={product.name}
                fill
                className="w-full h-auto rounded-lg"
                fetchPriority={index == 0 ? "high" : "auto"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
              />
            </div>

            {/* Product Info */}
            <div
              className={`flex flex-col gap-6 text-center md:text-left ${
                index % 2 === 1 ? "md:order-1" : "md:order-2"
              }`}
            >
              {product.new && (
                <h6 className="text-orange text-overline">NEW PRODUCT</h6>
              )}
              <h2 className="text-black">{product.name}</h2>
              <p className="text-body text-black/50">{product.description}</p>
              <Link
                href={`/product/${product.category}/${product.slug}`}
                className="uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors inline-block w-fit mx-auto md:mx-0"
              >
                See Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
