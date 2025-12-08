import { eq, inArray } from "drizzle-orm";
import { db } from "@/database/db";
import {
  products,
  categories,
  productImages,
  productIncludes,
  relatedProducts,
} from "@/database/schema";
import type { product, productsResponse } from "./model";

// Helper function to transform database product to frontend model
type ProductWithRelations = typeof products.$inferSelect & {
  category: typeof categories.$inferSelect;
  images: Array<typeof productImages.$inferSelect>;
  includes: Array<typeof productIncludes.$inferSelect>;
  relatedProductsData: Array<{
    relatedProduct: typeof products.$inferSelect & {
      images: Array<typeof productImages.$inferSelect>;
    };
    order: number;
  }>;
};

function transformProduct(dbProduct: ProductWithRelations): product {
  // Group images by type and size
  const imagesByType = new Map<string, Map<string, string>>();

  for (const img of dbProduct.images) {
    if (!imagesByType.has(img.type)) {
      imagesByType.set(img.type, new Map());
    }
    imagesByType.get(img.type)!.set(img.size, img.url);
  }

  // Build image objects
  const getImageObject = (type: string) => {
    const sizeMap = imagesByType.get(type);
    if (!sizeMap) return undefined;
    return {
      mobile: sizeMap.get("mobile") || "",
      tablet: sizeMap.get("tablet") || "",
      desktop: sizeMap.get("desktop") || "",
    };
  };

  const productImage = getImageObject("product");
  const categoryImage = getImageObject("category");

  // Build gallery (first, second, third based on order)
  const galleryImages = dbProduct.images
    .filter((img) => img.type === "gallery")
    .sort((a, b) => a.order - b.order);

  // Group gallery images by order (0=first, 1=second, 2=third)
  const galleryByOrder = new Map<number, Map<string, string>>();
  for (const img of galleryImages) {
    if (!galleryByOrder.has(img.order)) {
      galleryByOrder.set(img.order, new Map());
    }
    galleryByOrder.get(img.order)!.set(img.size, img.url);
  }

  // Build gallery object
  const buildGalleryImage = (order: number) => {
    const sizeMap = galleryByOrder.get(order);
    if (!sizeMap) {
      return {
        mobile: "",
        tablet: "",
        desktop: "",
      };
    }
    return {
      mobile: sizeMap.get("mobile") || "",
      tablet: sizeMap.get("tablet") || "",
      desktop: sizeMap.get("desktop") || "",
    };
  };

  const gallery: product["gallery"] = {
    first: buildGalleryImage(0),
    second: buildGalleryImage(1),
    third: buildGalleryImage(2),
  };

  // Build related products (others)
  const others: product["others"] = dbProduct.relatedProductsData
    .sort((a, b) => a.order - b.order)
    .map((rel) => {
      // Get all product images for the related product
      const relatedProductImages = rel.relatedProduct.images.filter(
        (img) => img.type === "product"
      );

      const relatedImgBySize = new Map<string, string>();
      relatedProductImages.forEach((img) => {
        relatedImgBySize.set(img.size, img.url);
      });

      return {
        slug: rel.relatedProduct.slug,
        name: rel.relatedProduct.name,
        image: {
          mobile: relatedImgBySize.get("mobile") || "",
          tablet: relatedImgBySize.get("tablet") || "",
          desktop: relatedImgBySize.get("desktop") || "",
        },
      };
    });

  // Convert price from decimal string to number
  const price = parseFloat(dbProduct.price);

  // Generate a numeric ID from slug (simple hash for backward compatibility)
  // Using a simple hash function to convert slug to number
  let numericId = 0;
  for (let i = 0; i < dbProduct.slug.length; i++) {
    numericId =
      ((numericId << 5) - numericId + dbProduct.slug.charCodeAt(i)) | 0;
  }
  numericId = Math.abs(numericId);

  return {
    id: numericId,
    slug: dbProduct.slug,
    name: dbProduct.name,
    image: productImage || {
      mobile: "",
      tablet: "",
      desktop: "",
    },
    category: dbProduct.category.slug,
    categoryImage: categoryImage || {
      mobile: "",
      tablet: "",
      desktop: "",
    },
    new: dbProduct.isNew,
    price,
    description: dbProduct.description,
    features: dbProduct.features,
    includes: dbProduct.includes
      .sort((a, b) => a.order - b.order)
      .map((inc) => ({
        quantity: inc.quantity,
        item: inc.item,
      })),
    gallery,
    others,
  };
}

