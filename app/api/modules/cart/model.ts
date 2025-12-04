import { t } from "elysia";
import { product } from "@/api/modules/products/model";

export const cartItem = t.Object({
  slug: t.String(),
  quantity: t.Number(),
  product: t.Union([product, t.Null()]),
  total: t.Number(),
});

export type cartItem = typeof cartItem.static;

export const cartResponse = t.Object({
  cartItems: t.Array(cartItem),
  subtotal: t.Number(),
  shipping: t.Number(),
  vat: t.Number(),
  grandTotal: t.Number(),
});

export type cartResponse = typeof cartResponse.static;
