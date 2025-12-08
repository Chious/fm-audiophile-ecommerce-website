import { categoryLinks } from "@/data/nav";
import { ProductService } from "@/api/modules/products/service";
import { getBlobImageUrl } from "@/utils/r2-image";
import { AboutSection } from "@/components/AboutSection";
import ProductList from "@/components/ProductList";
import { CategoryNavigation } from "@/components/CategoryNavigation";

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
  const { products } = await ProductService.getProductsByCategory(category);
  const categoryName = capitalizeFirst(category);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Hero Section */}
      <section className="py-8 md:py-16 lg:py-24 border-b border-black/10 mb-16 md:mb-24 relative">
        <div className="absolute inset-0 bg-black -z-10 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen" />
        <h1 className="text-center text-white w-full">{categoryName}</h1>
      </section>

      <ProductList products={products} />

      <CategoryNavigation />

      {/* About Section */}
      <AboutSection
        imageSrc={getBlobImageUrl(
          "./assets/shared/desktop/image-best-gear.jpg"
        )}
        alt="Best gear"
        heading={
          <h2 className="uppercase text-black mb-8 text-center">
            Bringing you the <span className="text-orange">best</span> audio
            gear
          </h2>
        }
        body={
          <p className="text-body text-black/50 text-center">
            Located at the heart of New York City, Audiophile is the premier
            store for high end headphones, earphones, speakers, and audio
            accessories. We have a large showroom and luxury demonstration rooms
            available for you to browse and experience a wide range of our
            products. Stop by our store to meet some of the fantastic people who
            make Audiophile the best place to buy your portable audio equipment.
          </p>
        }
      />
    </div>
  );
}
