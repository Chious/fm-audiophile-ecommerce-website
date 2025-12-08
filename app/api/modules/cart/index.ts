import { Elysia } from "elysia";
import { CartService } from "./service";
import { cartResponse } from "./model";

export const cart = new Elysia({ prefix: "/cart" }).get(
  "/",
  async () => {
    return await CartService.buildCart();
  },
  {
    detail: {
      tags: ["cart"],
      summary: "Get sample cart",
      description:
        "Return a sample cart with line items and totals. 在教學或開發階段，用來模擬購物車金額計算（小計、運費、稅金與總額）。",
    },
    response: {
      200: cartResponse,
    },
  }
);
