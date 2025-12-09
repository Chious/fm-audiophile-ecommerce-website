import { eq, and, gt, sql, inArray } from "drizzle-orm";
import { db } from "@/database/db";
import {
  products,
  orders,
  orderItems,
  stockReservations,
  productImages,
} from "@/database/schema";
import type {
  CheckoutBody,
  CheckoutResponse,
  CheckoutCartItem,
  OrderLineItem,
} from "./model";

const SHIPPING_FEE = 50;
const VAT_RATE = 0.2;

interface ValidatedCartItem {
  productId: string;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
  image?: string;
}

interface ValidationError {
  field?: string;
  message: string;
}

export abstract class CheckoutService {
  /**
   * Generate unique order number: ORD-YYYYMMDD-XXXX
   */
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

    // Count orders created today to generate sequence number
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gt(orders.createdAt, startOfDay));

    const sequence = (Number(result?.count) || 0) + 1;
    const sequenceStr = sequence.toString().padStart(4, "0");

    return `ORD-${dateStr}-${sequenceStr}`;
  }

  /**
   * Validate cart items and fetch product details
   */
  private static async validateCartItems(
    items: CheckoutCartItem[]
  ): Promise<{ valid: ValidatedCartItem[]; errors: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const validItems: ValidatedCartItem[] = [];

    if (!items || items.length === 0) {
      errors.push({ message: "Cart is empty" });
      return { valid: validItems, errors };
    }

    // Fetch all products in one query
    const productIds = items.map((item) => item.productId);
    const dbProducts = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    // Create lookup map
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Fetch product images for all products
    const images = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
      })
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, productIds),
          eq(productImages.type, "product"),
          eq(productImages.size, "mobile")
        )
      );

    const imageMap = new Map(images.map((img) => [img.productId, img.url]));

    // Validate each item
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        errors.push({
          field: `items.${item.productId}`,
          message: `Product not found: ${item.productId}`,
        });
        continue;
      }

      if (item.quantity <= 0) {
        errors.push({
          field: `items.${item.productId}.quantity`,
          message: `Invalid quantity for ${product.name}`,
        });
        continue;
      }

      validItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        stock: product.stock,
        image: imageMap.get(product.id),
      });
    }

    return { valid: validItems, errors };
  }

  /**
   * Calculate order totals
   */
  private static calculateTotals(items: ValidatedCartItem[]): {
    subtotal: number;
    shipping: number;
    vat: number;
    grandTotal: number;
  } {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shipping = SHIPPING_FEE;
    const vat = Math.round(subtotal * VAT_RATE * 100) / 100; // Round to 2 decimal places
    const grandTotal = subtotal + shipping + vat;

    return { subtotal, shipping, vat, grandTotal };
  }

  /**
   * Get available stock for products (accounting for reservations)
   */
  private static async getAvailableStock(
    productIds: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any
  ): Promise<Map<string, number>> {
    const now = new Date();

    // Get product stocks
    const productStocks = await tx
      .select({ id: products.id, stock: products.stock })
      .from(products)
      .where(inArray(products.id, productIds));

    // Get active reservations
    const reservations = await tx
      .select({
        productId: stockReservations.productId,
        reserved: sql<number>`coalesce(sum(${stockReservations.quantity}), 0)`,
      })
      .from(stockReservations)
      .where(
        and(
          inArray(stockReservations.productId, productIds),
          gt(stockReservations.expiresAt, now)
        )
      )
      .groupBy(stockReservations.productId);

    const reservationMap = new Map(
      reservations.map((r: { productId: string; reserved: number }) => [
        r.productId,
        Number(r.reserved),
      ])
    );

    const availableMap = new Map<string, number>();
    for (const product of productStocks) {
      const reserved = Number(reservationMap.get(product.id) || 0);
      const stock = Number(product.stock);
      availableMap.set(product.id, Math.max(0, stock - reserved));
    }

    return availableMap;
  }

  /**
   * Process checkout - main entry point
   */
  static async processCheckout(body: CheckoutBody): Promise<CheckoutResponse> {
    // 1. Validate cart items
    const { valid: validItems, errors: validationErrors } =
      await this.validateCartItems(body.items);

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: "Cart validation failed",
        errors: validationErrors,
      };
    }

    // 2. Validate payment info
    if (
      body.payment.method === "emoney" &&
      (!body.payment.emoneyNumber || !body.payment.emoneyPin)
    ) {
      return {
        success: false,
        message: "e-Money payment requires emoneyNumber and emoneyPin",
        errors: [
          {
            field: "payment",
            message: "e-Money number and PIN are required",
          },
        ],
      };
    }

    // 3. Calculate totals
    const totals = this.calculateTotals(validItems);

    // 4. Execute checkout in a transaction
    try {
      const result = await db.transaction(async (tx) => {
        // Check available stock within transaction
        const productIds = validItems.map((item) => item.productId);
        const availableStock = await this.getAvailableStock(productIds, tx);

        // Validate stock availability
        const stockErrors: ValidationError[] = [];
        for (const item of validItems) {
          const available = availableStock.get(item.productId) || 0;
          if (available < item.quantity) {
            stockErrors.push({
              field: `items.${item.productId}`,
              message: `Insufficient stock for ${item.productName}. Available: ${available}, Requested: ${item.quantity}`,
            });
          }
        }

        if (stockErrors.length > 0) {
          throw new CheckoutError("Insufficient stock", stockErrors);
        }

        // Generate order number
        const orderNumber = await this.generateOrderNumber();

        // Create order
        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber,
            status: "pending",
            userId: body.userId || null,
            customerName: body.customer.name,
            customerEmail: body.customer.email,
            customerPhone: body.customer.phone,
            shippingAddress: body.customer.address,
            shippingZip: body.customer.zip,
            shippingCity: body.customer.city,
            shippingCountry: body.customer.country,
            paymentMethod: body.payment.method,
            emoneyNumber: body.payment.emoneyNumber || null,
            emoneyPin: body.payment.emoneyPin || null,
            subtotal: totals.subtotal.toFixed(2),
            shipping: totals.shipping.toFixed(2),
            vat: totals.vat.toFixed(2),
            grandTotal: totals.grandTotal.toFixed(2),
          })
          .returning({ id: orders.id });

        // Create order items
        const orderItemsData = validItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productSlug: item.productSlug,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          total: (item.unitPrice * item.quantity).toFixed(2),
        }));

        await tx.insert(orderItems).values(orderItemsData);

        // Deduct stock from products
        for (const item of validItems) {
          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }

        // Clear related stock reservations for this user/session
        if (body.userId) {
          await tx
            .delete(stockReservations)
            .where(
              and(
                inArray(stockReservations.productId, productIds),
                eq(stockReservations.userId, body.userId)
              )
            );
        } else if (body.sessionId) {
          await tx
            .delete(stockReservations)
            .where(
              and(
                inArray(stockReservations.productId, productIds),
                eq(stockReservations.sessionId, body.sessionId)
              )
            );
        }

        return {
          orderId: order.id,
          orderNumber,
        };
      });

      // Build response items
      const responseItems: OrderLineItem[] = validItems.map((item) => ({
        productId: item.productId,
        productSlug: item.productSlug,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
        image: item.image,
      }));

      return {
        success: true,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        message: "Order placed successfully",
        items: responseItems,
        ...totals,
      };
    } catch (error) {
      if (error instanceof CheckoutError) {
        return {
          success: false,
          message: error.message,
          errors: error.errors,
        };
      }

      console.error("Checkout error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during checkout",
      };
    }
  }
}

class CheckoutError extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message);
    this.name = "CheckoutError";
  }
}
