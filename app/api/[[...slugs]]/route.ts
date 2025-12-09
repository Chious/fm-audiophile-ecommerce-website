import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import { cart } from "@/api/modules/cart";
import { products } from "@/api/modules/products";
import { checkout } from "@/api/modules/checkout";
import { admin } from "@/api/modules/admin";
import { health } from "@/api/modules/health";
import { cors } from "@elysiajs/cors";
import { ip } from "elysia-ip";
import { DefaultContext, type Generator, rateLimit } from "elysia-rate-limit";
import type { SocketAddress } from "bun";
import { auth, BetterAuthOpenAPI } from "@/lib/auth";

const ipGenerator: Generator<{ ip: SocketAddress }> = (_r, _s, { ip }) =>
  ip?.address ?? "unknown";

export const app = new Elysia({ prefix: "/api" })
  .use(ip())
  .use(
    cors({
      origin: [
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        process.env.SITE_URL || "http://localhost:3000",
        "http://localhost:3000",
        "http://localhost:8080",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "RSC",
        "Next-Action",
        "Next-Router-Prefetch",
        "Next-Router-State-Tree",
      ],
      credentials: true,
      maxAge: 86400,
    })
  )
  .use(
    rateLimit({
      duration: 60_000,
      max: 100,
      headers: true,
      scoping: "scoped",
      countFailedRequest: true,
      errorResponse: new Response(
        JSON.stringify({
          error: "Too many requests",
        }),
        { status: 429 }
      ),
      generator: ipGenerator,
      context: new DefaultContext(10_000),
    })
  )
  .use(
    (async () => {
      const [betterAuthPaths, betterAuthComponents] = await Promise.all([
        BetterAuthOpenAPI.getPaths("/api/auth"),
        BetterAuthOpenAPI.components(),
      ]);

      return openapi({
        path: "/docs",
        documentation: {
          info: {
            title: "Audiophile API",
            description:
              "API for products, cart and checkout for the Audiophile ecommerce site.",
            version: "1.0.0",
          },
          tags: [
            {
              name: "health",
              description: "Health check endpoints. 健康檢查 API。",
            },
            {
              name: "auth",
              description:
                "Authentication endpoints for user sign-up, sign-in, sign-out, and session management. 用戶認證相關 API（註冊、登入、登出、會話管理）。",
            },
            {
              name: "products",
              description: "Product catalogue endpoints. 商品目錄相關 API。",
            },
            {
              name: "cart",
              description: "Cart calculation endpoints. 購物車計算與合計 API。",
            },
            {
              name: "checkout",
              description: "Checkout and order endpoints. 結帳流程相關 API。",
            },
            {
              name: "admin",
              description:
                "Admin management endpoints for products, categories, and clients. 商品／分類／客戶後台管理用 API（不建議直接對外公開）。",
            },
          ],
          // Better Auth OpenAPI types are compatible at runtime but not in TypeScript
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          components: betterAuthComponents as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paths: betterAuthPaths as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
    })()
  )
  .get("/", () => ({ message: "Hello from Elysia + Next.js" }), {
    detail: {
      summary: "API root",
      description:
        "Simple health-check style endpoint for the Audiophile API. 可用來確認 API 是否正常運作。",
    },
  })
  .mount("/auth", auth.handler)
  .use(health)
  .use(cart)
  .use(products)
  .use(checkout)
  .use(admin);

export type App = typeof app;

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