export abstract class ProductService {
  static async getAllProducts(): Promise<productsResponse> {
    // Fetch all products
    const allProducts = await db.select().from(products);

    // Fetch all related data in parallel
    const [allCategories, allImages, allIncludes, allRelated] =
      await Promise.all([
        db.select().from(categories),
        db.select().from(productImages),
        db.select().from(productIncludes),
        db.select().from(relatedProducts),
      ]);

    // Build lookup maps
    const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
    const imagesMap = new Map<string, (typeof productImages.$inferSelect)[]>();
    const includesMap = new Map<
      string,
      (typeof productIncludes.$inferSelect)[]
    >();
    const relatedMap = new Map<
      string,
      (typeof relatedProducts.$inferSelect)[]
    >();

    allImages.forEach((img) => {
      if (!imagesMap.has(img.productId)) {
        imagesMap.set(img.productId, []);
      }
      imagesMap.get(img.productId)!.push(img);
    });

    allIncludes.forEach((inc) => {
      if (!includesMap.has(inc.productId)) {
        includesMap.set(inc.productId, []);
      }
      includesMap.get(inc.productId)!.push(inc);
    });

    allRelated.forEach((rel) => {
      if (!relatedMap.has(rel.productId)) {
        relatedMap.set(rel.productId, []);
      }
      relatedMap.get(rel.productId)!.push(rel);
    });

    // Transform each product
    const transformedProducts = await Promise.all(
      allProducts.map(async (product) => {
        const category = categoryMap.get(product.categoryId);
        if (!category) return null;

        const images = imagesMap.get(product.id) || [];
        const includes = (includesMap.get(product.id) || []).sort(
          (a, b) => a.order - b.order
        );

        // Fetch related products
        const relatedProductIds = (relatedMap.get(product.id) || [])
          .sort((a, b) => a.order - b.order)
          .map((r) => r.relatedProductId);

        const relatedProductsList =
          relatedProductIds.length > 0
            ? await db
                .select()
                .from(products)
                .where(inArray(products.id, relatedProductIds))
            : [];

        // Fetch images for related products
        const relatedProductImagesMap = new Map<
          string,
          (typeof productImages.$inferSelect)[]
        >();
        if (relatedProductsList.length > 0) {
          const relatedImages = await db
            .select()
            .from(productImages)
            .where(
              inArray(
                productImages.productId,
                relatedProductsList.map((p) => p.id)
              )
            );
          relatedImages.forEach((img) => {
            if (!relatedProductImagesMap.has(img.productId)) {
              relatedProductImagesMap.set(img.productId, []);
            }
            relatedProductImagesMap.get(img.productId)!.push(img);
          });
        }

        const relatedProductsData = (relatedMap.get(product.id) || [])
          .sort((a, b) => a.order - b.order)
          .map((rel) => {
            const relatedProd = relatedProductsList.find(
              (p) => p.id === rel.relatedProductId
            );
            return {
              relatedProduct: {
                ...relatedProd!,
                images: relatedProductImagesMap.get(rel.relatedProductId) || [],
              },
              order: rel.order,
            };
          })
          .filter((r) => r.relatedProduct);

        return transformProduct({
          ...product,
          category,
          images,
          includes,
          relatedProductsData,
        });
      })
    );

    return {
      products: transformedProducts.filter((p): p is product => p !== null),
    };
  }

