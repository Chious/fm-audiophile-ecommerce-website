import { Elysia } from "elysia";
import { CartService } from "./service";
import { addToCartRequest, addToCartResponse, cartResponse } from "./model";

export const cart = new Elysia({ prefix: "/cart" })
  .get(
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
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await CartService.addToCart(
          body.productId,
          body.quantity,
          body.userId,
          body.sessionId
        );
        return result;
      } catch (e) {
        set.status = 400;
        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to add to cart",
        };
      }
    },
    {
      detail: {
        tags: ["cart"],
        summary: "Add item to cart",
        description: "Add an item to the cart and reserve stock.",
      },
      body: addToCartRequest,
      response: {
        200: addToCartResponse,
        400: addToCartResponse,
      },
    }
  );
