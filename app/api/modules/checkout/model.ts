import { t } from "elysia";
import { cartResponse } from "@/api/modules/cart/model";

export const checkoutBody = t.Object(
  {
    name: t.Optional(t.String()),
    email: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    address: t.Optional(t.String()),
    zip: t.Optional(t.String()),
    city: t.Optional(t.String()),
    country: t.Optional(t.String()),
    payment: t.Optional(t.String()),
    emoneyNumber: t.Optional(t.String()),
    emoneyPin: t.Optional(t.String()),
  },
  { additionalProperties: true }
);

export type checkoutBody = typeof checkoutBody.static;

export const checkoutResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  orderId: t.String(),
  receivedPayload: checkoutBody,
  cartItems: cartResponse.properties.cartItems,
  subtotal: cartResponse.properties.subtotal,
  shipping: cartResponse.properties.shipping,
  vat: cartResponse.properties.vat,
  grandTotal: cartResponse.properties.grandTotal,
});

export type checkoutResponse = typeof checkoutResponse.static;