  static async getProductBySlug(slug: string): Promise<product | undefined> {
    // Fetch product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) return undefined;

    // Fetch related data
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, product.categoryId))
      .limit(1);

    if (!category) return undefined;

    const [images, includes, related] = await Promise.all([
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id)),
      db
        .select()
        .from(productIncludes)
        .where(eq(productIncludes.productId, product.id)),
      db
        .select()
        .from(relatedProducts)
        .where(eq(relatedProducts.productId, product.id)),
    ]);

    // Fetch related products
    const relatedProductIds = related.map((r) => r.relatedProductId);
    const relatedProductsList =
      relatedProductIds.length > 0
        ? await db
            .select()
            .from(products)
            .where(inArray(products.id, relatedProductIds))
        : [];

    // Fetch images for related products
    const relatedProductImagesMap = new Map<
      string,
      (typeof productImages.$inferSelect)[]
    >();
    if (relatedProductsList.length > 0) {
      const relatedImages = await db
        .select()
        .from(productImages)
        .where(
          inArray(
            productImages.productId,
            relatedProductsList.map((p) => p.id)
          )
        );
      relatedImages.forEach((img) => {
        if (!relatedProductImagesMap.has(img.productId)) {
          relatedProductImagesMap.set(img.productId, []);
        }
        relatedProductImagesMap.get(img.productId)!.push(img);
      });
    }

    const relatedProductsData = related
      .sort((a, b) => a.order - b.order)
      .map((rel) => {
        const relatedProd = relatedProductsList.find(
          (p) => p.id === rel.relatedProductId
        );
        return {
          relatedProduct: {
            ...relatedProd!,
            images: relatedProductImagesMap.get(rel.relatedProductId) || [],
          },
          order: rel.order,
        };
      })
      .filter((r) => r.relatedProduct);

    return transformProduct({
      ...product,
      category,
      images: images.sort((a, b) => a.order - b.order),
      includes: includes.sort((a, b) => a.order - b.order),
      relatedProductsData,
    });
  }

  static async getProductsByCategory(
    category: string
  ): Promise<productsResponse> {
    // Find category by slug
    const [categoryRecord] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);

    if (!categoryRecord) {
      return { products: [] };
    }

    // Fetch products in category
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryRecord.id));

    // Use getAllProducts logic but filter by category
    // For simplicity, reuse the same transformation logic
    const allImages = await db.select().from(productImages);
    const allIncludes = await db.select().from(productIncludes);
    const allRelated = await db.select().from(relatedProducts);

    const imagesMap = new Map<string, (typeof productImages.$inferSelect)[]>();
    const includesMap = new Map<
      string,
      (typeof productIncludes.$inferSelect)[]
    >();
    const relatedMap = new Map<
      string,
      (typeof relatedProducts.$inferSelect)[]
    >();

    allImages.forEach((img) => {
      if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
      imagesMap.get(img.productId)!.push(img);
    });

    allIncludes.forEach((inc) => {
      if (!includesMap.has(inc.productId)) includesMap.set(inc.productId, []);
      includesMap.get(inc.productId)!.push(inc);
    });

    allRelated.forEach((rel) => {
      if (!relatedMap.has(rel.productId)) relatedMap.set(rel.productId, []);
      relatedMap.get(rel.productId)!.push(rel);
    });

    const transformedProducts = await Promise.all(
      categoryProducts.map(async (product) => {
        const images = imagesMap.get(product.id) || [];
        const includes = (includesMap.get(product.id) || []).sort(
          (a, b) => a.order - b.order
        );

        const relatedProductIds = (relatedMap.get(product.id) || [])
          .sort((a, b) => a.order - b.order)
          .map((r) => r.relatedProductId);

        const relatedProductsList =
          relatedProductIds.length > 0
            ? await db
                .select()
                .from(products)
                .where(inArray(products.id, relatedProductIds))
            : [];

        const relatedProductImagesMap = new Map<
          string,
          (typeof productImages.$inferSelect)[]
        >();
        if (relatedProductsList.length > 0) {
          const relatedImages = await db
            .select()
            .from(productImages)
            .where(
              inArray(
                productImages.productId,
                relatedProductsList.map((p) => p.id)
              )
            );
          relatedImages.forEach((img) => {
            if (!relatedProductImagesMap.has(img.productId)) {
              relatedProductImagesMap.set(img.productId, []);
            }
            relatedProductImagesMap.get(img.productId)!.push(img);
          });
        }

        const relatedProductsData = (relatedMap.get(product.id) || [])
          .sort((a, b) => a.order - b.order)
          .map((rel) => {
            const relatedProd = relatedProductsList.find(
              (p) => p.id === rel.relatedProductId
            );
            return {
              relatedProduct: {
                ...relatedProd!,
                images: relatedProductImagesMap.get(rel.relatedProductId) || [],
              },
              order: rel.order,
            };
          })
          .filter((r) => r.relatedProduct);

        return transformProduct({
          ...product,
          category: categoryRecord,
          images,
          includes,
          relatedProductsData,
        });
      })
    );

    return { products: transformedProducts };
  }
}
