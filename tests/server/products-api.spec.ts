import { describe, expect, it } from "bun:test";
import { app } from "@/api/[[...slugs]]/route";

describe("Products API server (bun test)", () => {
  const call = async (path: string) => {
    const req = new Request(`http://localhost${path}`);
    return app.handle(req);
  };

  it("responds at API root", async () => {
    const res = await call("/api");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ message: "Hello from Elysia + Next.js" });
  });

  it("lists products with pagination", async () => {
    const res = await call("/api/products?page=1&limit=2");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.meta?.page).toBe(1);
  });

  it("filters products by category", async () => {
    const res = await call("/api/products?category=headphones");
    expect(res.status).toBe(200);
    const body = await res.json();
    if (Array.isArray(body.products) && body.products.length > 0) {
      const allHeadphones = body.products.every(
        (p: { category?: string }) => p.category === "headphones"
      );
      expect(allHeadphones).toBe(true);
    }
  });

  it("returns 404 for missing product slug", async () => {
    const res = await call("/api/products/non-existent-slug");
    expect(res.status).toBe(404);
  });

  it("returns product detail for an existing slug", async () => {
    const listRes = await call("/api/products?limit=1");
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const first = listBody.products?.[0];
    if (!first?.slug) {
      // No products seeded; skip detail check gracefully
      return;
    }
    const detailRes = await call(`/api/products/${first.slug}`);
    expect(detailRes.status).toBe(200);
    const detailBody = await detailRes.json();
    expect(detailBody.product.slug).toBe(first.slug);
  });
});
