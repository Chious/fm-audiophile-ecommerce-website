import { Elysia } from "elysia";
import { CheckoutService } from "./service";
import { checkoutBody, checkoutResponse } from "./model";

export const checkout = new Elysia({ prefix: "/checkout" }).post(
  "/",
  ({ body }) => {
    return CheckoutService.processCheckout(body);
  },
  {
    body: checkoutBody,
    response: {
      200: checkoutResponse,
    },
  }
);

