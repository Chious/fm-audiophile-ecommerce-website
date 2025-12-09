import { ProductService } from "@/api/modules/products/service";
import { StockReservationService } from "@/api/modules/stock/service";
import type { cartResponse } from "./model";

const sampleCart = [
  { slug: "xx99-mark-two-headphones", quantity: 1 },
  { slug: "xx59-headphones", quantity: 2 },
  { slug: "yx1-earphones", quantity: 1 },
];

export abstract class CartService {
  static async addToCart(
    productId: string,
    quantity: number,
    userId?: string | null,
    sessionId?: string | null
  ) {
    // 1. Reserve stock
    const reservation = await StockReservationService.createReservation(
      productId,
      quantity,
      userId,
      sessionId
    );

    if (!reservation.success) {
      throw new Error(reservation.error || "Failed to reserve stock");
    }

    // 2. In a real implementation, we would now add/update the item in the 'cart_items' table.
    // For now, we just confirm the reservation.

    return {
      success: true,
      reservationId: reservation.reservationId,
      message: "Item added to cart (stock reserved)",
    };
  }

  static async buildCart(): Promise<cartResponse> {
    const cartItems = await Promise.all(
      sampleCart.map(async (item) => {
        const product = await ProductService.getProductBySlug(item.slug);
        const price = product?.price ?? 0;

        return {
          slug: item.slug,
          quantity: item.quantity,
          product: product ?? null,
          total: price * item.quantity,
        };
      })
    );

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = 50;
    const vat = Math.round(subtotal * 0.2);
    const grandTotal = subtotal + shipping + vat;

    return {
      cartItems,
      subtotal,
      shipping,
      vat,
      grandTotal,
    };
  }
}
