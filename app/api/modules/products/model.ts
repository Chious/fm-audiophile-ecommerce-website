import { t } from "elysia";

export const productImage = t.Object({
  mobile: t.String({
    description: "Path to mobile-sized image asset.",
  }),
  tablet: t.String({
    description: "Path to tablet-sized image asset.",
  }),
  desktop: t.String({
    description: "Path to desktop-sized image asset.",
  }),
});

export const productIncludes = t.Object({
  quantity: t.Number({
    description: "Number of this item included in the box.",
  }),
  item: t.String({
    description: "Description of the included item (e.g. 'User manual').",
  }),
});

export const productGallery = t.Object({
  first: productImage,
  second: productImage,
  third: productImage,
});

export const productOthers = t.Object({
  slug: t.String({
    description: "Slug of the related product.",
  }),
  name: t.String({
    description: "Display name of the related product.",
  }),
  image: productImage,
});

export const product = t.Object({
  id: t.Number({
    description: "Numeric product identifier.",
  }),
  slug: t.String({
    description: "URL-friendly unique identifier for the product.",
  }),
  name: t.String({
    description: "Display name of the product.",
  }),
  image: productImage,
  category: t.String({
    description: "Product category (e.g. 'headphones', 'speakers').",
  }),
  categoryImage: productImage,
  new: t.Boolean({
    description: "Whether the product is marked as 'new'.",
  }),
  price: t.Number({
    description: "Unit price in USD.",
  }),
  description: t.String({
    description: "Marketing description of the product.",
  }),
  features: t.String({
    description: "Detailed feature description text (may contain line breaks).",
  }),
  includes: t.Array(productIncludes, {
    description: "List of items included in the box.",
  }),
  gallery: productGallery,
  others: t.Array(productOthers, {
    description: "List of recommended / related products.",
  }),
});

export type product = typeof product.static;

export const productResponse = t.Object({
  product: product,
});

export type productResponse = typeof productResponse.static;

export const productsMeta = t.Object({
  page: t.Number({
    description: "Current page number (1-indexed).",
    minimum: 1,
  }),
  limit: t.Number({
    description: "Maximum items per page.",
    minimum: 1,
  }),
  total: t.Number({
    description: "Total number of products after filters.",
    minimum: 0,
  }),
  category: t.Union(
    [
      t.String({
        description: "Applied category filter slug.",
      }),
      t.Null({
        description: "No category filter applied.",
      }),
    ],
    { description: "Current category filter, if any." }
  ),
});

export const productsResponse = t.Object({
  products: t.Array(product, {
    description: "Array of products.",
  }),
  meta: t.Optional(productsMeta),
});

export type productsResponse = typeof productsResponse.static;
