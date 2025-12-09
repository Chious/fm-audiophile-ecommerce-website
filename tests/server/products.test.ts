import { describe, expect, it, beforeAll } from "bun:test";
import { products } from "@/api/modules/products";
import seed from "@/database/seed";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const BASE_URL = "http://localhost:8080";

describe("Products API Integration", () => {
  beforeAll(async () => {
    await seed(true);
  });

  // --- 1. Standardized Responses & PRD Match ---
  it("GET /products should return standardized list format with full PRD fields", async () => {
    const res = await products.handle(new Request(`${BASE_URL}/products`));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("products");
    expect(json).toHaveProperty("meta");

    const product = json.products[0];
    // Core fields
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("slug");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("category");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("stock");
    expect(product).toHaveProperty("description");
    expect(product).toHaveProperty("features");

    // Type checks
    expect(typeof product.price).toBe("number");
    expect(typeof product.new).toBe("boolean");

    // Nested objects (PRD strict match)
    expect(product.image).toHaveProperty("mobile");
    expect(product.image).toHaveProperty("tablet");
    expect(product.image).toHaveProperty("desktop");

    // Relationships
    // Note: List view might not return full details for performance,
    // but verifying they exist if expected is good.
    // Usually list view includes main image, maybe new flag.
  });

  // --- 2. Pagination ---
  it("GET /products should support pagination", async () => {
    // Request page 2, limit 2
    const res = await products.handle(
      new Request(`${BASE_URL}/products?page=2&limit=2`)
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.meta.page).toBe(2);
    expect(json.meta.limit).toBe(2);
    expect(json.products.length).toBeLessThanOrEqual(2);
  });

  // --- 3. Filtering ---
  it("GET /products/category/:category returns filtered results", async () => {
    const category = "headphones";
    const res = await products.handle(
      new Request(`${BASE_URL}/products/category/${category}`)
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.products.length).toBeGreaterThan(0);
    json.products.forEach((p: any) => {
      expect(p.category).toBe(category);
    });
  });

  it("GET /products/category/:category returns empty list for invalid category", async () => {
    const res = await products.handle(
      new Request(`${BASE_URL}/products/category/flying-cars`)
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.products).toEqual([]);
  });

  // --- 4. Single Product Details ---
  it("GET /products/:slug should return full product details", async () => {
    // First get a valid slug from list
    const listRes = await products.handle(new Request(`${BASE_URL}/products`));
    const listJson = await listRes.json();
    const slug = listJson.products[0].slug;

    const res = await products.handle(
      new Request(`${BASE_URL}/products/${slug}`)
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    const product = json.product; // Usually detail endpoint wraps in { product: ... } or returns direct object.
    // Based on previous test it seems list returns { products: [] }, let's assume detail returns { product: {} } or {}
    // We'll check the structure. If your API returns the object directly, remove .product

    // Adjust this expectation based on your actual API response structure for detail
    const productData = json.product || json;

    expect(productData.slug).toBe(slug);
    expect(productData).toHaveProperty("includes"); // Box items
    expect(productData).toHaveProperty("gallery"); // Gallery images
    expect(productData).toHaveProperty("others"); // Related products

    // Verify includes structure
    if (productData.includes.length > 0) {
      expect(productData.includes[0]).toHaveProperty("quantity");
      expect(productData.includes[0]).toHaveProperty("item");
    }

    // Verify gallery structure
    expect(productData.gallery).toHaveProperty("first");
    expect(productData.gallery).toHaveProperty("second");
    expect(productData.gallery).toHaveProperty("third");
  });

  it("GET /products/:slug should return 404 for non-existent product", async () => {
    const res = await products.handle(
      new Request(`${BASE_URL}/products/this-slug-does-not-exist`)
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({ error: "Product not found" });
  });
});
