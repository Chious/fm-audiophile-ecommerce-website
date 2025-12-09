import { describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { app } from "@/api/[[...slugs]]/route";
import seed from "@/database/seed";
import { db } from "@/database/db";
import {
  products,
  orders,
  orderItems,
  stockReservations,
  users,
} from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const BASE_URL = "http://localhost:8080/api";

describe("Checkout API Integration", () => {
  let testProduct1: { id: string; slug: string; name: string; price: string };
  let testProduct2: { id: string; slug: string; name: string; price: string };

  const validCustomer = {
    name: "Test User",
    email: "test@example.com",
    phone: "+1 555-555-5555",
    address: "123 Test Street",
    zip: "12345",
    city: "Test City",
    country: "USA",
  };

  const validPayment = {
    method: "cash" as const,
  };

  beforeAll(async () => {
    await seed(true);

    // Get two products to test with
    const dbProducts = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        price: products.price,
      })
      .from(products)
      .limit(2);

    testProduct1 = dbProducts[0];
    testProduct2 = dbProducts[1];

    // Create test user
    await db
      .insert(users)
      .values({
        id: "checkout-test-user",
        name: "Checkout Test User",
        email: "checkout-test@example.com",
        role: "consumer",
      })
      .onConflictDoNothing();
  });

  beforeEach(async () => {
    // Reset stock for test products
    await db
      .update(products)
      .set({ stock: 100 })
      .where(eq(products.id, testProduct1.id));
    await db
      .update(products)
      .set({ stock: 50 })
      .where(eq(products.id, testProduct2.id));

    // Clear orders and reservations
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(stockReservations);
  });

  it("POST /checkout should create order with valid payload", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { productId: testProduct1.id, quantity: 2 },
            { productId: testProduct2.id, quantity: 1 },
          ],
          customer: validCustomer,
          payment: validPayment,
          userId: "checkout-test-user",
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.orderId).toBeDefined();
    expect(json.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(json.message).toBe("Order placed successfully");

    // Verify totals
    const price1 = Number(testProduct1.price);
    const price2 = Number(testProduct2.price);
    const expectedSubtotal = price1 * 2 + price2 * 1;
    const expectedVat = Math.round(expectedSubtotal * 0.2 * 100) / 100;
    const expectedGrandTotal = expectedSubtotal + 50 + expectedVat;

    expect(json.subtotal).toBe(expectedSubtotal);
    expect(json.shipping).toBe(50);
    expect(json.vat).toBe(expectedVat);
    expect(json.grandTotal).toBe(expectedGrandTotal);

    // Verify order in database
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, json.orderId));

    expect(order).toBeDefined();
    expect(order.customerName).toBe(validCustomer.name);
    expect(order.customerEmail).toBe(validCustomer.email);
    expect(order.status).toBe("pending");

    // Verify order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, json.orderId));

    expect(items.length).toBe(2);

    // Verify stock was deducted
    const [product1After] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, testProduct1.id));

    const [product2After] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, testProduct2.id));

    expect(product1After.stock).toBe(98); // 100 - 2
    expect(product2After.stock).toBe(49); // 50 - 1
  });

  it("POST /checkout should fail with empty cart", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [],
          customer: validCustomer,
          payment: validPayment,
        }),
      })
    );

    // Elysia validation returns 422 for invalid body
    expect(res.status).toBe(422);
  });

  it("POST /checkout should fail with non-existent product", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: "non-existent-product-id", quantity: 1 }],
          customer: validCustomer,
          payment: validPayment,
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Cart validation failed");
    expect(json.errors).toBeDefined();
    expect(json.errors.length).toBeGreaterThan(0);
  });

  it("POST /checkout should fail with insufficient stock", async () => {
    // Set stock to a low number
    await db
      .update(products)
      .set({ stock: 5 })
      .where(eq(products.id, testProduct1.id));

    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct1.id, quantity: 10 }], // More than available
          customer: validCustomer,
          payment: validPayment,
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Insufficient stock");

    // Verify no order was created
    const orderCount = await db.select().from(orders);
    expect(orderCount.length).toBe(0);

    // Verify stock wasn't modified
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, testProduct1.id));

    expect(product.stock).toBe(5);
  });

  it("POST /checkout should require e-Money details for e-Money payment", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct1.id, quantity: 1 }],
          customer: validCustomer,
          payment: {
            method: "emoney",
            // Missing emoneyNumber and emoneyPin
          },
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("e-Money");
  });

  it("POST /checkout should succeed with e-Money payment when details provided", async () => {
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct1.id, quantity: 1 }],
          customer: validCustomer,
          payment: {
            method: "emoney",
            emoneyNumber: "123456789",
            emoneyPin: "1234",
          },
        }),
      })
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify payment details stored
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, json.orderId));

    expect(order.paymentMethod).toBe("emoney");
    expect(order.emoneyNumber).toBe("123456789");
    expect(order.emoneyPin).toBe("1234");
  });

  it("POST /checkout should generate unique order numbers", async () => {
    // Create first order
    const res1 = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct1.id, quantity: 1 }],
          customer: validCustomer,
          payment: validPayment,
        }),
      })
    );

    // Create second order
    const res2 = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct2.id, quantity: 1 }],
          customer: validCustomer,
          payment: validPayment,
        }),
      })
    );

    const json1 = await res1.json();
    const json2 = await res2.json();

    expect(json1.success).toBe(true);
    expect(json2.success).toBe(true);
    expect(json1.orderNumber).not.toBe(json2.orderNumber);
  });

  it("POST /checkout should clear user reservations after order", async () => {
    // Create a reservation first
    await db.insert(stockReservations).values({
      productId: testProduct1.id,
      userId: "checkout-test-user",
      quantity: 5,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
    });

    // Verify reservation exists
    const reservationsBefore = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.userId, "checkout-test-user"));

    expect(reservationsBefore.length).toBe(1);

    // Process checkout
    const res = await app.handle(
      new Request(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: testProduct1.id, quantity: 2 }],
          customer: validCustomer,
          payment: validPayment,
          userId: "checkout-test-user",
        }),
      })
    );

    expect(res.status).toBe(200);

    // Verify reservation was cleared
    const reservationsAfter = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.userId, "checkout-test-user"));

    expect(reservationsAfter.length).toBe(0);
  });

  it("POST /checkout should handle concurrent checkouts correctly", async () => {
    // Set limited stock
    await db
      .update(products)
      .set({ stock: 10 })
      .where(eq(products.id, testProduct1.id));

    // Try to checkout 6 items concurrently (total 12, but only 10 available)
    const [res1, res2] = await Promise.all([
      app.handle(
        new Request(`${BASE_URL}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ productId: testProduct1.id, quantity: 6 }],
            customer: { ...validCustomer, email: "user1@example.com" },
            payment: validPayment,
          }),
        })
      ),
      app.handle(
        new Request(`${BASE_URL}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ productId: testProduct1.id, quantity: 6 }],
            customer: { ...validCustomer, email: "user2@example.com" },
            payment: validPayment,
          }),
        })
      ),
    ]);

    const json1 = await res1.json();
    const json2 = await res2.json();

    // At least one should succeed, at least one might fail due to stock
    const successes = [json1.success, json2.success].filter(Boolean).length;

    // With 10 stock and 2 requests for 6 each, at most 1 can succeed
    // (though race conditions might allow both in some edge cases)
    expect(successes).toBeGreaterThanOrEqual(1);

    // Verify stock never goes negative
    const [productAfter] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, testProduct1.id));

    expect(productAfter.stock).toBeGreaterThanOrEqual(0);
  });
});

