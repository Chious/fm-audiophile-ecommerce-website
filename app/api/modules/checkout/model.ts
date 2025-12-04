import { t } from "elysia";
import { cartResponse } from "@/api/modules/cart/model";

export const checkoutBody = t.Object(
  {
    name: t.Optional(
      t.String({
        description: "Customer full name.",
      })
    ),
    email: t.Optional(
      t.String({
        description: "Customer email address.",
        examples: ["alexei@mail.com"],
      })
    ),
    phone: t.Optional(
      t.String({
        description: "Customer phone number (including country code).",
        examples: ["+1 202-555-0136"],
      })
    ),
    address: t.Optional(
      t.String({
        description: "Street address for shipping.",
      })
    ),
    zip: t.Optional(
      t.String({
        description: "ZIP / postal code.",
      })
    ),
    city: t.Optional(
      t.String({
        description: "City.",
      })
    ),
    country: t.Optional(
      t.String({
        description: "Country.",
      })
    ),
    payment: t.Optional(
      t.String({
        description: "Payment method identifier (e.g. 'emoney', 'cash').",
      })
    ),
    emoneyNumber: t.Optional(
      t.String({
        description: "e-Money account or card number (when using e-Money).",
      })
    ),
    emoneyPin: t.Optional(
      t.String({
        description: "e-Money PIN code (when using e-Money).",
      })
    ),
  },
  { additionalProperties: true }
);

export type checkoutBody = typeof checkoutBody.static;

export const checkoutResponse = t.Object({
  success: t.Boolean({
    description: "Whether the fake checkout was processed successfully.",
  }),
  message: t.String({
    description: "Informational message about the checkout result.",
  }),
  orderId: t.String({
    description: "Generated fake order identifier.",
  }),
  receivedPayload: checkoutBody,
  cartItems: cartResponse.properties.cartItems,
  subtotal: cartResponse.properties.subtotal,
  shipping: cartResponse.properties.shipping,
  vat: cartResponse.properties.vat,
  grandTotal: cartResponse.properties.grandTotal,
});

export type checkoutResponse = typeof checkoutResponse.static;
