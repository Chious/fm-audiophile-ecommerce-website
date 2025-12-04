import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import { r2 } from "@/api/modules/r2";
import { cart } from "@/api/modules/cart";
import { products } from "@/api/modules/products";
import { checkout } from "@/api/modules/checkout";

const app = new Elysia({ prefix: "/api" })
  .use(openapi())
  .get("/", () => ({ message: "Hello from Elysia + Next.js" }))
  .use(r2)
  .use(cart)
  .use(products)
  .use(checkout);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
