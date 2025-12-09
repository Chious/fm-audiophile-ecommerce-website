import { t } from "elysia";

// Cart item for checkout
export const checkoutCartItem = t.Object({
  productId: t.String({
    description: "Product ID to checkout.",
  }),
  quantity: t.Number({
    minimum: 1,
    description: "Quantity of the product.",
  }),
});

// Customer information
export const customerInfo = t.Object({
  name: t.String({
    minLength: 1,
    description: "Customer full name.",
  }),
  email: t.String({
    format: "email",
    description: "Customer email address.",
    examples: ["alexei@mail.com"],
  }),
  phone: t.String({
    minLength: 1,
    description: "Customer phone number (including country code).",
    examples: ["+1 202-555-0136"],
  }),
  address: t.String({
    minLength: 1,
    description: "Street address for shipping.",
  }),
  zip: t.String({
    minLength: 1,
    description: "ZIP / postal code.",
  }),
  city: t.String({
    minLength: 1,
    description: "City.",
  }),
  country: t.String({
    minLength: 1,
    description: "Country.",
  }),
});

// Payment information
export const paymentInfo = t.Object({
  method: t.Union([t.Literal("emoney"), t.Literal("cash")], {
    description: "Payment method: 'emoney' or 'cash'.",
  }),
  emoneyNumber: t.Optional(
    t.String({
      description: "e-Money account or card number (required for e-Money).",
    })
  ),
  emoneyPin: t.Optional(
    t.String({
      description: "e-Money PIN code (required for e-Money).",
    })
  ),
});

// Complete checkout request body
export const checkoutBody = t.Object({
  items: t.Array(checkoutCartItem, {
    minItems: 1,
    description: "Cart items to checkout.",
  }),
  customer: customerInfo,
  payment: paymentInfo,
  userId: t.Optional(
    t.String({
      description: "User ID for authenticated users.",
    })
  ),
  sessionId: t.Optional(
    t.String({
      description: "Session ID for guest checkout.",
    })
  ),
});

export type CheckoutBody = typeof checkoutBody.static;
export type CheckoutCartItem = typeof checkoutCartItem.static;
export type CustomerInfo = typeof customerInfo.static;
export type PaymentInfo = typeof paymentInfo.static;

// Order line item in response
export const orderLineItem = t.Object({
  productId: t.String(),
  productSlug: t.String(),
  productName: t.String(),
  quantity: t.Number(),
  unitPrice: t.Number(),
  total: t.Number(),
  image: t.Optional(t.String()),
});

// Checkout success response
export const checkoutSuccessResponse = t.Object({
  success: t.Literal(true),
  orderId: t.String({
    description: "Database order ID.",
  }),
  orderNumber: t.String({
    description: "Human-readable order number (e.g., ORD-20241209-001).",
  }),
  message: t.String({
    description: "Success message.",
  }),
  items: t.Array(orderLineItem),
  subtotal: t.Number({
    description: "Sum of all line items.",
  }),
  shipping: t.Number({
    description: "Flat shipping fee ($50).",
  }),
  vat: t.Number({
    description: "20% VAT on subtotal.",
  }),
  grandTotal: t.Number({
    description: "subtotal + shipping + vat",
  }),
});

// Checkout error response
export const checkoutErrorResponse = t.Object({
  success: t.Literal(false),
  message: t.String({
    description: "Error message.",
  }),
  errors: t.Optional(
    t.Array(
      t.Object({
        field: t.Optional(t.String()),
        message: t.String(),
      })
    )
  ),
});

export const checkoutResponse = t.Union([
  checkoutSuccessResponse,
  checkoutErrorResponse,
]);

export type CheckoutSuccessResponse = typeof checkoutSuccessResponse.static;
export type CheckoutErrorResponse = typeof checkoutErrorResponse.static;
export type CheckoutResponse = typeof checkoutResponse.static;
export type OrderLineItem = typeof orderLineItem.static;
