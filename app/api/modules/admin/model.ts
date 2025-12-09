import { t } from "elysia";

// --- Product admin schemas ---

export const adminProduct = t.Object({
  id: t.Number({
    description: "Numeric product identifier (admin store only).",
  }),
  slug: t.String({
    description: "URL-friendly unique identifier for the product.",
  }),
  name: t.String({
    description: "Display name of the product.",
  }),
  category: t.String({
    description: "Product category (e.g. 'headphones', 'speakers').",
  }),
  price: t.Number({
    description: "Unit price in USD.",
  }),
  new: t.Boolean({
    description: "Whether the product is marked as 'new'.",
  }),
});

export type AdminProduct = typeof adminProduct.static;

export const adminProductCreateBody = t.Object({
  slug: t.String(),
  name: t.String(),
  category: t.String(),
  price: t.Number(),
  new: t.Boolean(),
});

export type AdminProductCreateBody = typeof adminProductCreateBody.static;

export const adminProductUpdateBody = t.Object({
  slug: t.Optional(t.String()),
  name: t.Optional(t.String()),
  category: t.Optional(t.String()),
  price: t.Optional(t.Number()),
  new: t.Optional(t.Boolean()),
});

export type AdminProductUpdateBody = typeof adminProductUpdateBody.static;

export const adminProductsResponse = t.Object({
  products: t.Array(adminProduct, {
    description: "Array of admin-managed products.",
  }),
});

export type AdminProductsResponse = typeof adminProductsResponse.static;

export const adminProductResponse = t.Object({
  product: adminProduct,
});

export type AdminProductResponse = typeof adminProductResponse.static;

// --- Category admin schemas ---

export const adminCategory = t.Object({
  id: t.Number({
    description: "Numeric category identifier (admin store only).",
  }),
  slug: t.String({
    description: "Category slug (e.g. 'headphones').",
  }),
  name: t.String({
    description: "Human readable category name.",
  }),
  description: t.Optional(
    t.String({
      description: "Optional description for this category.",
    })
  ),
});

export type AdminCategory = typeof adminCategory.static;

export const adminCategoryCreateBody = t.Object({
  slug: t.String(),
  name: t.String(),
  description: t.Optional(t.String()),
});

export type AdminCategoryCreateBody = typeof adminCategoryCreateBody.static;

export const adminCategoryUpdateBody = t.Object({
  slug: t.Optional(t.String()),
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
});

export type AdminCategoryUpdateBody = typeof adminCategoryUpdateBody.static;

export const adminCategoriesResponse = t.Object({
  categories: t.Array(adminCategory),
});

export type AdminCategoriesResponse = typeof adminCategoriesResponse.static;

export const adminCategoryResponse = t.Object({
  category: adminCategory,
});

export type AdminCategoryResponse = typeof adminCategoryResponse.static;

// --- Client admin schemas ---

export const adminClient = t.Object({
  id: t.Number({
    description: "Numeric client identifier (admin store only).",
  }),
  name: t.String({
    description: "Client full name.",
  }),
  email: t.String({
    description: "Client email address.",
  }),
  phone: t.Optional(
    t.String({
      description: "Client phone number.",
    })
  ),
  note: t.Optional(
    t.String({
      description: "Free-form note for this client.",
    })
  ),
});

export type AdminClient = typeof adminClient.static;

export const adminClientCreateBody = t.Object({
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.String()),
  note: t.Optional(t.String()),
});

export type AdminClientCreateBody = typeof adminClientCreateBody.static;

export const adminClientUpdateBody = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  note: t.Optional(t.String()),
});

export type AdminClientUpdateBody = typeof adminClientUpdateBody.static;

// --- Order admin schemas ---

export const adminOrderItem = t.Object({
  id: t.String(),
  productId: t.String(),
  productSlug: t.String(),
  productName: t.String(),
  quantity: t.Number(),
  unitPrice: t.String(),
  total: t.String(),
  createdAt: t.String(),
});

export const adminOrder = t.Object({
  id: t.String(),
  orderNumber: t.String(),
  status: t.Union([
    t.Literal("pending"),
    t.Literal("processing"),
    t.Literal("shipped"),
    t.Literal("delivered"),
    t.Literal("cancelled"),
  ]),
  userId: t.Union([t.String(), t.Null()]),
  customerName: t.String(),
  customerEmail: t.String(),
  customerPhone: t.Union([t.String(), t.Null()]),
  shippingAddress: t.String(),
  shippingZip: t.String(),
  shippingCity: t.String(),
  shippingCountry: t.String(),
  paymentMethod: t.Union([t.Literal("emoney"), t.Literal("cash")]),
  emoneyNumber: t.Union([t.String(), t.Null()]),
  emoneyPin: t.Union([t.String(), t.Null()]),
  subtotal: t.String(),
  shipping: t.String(),
  vat: t.String(),
  grandTotal: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
  items: t.Array(adminOrderItem),
});

export const adminOrderUpdateBody = t.Object({
  status: t.Union([
    t.Literal("pending"),
    t.Literal("processing"),
    t.Literal("shipped"),
    t.Literal("delivered"),
    t.Literal("cancelled"),
  ]),
});

export type AdminOrderUpdateBody = typeof adminOrderUpdateBody.static;

export const adminOrdersResponse = t.Object({
  orders: t.Array(adminOrder),
  pagination: t.Object({
    total: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
    hasMore: t.Boolean(),
  }),
});

export const adminOrderResponse = t.Object({
  order: adminOrder,
});

export const adminOrderFilters = t.Object({
  status: t.Optional(
    t.Union([
      t.Literal("pending"),
      t.Literal("processing"),
      t.Literal("shipped"),
      t.Literal("delivered"),
      t.Literal("cancelled"),
    ])
  ),
  dateFrom: t.Optional(t.String({ format: "date-time" })),
  dateTo: t.Optional(t.String({ format: "date-time" })),
  search: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

// --- Media admin schemas ---

export const adminMedia = t.Object({
  id: t.String(),
  productId: t.String(),
  type: t.Union([
    t.Literal("product"),
    t.Literal("category"),
    t.Literal("gallery"),
    t.Literal("related"),
  ]),
  size: t.Union([
    t.Literal("mobile"),
    t.Literal("tablet"),
    t.Literal("desktop"),
  ]),
  url: t.String(),
  order: t.Number(),
  createdAt: t.String(),
});

export const adminMediaFilters = t.Object({
  productId: t.Optional(t.String()),
  type: t.Optional(
    t.Union([
      t.Literal("product"),
      t.Literal("category"),
      t.Literal("gallery"),
      t.Literal("related"),
    ])
  ),
  size: t.Optional(
    t.Union([t.Literal("mobile"), t.Literal("tablet"), t.Literal("desktop")])
  ),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const adminMediaUploadBody = t.Object({
  productId: t.String(),
  type: t.Union([
    t.Literal("product"),
    t.Literal("category"),
    t.Literal("gallery"),
    t.Literal("related"),
  ]),
  size: t.Union([
    t.Literal("mobile"),
    t.Literal("tablet"),
    t.Literal("desktop"),
  ]),
  order: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const adminMediasResponse = t.Object({
  medias: t.Array(adminMedia),
  pagination: t.Object({
    total: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
    hasMore: t.Boolean(),
  }),
});

export const adminMediaResponse = t.Object({
  media: adminMedia,
});

export const adminClientsResponse = t.Object({
  clients: t.Array(adminClient),
});

export type AdminClientsResponse = typeof adminClientsResponse.static;

export const adminClientResponse = t.Object({
  client: adminClient,
});

export type AdminClientResponse = typeof adminClientResponse.static;
