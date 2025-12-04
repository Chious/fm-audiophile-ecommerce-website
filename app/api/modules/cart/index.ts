import { Elysia } from "elysia";
import { CartService } from "./service";
import { cartResponse } from "./model";

export const cart = new Elysia({ prefix: "/cart" }).get(
  "/",
  () => {
    return CartService.buildCart();
  },
  {
    response: {
      200: cartResponse,
    },
  }
);
