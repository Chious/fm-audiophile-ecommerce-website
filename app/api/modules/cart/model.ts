import { t } from "elysia";
import { product } from "@/api/modules/products/model";

export const cartItem = t.Object({
  slug: t.String({
    description: "Product slug for this cart line item.",
  }),
  quantity: t.Number({
    description: "Quantity of the product in the cart.",
  }),
  product: t.Union([product, t.Null()], {
    description:
      "Embedded product data (may be null if the product is missing or unavailable).",
  }),
  total: t.Number({
    description: "Line total = unit price * quantity.",
  }),
});

export type cartItem = typeof cartItem.static;

export const cartResponse = t.Object({
  cartItems: t.Array(cartItem, {
    description: "All line items currently in the cart.",
  }),
  subtotal: t.Number({
    description: "Sum of all line item totals before shipping and VAT.",
  }),
  shipping: t.Number({
    description: "Shipping cost applied to this cart.",
  }),
  vat: t.Number({
    description: "Estimated VAT amount for this cart.",
  }),
  grandTotal: t.Number({
    description: "Final total = subtotal + shipping + VAT.",
  }),
});

export type cartResponse = typeof cartResponse.static;

export const addToCartRequest = t.Object({
  productId: t.String({
    description: "ID of the product to add.",
  }),
  quantity: t.Number({
    description: "Quantity to add.",
    minimum: 1,
  }),
  userId: t.Optional(
    t.String({
      description: "User ID if authenticated.",
    })
  ),
  sessionId: t.Optional(
    t.String({
      description: "Session ID if guest.",
    })
  ),
});

export const addToCartResponse = t.Object({
  success: t.Boolean(),
  reservationId: t.Optional(t.String()),
  message: t.Optional(t.String()),
});
