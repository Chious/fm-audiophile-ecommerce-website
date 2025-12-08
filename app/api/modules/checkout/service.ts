import { CartService } from "@/api/modules/cart/service";
import type { checkoutBody, checkoutResponse } from "./model";

export abstract class CheckoutService {
  static async processCheckout(body: checkoutBody): Promise<checkoutResponse> {
    const cart = await CartService.buildCart();

    return {
      success: true,
      message: "Fake checkout processed successfully.",
      orderId: "ORDER-" + Math.floor(Math.random() * 1_000_000).toString(),
      receivedPayload: body,
      ...cart,
    };
  }
}
