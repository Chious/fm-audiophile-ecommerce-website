import { Elysia } from "elysia";
import { CheckoutService } from "./service";
import { checkoutBody, checkoutResponse } from "./model";

export const checkout = new Elysia({ prefix: "/checkout" }).post(
  "/",
  ({ body }) => {
    return CheckoutService.processCheckout(body);
  },
  {
    detail: {
      tags: ["checkout"],
      summary: "Process checkout",
      description:
        "Validate checkout payload and return a fake order summary with totals. 用於前端結帳流程的測試 API，會回傳模擬的訂單編號與金額明細。",
    },
    body: checkoutBody,
    response: {
      200: checkoutResponse,
    },
  }
);
