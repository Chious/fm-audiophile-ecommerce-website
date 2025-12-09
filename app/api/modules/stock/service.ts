import { eq, sql, and, gt, lte } from "drizzle-orm";
import { db } from "@/database/db";
import { products, stockReservations } from "@/database/schema";

export class StockReservationService {
  private static readonly RESERVATION_DURATION_MINUTES = 30;

  /**
   * Get available stock for a product (Total Stock - Active Reservations)
   */
  static async getAvailableStock(productId: string): Promise<number> {
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) return 0;

    const [reservationStats] = await db
      .select({
        reserved: sql<number>`coalesce(sum(${stockReservations.quantity}), 0)`,
      })
      .from(stockReservations)
      .where(
        and(
          eq(stockReservations.productId, productId),
          gt(stockReservations.expiresAt, new Date())
        )
      );

    // Ensure reserved is a number (it might come as string from some drivers)
    const reservedCount = Number(reservationStats?.reserved || 0);
    return Math.max(0, product.stock - reservedCount);
  }

  /**
   * Validate if requested quantity is available
   */
  static async validateStock(
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const available = await this.getAvailableStock(productId);
    return available >= quantity;
  }

  /**
   * Create a stock reservation
   */
  static async createReservation(
    productId: string,
    quantity: number,
    userId?: string | null,
    sessionId?: string | null
  ): Promise<{ success: boolean; error?: string; reservationId?: string }> {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    if (!userId && !sessionId) {
      return { success: false, error: "User ID or Session ID is required" };
    }

    return await db.transaction(async (tx) => {
      // Re-check availability within transaction to prevent race conditions
      // Note: For stricter consistency, we might need row locking (SELECT FOR UPDATE),
      // but standard transaction isolation often suffices for simple cases or Drizzle's implementation specific.
      // Given Drizzle + PG, let's fetch product stock first.

      const [product] = await tx
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      const [reservationStats] = await tx
        .select({
          reserved: sql<number>`coalesce(sum(${stockReservations.quantity}), 0)`,
        })
        .from(stockReservations)
        .where(
          and(
            eq(stockReservations.productId, productId),
            gt(stockReservations.expiresAt, new Date())
          )
        );

      const reservedCount = Number(reservationStats?.reserved || 0);
      const available = product.stock - reservedCount;

      if (available < quantity) {
        return { success: false, error: "Insufficient stock" };
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + this.RESERVATION_DURATION_MINUTES
      );

      const [reservation] = await tx
        .insert(stockReservations)
        .values({
          productId,
          quantity,
          userId: userId || null,
          sessionId: sessionId || null,
          expiresAt,
        })
        .returning({ id: stockReservations.id });

      return { success: true, reservationId: reservation.id };
    });
  }

  /**
   * Cleanup expired reservations
   */
  static async cleanupExpiredReservations(): Promise<number> {
    const result = await db
      .delete(stockReservations)
      .where(lte(stockReservations.expiresAt, new Date()))
      .returning({ id: stockReservations.id });

    return result.length;
  }
}
