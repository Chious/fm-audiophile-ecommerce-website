import { Elysia } from "elysia";
import { CheckoutService } from "./service";
import {
  checkoutBody,
  checkoutSuccessResponse,
  checkoutErrorResponse,
} from "./model";

export const checkout = new Elysia({ prefix: "/checkout" }).post(
  "/",
  async ({ body, set }) => {
    const result = await CheckoutService.processCheckout(body);

    if (!result.success) {
      set.status = 400;
    }

    return result;
  },
  {
    detail: {
      tags: ["checkout"],
      summary: "Process checkout",
      description:
        "Process checkout with cart items, customer info, and payment details. Creates order, order items, and deducts stock. 處理結帳流程，建立訂單並扣除庫存。",
    },
    body: checkoutBody,
    response: {
      200: checkoutSuccessResponse,
      400: checkoutErrorResponse,
    },
  }
);
