import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/api/[[...slugs]]/route";
import seed from "@/database/seed";
import { db } from "@/database/db";
import { products, stockReservations, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const BASE_URL = "http://localhost:8080/api";

describe("Cart API Integration", () => {
  let testProductId: string;

  beforeAll(async () => {
    await seed(true);
    // Get a product to test with
    const [product] = await db.select().from(products).limit(1);
    testProductId = product.id;

    // Ensure known stock
    await db
      .update(products)
      .set({ stock: 50 })
      .where(eq(products.id, testProductId));
    // Clear reservations
    await db
      .delete(stockReservations)
      .where(eq(stockReservations.productId, testProductId));

    // Create test users
    const testUsers = ["test-user-api", "test-user-api-fail"];
    for (const userId of testUsers) {
      await db
        .insert(users)
        .values({
          id: userId,
          name: userId,
          email: `${userId}@example.com`,
          role: "consumer",
        })
        .onConflictDoNothing();
    }
  });

  it("POST /cart should add item and reserve stock", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 5,
          userId: "test-user-api",
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.reservationId).toBeDefined();

    // Verify reservation in DB
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.productId, testProductId));

    // We might have other reservations from other tests if DB wasn't fully cleared,
    // but we cleared it in beforeAll.
    const myReservation = reservations.find(
      (r) => r.userId === "test-user-api"
    );
    expect(myReservation).toBeDefined();
    expect(myReservation?.quantity).toBe(5);
  });

  it("POST /cart should fail if insufficient stock", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 100, // More than 50
          userId: "test-user-api-fail",
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Insufficient stock");
  });
});
