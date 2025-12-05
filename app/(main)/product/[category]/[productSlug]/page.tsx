import Link from "next/link";
import Image from "next/image";
import { getBlobImageUrl, getResponsiveBlobImageUrl } from "@/utils/r2-image";
import ProductAddToCart from "@/components/ProductAddToCart";
import { ProductService } from "@/api/modules/products/service";
import productsData from "@/data/data.json";

export const revalidate = 3600;

async function getProductBySlug(slug: string) {
  return ProductService.getProductBySlug(slug) || null;
}

export async function generateStaticParams() {
  const products = productsData as Array<{
    category: string;
    slug: string;
  }>;

  return products.map((product) => ({
    category: product.category,
    productSlug: product.slug,
  }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; productSlug: string }>;
}) {
  const { category, productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-24 text-center">
        <h2 className="mb-4">Product not found</h2>
        <p className="text-body text-black/50 mb-8">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href={`/product/${category}`}
          className="uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors inline-block"
        >
          Back to {category}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24 lg:mb-32 mt-8">
        <Link
          href={`/product/${category}`}
          className="text-body text-black/50 hover:text-orange mb-6 md:mb-14 inline-block transition-colors"
        >
          Go Back
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-32 items-center">
          {/* Product Image */}
          <div className="w-full relative aspect-square">
            <Image
              src={getResponsiveBlobImageUrl(product.image)}
              alt={product.name}
              fill
              className="w-full h-auto rounded-lg"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {product.new && (
              <h6 className="text-orange text-overline">NEW PRODUCT</h6>
            )}
            <h2 className="text-black">{product.name}</h2>
            <p className="text-body text-black/50">{product.description}</p>
            <h6 className="text-black">{formatPrice(product.price)}</h6>
            <ProductAddToCart product={product} />
          </div>
        </div>
      </section>

      {/* Features and In the Box Section */}
      <section className="mb-24 md:mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
        {/* Features */}
        <div>
          <h2 className="uppercase mb-6 md:mb-8">Features</h2>
          <p className="text-body text-black/50 whitespace-pre-line">
            {product.features}
          </p>
        </div>

        {/* In the Box */}
        <div>
          <h2 className="uppercase mb-6 md:mb-8">In the Box</h2>
          <ul className="flex flex-col gap-2">
            {product.includes.map(
              (item: (typeof product.includes)[number], index: number) => (
                <li key={index} className="text-body text-black/50">
                  <span className="text-orange font-bold mr-2">
                    {item.quantity}x
                  </span>
                  {item.item}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mb-24 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="flex flex-col gap-4 md:gap-5">
            <Image
              src={getResponsiveBlobImageUrl(product.gallery.first)}
              alt={`${product.name} gallery 1`}
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
            />
            <Image
              src={getResponsiveBlobImageUrl(product.gallery.second)}
              alt={`${product.name} gallery 2`}
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div>
            <Image
              src={getResponsiveBlobImageUrl(product.gallery.third)}
              alt={`${product.name} gallery 3`}
              width={600}
              height={800}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="mb-24 md:mb-32">
        <h2 className="uppercase text-center mb-10 md:mb-14">
          You May Also Like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8">
          {product.others.map((item: (typeof product.others)[number]) => (
            <div
              key={item.slug}
              className="flex flex-col items-center gap-6 md:gap-8"
            >
              <Image
                src={getResponsiveBlobImageUrl(item.image)}
                alt={item.name}
                width={300}
                height={300}
                className="w-full h-auto rounded-lg"
              />
              <h5 className="text-black text-center">{item.name}</h5>
              <Link
                href={`/product/${category}/${item.slug}`}
                className="uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors"
              >
                See Product
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
