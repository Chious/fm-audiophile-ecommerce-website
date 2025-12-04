import { Elysia, t } from "elysia";
import { ProductService } from "./service";
import { productsResponse, productResponse } from "./model";

export const products = new Elysia({ prefix: "/products" })
  // List all products
  .get(
    "/",
    () => {
      return ProductService.getAllProducts();
    },
    {
      detail: {
        tags: ["products"],
        summary: "List all products",
        description:
          "Return the full product catalogue including basic pricing and metadata. 適合用於首頁或類別頁一次載入所有商品資料。",
      },
      response: {
        200: productsResponse,
      },
    }
  )
  // List products by category
  .get(
    "/category/:category",
    ({ params }) => {
      return ProductService.getProductsByCategory(params.category);
    },
    {
      detail: {
        tags: ["products"],
        summary: "List products by category",
        description:
          "Filter products by category (e.g. `headphones`, `speakers`, `earphones`). 取得特定類別下的所有商品。",
      },
      params: t.Object({
        category: t.String({
          description:
            "Product category slug (e.g. `headphones`, `speakers`, `earphones`).",
          examples: ["headphones"],
        }),
      }),
      response: {
        200: productsResponse,
      },
    }
  )
  // Get single product by slug
  .get(
    "/:slug",
    ({ params, set }) => {
      const product = ProductService.getProductBySlug(params.slug);
      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }
      return { product };
    },
    {
      detail: {
        tags: ["products"],
        summary: "Get product detail",
        description:
          "Fetch a single product by its slug, including gallery, included items, and related products. 取得單一商品的完整詳情。",
      },
      params: t.Object({
        slug: t.String({
          description: "Product slug (unique identifier in URLs).",
          examples: ["xx99-mark-two-headphones"],
        }),
      }),
      response: {
        200: productResponse,
        404: t.Object({
          error: t.String({
            description: "Error message when the product is not found.",
            examples: ["Product not found"],
          }),
        }),
      },
    }
  );
