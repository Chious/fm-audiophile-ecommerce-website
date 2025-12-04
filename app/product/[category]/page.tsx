import R2PresignedImage from "@/components/R2PresignedImage";
import Link from "next/link";
import { categoryLinks } from "@/data/nav";
import { ProductService } from "@/api/modules/products/service";

export const revalidate = 3600;

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateStaticParams() {
  const categories = categoryLinks.map((link) =>
    link.link.replace("/product/", "")
  );
  return categories.map((category) => ({
    category,
  }));
}

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  // Use ProductService directly for SSR/ISR (no HTTP request needed)
  const { products } = ProductService.getProductsByCategory(category);
  const categoryName = capitalizeFirst(category);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Hero Section */}
      <section className="py-8 md:py-16 lg:py-24 border-b border-black/10 mb-16 md:mb-24">
        <h1 className="text-center md:text-left">{categoryName}</h1>
      </section>

      {/* Product List */}
      <section className="mb-24 md:mb-32 lg:mb-40">
        <div className="flex flex-col gap-20 md:gap-32 lg:gap-40">
          {products.map((product: (typeof products)[number], index: number) => (
            <div
              key={product.id}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-32 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Product Image */}
              <div
                className={`w-full ${
                  index % 2 === 1 ? "md:order-2" : "md:order-1"
                }`}
              >
                <R2PresignedImage
                  src={product.categoryImage}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-auto rounded-lg"
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

      {/* Category Navigation Section */}
      <section className="mb-24 md:mb-32">
        <div className="flex flex-col gap-4 md:flex-row md:gap-3 lg:gap-8">
          {categoryLinks.map((categoryItem) => (
            <div
              className="relative flex-1 flex items-center justify-center flex-col"
              key={categoryItem.name}
            >
              <R2PresignedImage
                className="relative z-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                alt={categoryItem.name}
                src={categoryItem.image}
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

      {/* About Section */}
      <section className="mb-24 md:mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="uppercase text-black mb-8">
            Bringing you the <span className="text-orange">best</span> audio
            gear
          </h2>
          <p className="text-body text-black/50">
            Located at the heart of New York City, Audiophile is the premier
            store for high end headphones, earphones, speakers, and audio
            accessories. We have a large showroom and luxury demonstration rooms
            available for you to browse and experience a wide range of our
            products. Stop by our store to meet some of the fantastic people who
            make Audiophile the best place to buy your portable audio equipment.
          </p>
        </div>

        <R2PresignedImage
          src="./assets/product-yx1-earphones/mobile/image-product.jpg"
          alt="YX1 Earphones"
          width={500}
          height={500}
          expiresIn={3600}
          fetchPriority="high"
          className="w-full h-auto rounded-lg order-1 lg:order-2"
        />
      </section>
    </div>
  );
}
