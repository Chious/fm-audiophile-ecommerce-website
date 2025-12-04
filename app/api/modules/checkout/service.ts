import { CartService } from "@/api/modules/cart/service";
import type { checkoutBody, checkoutResponse } from "./model";

export abstract class CheckoutService {
  static processCheckout(body: checkoutBody): checkoutResponse {
    const cart = CartService.buildCart();

    return {
      success: true,
      message: "Fake checkout processed successfully.",
      orderId: "ORDER-" + Math.floor(Math.random() * 1_000_000).toString(),
      receivedPayload: body,
      ...cart,
    };
  }
}
