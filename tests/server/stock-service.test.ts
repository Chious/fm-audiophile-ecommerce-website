import { describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { app } from "@/api/[[...slugs]]/route";
import seed from "@/database/seed";
import { db } from "@/database/db";
import { products, stockReservations, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const BASE_URL = "http://localhost:8080/api";

describe("Stock Reservation via Cart API", () => {
  let testProductId: string;

  beforeAll(async () => {
    await seed(true);

    // Get a product to test with
    const [product] = await db.select().from(products).limit(1);
    testProductId = product.id;

    // Create test users
    const testUsers = [
      "stock-user-1",
      "stock-user-2",
      "stock-user-a",
      "stock-user-b",
      "stock-user-concurrent-1",
      "stock-user-concurrent-2",
    ];
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

  beforeEach(async () => {
    // Reset stock and reservations before each test
    await db
      .update(products)
      .set({ stock: 50 })
      .where(eq(products.id, testProductId));
    await db
      .delete(stockReservations)
      .where(eq(stockReservations.productId, testProductId));
  });

  it("POST /cart should reserve stock successfully", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 10,
          userId: "stock-user-1",
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.reservationId).toBeDefined();

    // Verify reservation was created in DB
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.productId, testProductId));

    expect(reservations.length).toBe(1);
    expect(reservations[0].quantity).toBe(10);
    expect(reservations[0].userId).toBe("stock-user-1");
  });

  it("POST /cart should fail when requesting more than available stock", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 51, // More than 50 available
          userId: "stock-user-2",
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Insufficient stock");

    // Verify no reservation was created
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.productId, testProductId));

    expect(reservations.length).toBe(0);
  });

  it("POST /cart should account for existing reservations", async () => {
    // First reservation: 30 units
    const res1 = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 30,
          userId: "stock-user-a",
        }),
      })
    );

    expect(res1.status).toBe(200);

    // Second reservation: 25 units (should fail, only 20 available)
    const res2 = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 25,
          userId: "stock-user-b",
        }),
      })
    );

    const json2 = await res2.json();
    expect(res2.status).toBe(400);
    expect(json2.success).toBe(false);
    expect(json2.message).toBe("Insufficient stock");

    // Third reservation: 20 units (should succeed, exactly 20 available)
    const res3 = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 20,
          userId: "stock-user-b",
        }),
      })
    );

    expect(res3.status).toBe(200);
    const json3 = await res3.json();
    expect(json3.success).toBe(true);
  });

  it("POST /cart should handle concurrent reservations correctly", async () => {
    // Make two concurrent requests for 25 units each (total 50, which is all available)
    const [res1, res2] = await Promise.all([
      app.handle(
        new Request(`${BASE_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: testProductId,
            quantity: 25,
            userId: "stock-user-concurrent-1",
          }),
        })
      ),
      app.handle(
        new Request(`${BASE_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: testProductId,
            quantity: 25,
            userId: "stock-user-concurrent-2",
          }),
        })
      ),
    ]);

    const json1 = await res1.json();
    const json2 = await res2.json();

    // Both should succeed (exactly 50 units total)
    expect(json1.success).toBe(true);
    expect(json2.success).toBe(true);

    // Verify total reserved equals 50
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.productId, testProductId));

    const totalReserved = reservations.reduce((sum, r) => sum + r.quantity, 0);
    expect(totalReserved).toBe(50);
  });

  it("POST /cart should fail for invalid quantity", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 0,
          userId: "stock-user-1",
        }),
      })
    );

    // 422 Unprocessable Entity for validation errors
    expect(res.status).toBe(422);
  });

  it("POST /cart should require userId or sessionId", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: testProductId,
          quantity: 5,
          // No userId or sessionId
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
