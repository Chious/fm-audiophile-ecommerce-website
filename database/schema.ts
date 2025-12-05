import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

// Enums
export const categoryEnum = pgEnum("category", [
  "headphones",
  "speakers",
  "earphones",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["emoney", "cash"]);

export const imageSizeEnum = pgEnum("image_size", [
  "mobile",
  "tablet",
  "desktop",
]);

export const imageTypeEnum = pgEnum("image_type", [
  "product",
  "category",
  "gallery",
  "related",
]);

// Better Auth: User role enum
export const userRoleEnum = pgEnum("user_role", ["admin", "consumer"]);

// ============================================================================
// Better Auth Tables
// ============================================================================

// Users table (Better Auth core table)
export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  // Custom fields for role-based access
  role: userRoleEnum("role").default("consumer").notNull(),
});

// Sessions table (Better Auth)
export const sessions = pgTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 255 }),
  userAgent: varchar("userAgent", { length: 500 }),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Accounts table (Better Auth - for OAuth providers)
export const accounts = pgTable("account", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  providerId: varchar("providerId", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: varchar("scope", { length: 500 }),
  password: varchar("password", { length: 255 }), // For email/password auth
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Verifications table (Better Auth - for email verification, password reset)
export const verifications = pgTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ============================================================================
// E-commerce Tables
// ============================================================================

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: varchar("category_id", { length: 128 })
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(), // 庫存數量
  isNew: boolean("is_new").default(false).notNull(),
  description: text("description").notNull(),
  features: text("features").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product images table (for product main image, category image, gallery, etc.)
export const productImages = pgTable("product_images", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  productId: varchar("product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: imageTypeEnum("type").notNull(), // product, category, gallery, related
  size: imageSizeEnum("size").notNull(), // mobile, tablet, desktop
  url: varchar("url", { length: 500 }).notNull(), // URL to Vercel Blob or R2
  order: integer("order").default(0).notNull(), // For gallery ordering (0, 1, 2 for first, second, third)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product includes table (items in the box)
export const productIncludes = pgTable("product_includes", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  productId: varchar("product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  order: integer("order").default(0).notNull(), // For ordering items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Related products (self-referencing many-to-many)
export const relatedProducts = pgTable("related_products", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  productId: varchar("product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  relatedProductId: varchar("related_product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  order: integer("order").default(0).notNull(), // For ordering related products
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(), // e.g., "ORD-001"
  status: orderStatusEnum("status").default("pending").notNull(),
  // User reference (optional - guest checkout is allowed)
  userId: varchar("user_id", { length: 255 }).references(() => users.id, {
    onDelete: "set null",
  }),
  // Customer information (denormalized for guest orders)
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  // Shipping address
  shippingAddress: text("shipping_address").notNull(),
  shippingZip: varchar("shipping_zip", { length: 20 }).notNull(),
  shippingCity: varchar("shipping_city", { length: 255 }).notNull(),
  shippingCountry: varchar("shipping_country", { length: 100 }).notNull(),
  // Payment information
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  emoneyNumber: varchar("emoney_number", { length: 255 }),
  emoneyPin: varchar("emoney_pin", { length: 50 }),
  // Totals
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  vat: decimal("vat", { precision: 10, scale: 2 }).notNull(),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: varchar("order_id", { length: 128 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  productSlug: varchar("product_slug", { length: 255 }).notNull(), // Denormalized for historical reference
  productName: varchar("product_name", { length: 255 }).notNull(), // Denormalized
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(), // Price at time of order
  total: decimal("total", { precision: 10, scale: 2 }).notNull(), // quantity * unitPrice
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock reservations table (for cart items - 30 minutes reservation)
export const stockReservations = pgTable("stock_reservations", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  productId: varchar("product_id", { length: 128 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, {
    onDelete: "cascade",
  }), // Optional - for logged-in users
  sessionId: varchar("session_id", { length: 255 }), // For guest users (from localStorage session)
  quantity: integer("quantity").notNull(), // Reserved quantity
  expiresAt: timestamp("expires_at").notNull(), // 30 minutes from creation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Better Auth Relations
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
  stockReservations: many(stockReservations),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// E-commerce Relations
// ============================================================================

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  includes: many(productIncludes),
  relatedProducts: many(relatedProducts, {
    relationName: "product_related",
  }),
  relatedTo: many(relatedProducts, {
    relationName: "related_to_product",
  }),
  orderItems: many(orderItems),
  stockReservations: many(stockReservations),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productIncludesRelations = relations(
  productIncludes,
  ({ one }) => ({
    product: one(products, {
      fields: [productIncludes.productId],
      references: [products.id],
    }),
  })
);

export const relatedProductsRelations = relations(
  relatedProducts,
  ({ one }) => ({
    product: one(products, {
      fields: [relatedProducts.productId],
      references: [products.id],
      relationName: "product_related",
    }),
    relatedProduct: one(products, {
      fields: [relatedProducts.relatedProductId],
      references: [products.id],
      relationName: "related_to_product",
    }),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const stockReservationsRelations = relations(
  stockReservations,
  ({ one }) => ({
    product: one(products, {
      fields: [stockReservations.productId],
      references: [products.id],
    }),
    user: one(users, {
      fields: [stockReservations.userId],
      references: [users.id],
    }),
  })
);

// Export table object for drizzle-typebox
export const table = {
  // Better Auth tables
  users,
  sessions,
  accounts,
  verifications,
  // E-commerce tables
  categories,
  products,
  productImages,
  productIncludes,
  relatedProducts,
  orders,
  orderItems,
  stockReservations,
} as const;

export type Table = typeof table;
