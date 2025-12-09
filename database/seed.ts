import { db } from "./db";
import {
  categories,
  products,
  productImages,
  productIncludes,
  relatedProducts,
  orderItems,
  orders,
  stockReservations,
} from "./schema";
import productsData from "../data/data.json";

// Type definitions for product data
type ImageSizes = {
  mobile: string;
  tablet: string;
  desktop: string;
};

type ProductInclude = {
  quantity: number;
  item: string;
};

type RelatedProduct = {
  slug: string;
  name: string;
  image: ImageSizes;
};

type ProductData = {
  id?: number;
  slug: string;
  name: string;
  category: string;
  image?: ImageSizes;
  categoryImage?: ImageSizes;
  new?: boolean;
  price: number;
  description: string;
  features: string;
  includes?: ProductInclude[];
  gallery?: {
    first?: ImageSizes;
    second?: ImageSizes;
    third?: ImageSizes;
  };
  others?: RelatedProduct[];
};

type ProductsData = ProductData[];

async function seed(force: boolean = false) {
  // Skip seeding in production environment
  if (process.env.NODE_ENV === "production") {
    console.log("⚠️  Skipping database seed in production environment");
    console.log("   Database seeding should only be done in development");
    return;
  }

  console.log("🌱 Starting database seed...");

  try {
    // Check if database already has data
    if (!force) {
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) {
        console.log("✅ Database already has data. Skipping seed.");
        console.log("   To force re-seed, run: bun run db:seed --force");
        return;
      }
    }

    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(stockReservations);
    await db.delete(relatedProducts);
    await db.delete(productIncludes);
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(categories);

    // Seed categories
    console.log("📦 Seeding categories...");
    const categoryMap = new Map<string, string>();

    const uniqueCategories = Array.from(
      new Set((productsData as ProductsData).map((p) => String(p.category)))
    );

    for (const catSlug of uniqueCategories) {
      const [category] = await db
        .insert(categories)
        .values({
          slug: catSlug,
          name: catSlug[0]?.toUpperCase() + catSlug.slice(1),
          description: `Category for ${catSlug}`,
        })
        .returning({ id: categories.id });

      if (category) {
        categoryMap.set(catSlug, category.id);
      }
    }

    // Seed products
    console.log("🛍️ Seeding products...");
    const productMap = new Map<string, string>();

    for (const productData of productsData as ProductsData) {
      const categoryId = categoryMap.get(productData.category);
      if (!categoryId) {
        console.warn(`Category not found for product: ${productData.slug}`);
        continue;
      }

      const [product] = await db
        .insert(products)
        .values({
          slug: productData.slug,
          name: productData.name,
          categoryId,
          price: productData.price.toString(),
          stock: 100, // Default stock for seed data
          isNew: Boolean(productData.new),
          description: productData.description,
          features: productData.features,
        })
        .returning({ id: products.id });

      if (product) {
        productMap.set(productData.slug, product.id);
      }
    }

    // Seed product images
    console.log("🖼️ Seeding product images...");
    for (const productData of productsData as ProductsData) {
      const productId = productMap.get(productData.slug);
      if (!productId) continue;

      // Main product image
      if (productData.image) {
        await db.insert(productImages).values([
          {
            productId,
            type: "product",
            size: "mobile",
            url: productData.image.mobile,
            order: 0,
          },
          {
            productId,
            type: "product",
            size: "tablet",
            url: productData.image.tablet,
            order: 0,
          },
          {
            productId,
            type: "product",
            size: "desktop",
            url: productData.image.desktop,
            order: 0,
          },
        ]);
      }

      // Category image
      if (productData.categoryImage) {
        await db.insert(productImages).values([
          {
            productId,
            type: "category",
            size: "mobile",
            url: productData.categoryImage.mobile,
            order: 0,
          },
          {
            productId,
            type: "category",
            size: "tablet",
            url: productData.categoryImage.tablet,
            order: 0,
          },
          {
            productId,
            type: "category",
            size: "desktop",
            url: productData.categoryImage.desktop,
            order: 0,
          },
        ]);
      }

      // Gallery images
      if (productData.gallery) {
        const galleryEntries: Array<{
          key: "first" | "second" | "third";
          order: number;
        }> = [
          { key: "first", order: 0 },
          { key: "second", order: 1 },
          { key: "third", order: 2 },
        ];

        for (const { key, order } of galleryEntries) {
          const galleryImage = productData.gallery[key];
          if (galleryImage) {
            await db.insert(productImages).values([
              {
                productId,
                type: "gallery",
                size: "mobile",
                url: galleryImage.mobile,
                order,
              },
              {
                productId,
                type: "gallery",
                size: "tablet",
                url: galleryImage.tablet,
                order,
              },
              {
                productId,
                type: "gallery",
                size: "desktop",
                url: galleryImage.desktop,
                order,
              },
            ]);
          }
        }
      }

      // Related product images (for "others" array)
      if (productData.others && Array.isArray(productData.others)) {
        for (let i = 0; i < productData.others.length; i++) {
          const related = productData.others[i];
          if (related?.image) {
            await db.insert(productImages).values([
              {
                productId,
                type: "related",
                size: "mobile",
                url: related.image.mobile,
                order: i,
              },
              {
                productId,
                type: "related",
                size: "tablet",
                url: related.image.tablet,
                order: i,
              },
              {
                productId,
                type: "related",
                size: "desktop",
                url: related.image.desktop,
                order: i,
              },
            ]);
          }
        }
      }
    }

    // Seed product includes
    console.log("📋 Seeding product includes...");
    for (const productData of productsData as ProductsData) {
      const productId = productMap.get(productData.slug);
      if (!productId || !Array.isArray(productData.includes)) continue;

      for (let i = 0; i < productData.includes.length; i++) {
        const include = productData.includes[i];
        await db.insert(productIncludes).values({
          productId,
          quantity: include.quantity,
          item: include.item,
          order: i,
        });
      }
    }

    // Seed related products
    console.log("🔗 Seeding related products...");
    for (const productData of productsData as ProductsData) {
      const productId = productMap.get(productData.slug);
      if (!productId || !Array.isArray(productData.others)) continue;

      for (let i = 0; i < productData.others.length; i++) {
        const relatedSlug = productData.others[i]?.slug;
        const relatedProductId = productMap.get(relatedSlug);
        if (relatedProductId) {
          await db.insert(relatedProducts).values({
            productId,
            relatedProductId,
            order: i,
          });
        }
      }
    }

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
// For Bun/Node.js compatibility
if (
  (import.meta as { main?: boolean }).main ||
  (typeof require !== "undefined" && require.main === module)
) {
  const force = process.argv.includes("--force");
  seed(force)
    .then(() => {
      console.log("Seed script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed script failed:", error);
      process.exit(1);
    });
}

export default seed;
