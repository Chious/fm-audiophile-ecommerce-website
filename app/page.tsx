import R2PresignedImage from "@/components/R2PresignedImage";
import { categoryLinks } from "@/data/nav";
import Link from "next/link";

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-overline text-white/60 tracking-[0.5rem] mb-6">
              NEW PRODUCT
            </p>
            <h1 className="mb-6 uppercase text-5xl md:text-6xl font-bold leading-tight">
              XX99 Mark II Headphones
            </h1>
            <p className="text-body text-white/80 mb-8">
              Experience natural, lifelike audio and exceptional build quality
              made for the passionate music enthusiast.
            </p>
            <Link
              href="/product/headphones/xx99-mark-two-headphones"
              className="inline-block bg-orange text-white uppercase px-10 py-4 tracking-widest hover:bg-orange-light transition-colors"
            >
              See Product
            </Link>
          </div>
          <div className="flex justify-center">
            <R2PresignedImage
              src="./assets/product-xx99-mark-two-headphones/desktop/image-product.jpg"
              alt="XX99 Mark II Headphones"
              width={450}
              height={450}
              className="w-72 md:w-96 h-auto"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryLinks.map((category) => (
            <div
              key={category.name}
              className="bg-gray rounded-lg pt-20 pb-8 px-8 text-center relative"
            >
              <R2PresignedImage
                alt={category.name}
                src={category.image}
                width={160}
                height={160}
                className="absolute -top-12 left-1/2 -translate-x-1/2"
              />
              <h4 className="uppercase mb-4">{category.name}</h4>
              <Link
                href={category.link}
                className="text-sm uppercase tracking-[0.5rem] text-black/50 hover:text-orange transition-colors after-arrow-right"
              >
                Shop
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {/* ZX9 */}
        <div className="bg-orange rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center px-10 py-12 text-white">
          <div className="flex justify-center">
            <R2PresignedImage
              src="./assets/product-zx9-speaker/desktop/image-product.jpg"
              alt="ZX9 Speaker"
              width={300}
              height={300}
              className="w-48 md:w-64 lg:w-72"
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
        <div className="bg-gray rounded-lg overflow-hidden px-10 py-12 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-6">ZX7 Speaker</h2>
            <Link
              href="/product/speakers/zx7-speaker"
              className="inline-block border border-black text-black uppercase px-10 py-4 tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              See Product
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <R2PresignedImage
              src="./assets/product-zx7-speaker/desktop/image-product.jpg"
              alt="ZX7 Speaker"
              width={300}
              height={300}
              className="w-40 md:w-48 lg:w-56"
            />
          </div>
        </div>

        {/* YX1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <R2PresignedImage
            src="./assets/product-yx1-earphones/desktop/image-product.jpg"
            alt="YX1 Earphones"
            width={600}
            height={400}
            className="rounded-lg w-full h-full object-cover"
          />
          <div className="bg-gray rounded-lg px-10 py-12 flex flex-col justify-center">
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

      {/* Brand Story */}
      <section className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="uppercase text-black mb-8">
            Bringing you the <span className="text-orange">best</span> audio
            gear
          </h2>
          <p className="text-body text-black/50">
            Located at the heart of New York City, Audiophile is the premier
            store for high end headphones, earphones, speakers, and audio
            accessories. Stop by our store to meet some of the fantastic people
            who make Audiophile the best place to buy your portable audio
            equipment.
          </p>
        </div>
        <R2PresignedImage
          src="./assets/shared/desktop/image-best-gear.jpg"
          alt="Best gear"
          width={500}
          height={500}
          className="rounded-lg w-full h-auto"
        />
      </section>
    </div>
  );
}
