import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import { r2 } from "@/api/modules/r2";
import { cart } from "@/api/modules/cart";
import { products } from "@/api/modules/products";
import { checkout } from "@/api/modules/checkout";

const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "Audiophile API",
          description:
            "API for products, cart, checkout, and R2 assets for the Audiophile ecommerce site.",
          version: "1.0.0",
        },
        tags: [
          { name: "products", description: "Product catalogue endpoints" },
          { name: "cart", description: "Cart calculation endpoints" },
          { name: "checkout", description: "Checkout and order endpoints" },
          { name: "r2", description: "R2 presigned URL endpoints" },
        ],
      },
    })
  )
  .get("/", () => ({ message: "Hello from Elysia + Next.js" }), {
    detail: {
      summary: "API root",
      description:
        "Simple health-check style endpoint for the Audiophile API. 可用來確認 API 是否正常運作。",
    },
  })
  .use(r2)
  .use(cart)
  .use(products)
  .use(checkout);

export type App = typeof app;

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
