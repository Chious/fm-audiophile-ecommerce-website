import Image from "next/image";
import { categoryLinks } from "@/data/nav";
import Link from "next/link";
import { getBlobImageUrl } from "@/utils/r2-image";
import FeatureProductList from "@/components/FeatureProductList";
import { AboutSection } from "@/components/AboutSection";
import { CategoryNavigation } from "@/components/CategoryNavigation";

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gap-8">
      {/* Hero */}
      <section className="relative text-white animate-fadeIn">
        <div className="absolute inset-0 bg-black -z-10 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen" />
        <div className="container mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[800px]">
          <div className="flex flex-col items-center lg:items-start justify-center">
            <p className="text-overline text-white/60 tracking-[0.5rem] mb-6 text-center lg:text-start">
              NEW PRODUCT
            </p>
            <h1 className="mb-6 uppercase text-5xl md:text-6xl font-bold leading-tight text-center lg:text-start">
              XX99 Mark II Headphones
            </h1>
            <p className="text-body text-white/80 mb-8 text-center lg:text-start">
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
          <Image
            src={getBlobImageUrl("./assets/home/tablet/image-header.jpg")}
            alt="XX99 Mark II Headphones"
            width={450}
            height={450}
            className="h-full w-auto absolute lg:relative top-0 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 -z-10 object-contain"
            fetchPriority="high"
            loading="eager"
            draggable={false}
          />
        </div>
      </section>

      {/* Categories */}
      <CategoryNavigation />

      {/* Featured Products */}
      <FeatureProductList />

      {/* Brand Story */}
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
