import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { table } from "./schema";
import { spreads } from "./utils";

// Create schemas for insert operations
export const db = {
  insert: spreads(
    {
      // Better Auth tables
      user: table.users,
      session: table.sessions,
      account: table.accounts,
      verification: table.verifications,
      // E-commerce tables
      category: table.categories,
      product: table.products,
      productImage: table.productImages,
      productInclude: table.productIncludes,
      relatedProduct: table.relatedProducts,
      order: table.orders,
      orderItem: table.orderItems,
      stockReservation: table.stockReservations,
    },
    "insert"
  ),
  select: spreads(
    {
      // Better Auth tables
      user: table.users,
      session: table.sessions,
      account: table.accounts,
      verification: table.verifications,
      // E-commerce tables
      category: table.categories,
      product: table.products,
      productImage: table.productImages,
      productInclude: table.productIncludes,
      relatedProduct: table.relatedProducts,
      order: table.orders,
      orderItem: table.orderItems,
      stockReservation: table.stockReservations,
    },
    "select"
  ),
} as const;

// Refined schemas with Elysia validation
export const categoryInsertSchema = createInsertSchema(table.categories, {
  slug: t.String({ minLength: 1, maxLength: 255 }),
  name: t.String({ minLength: 1, maxLength: 255 }),
});

export const categorySelectSchema = createSelectSchema(table.categories);

export const productInsertSchema = createInsertSchema(table.products, {
  slug: t.String({ minLength: 1, maxLength: 255 }),
  name: t.String({ minLength: 1, maxLength: 255 }),
  price: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }), // Decimal validation
  stock: t.Number({ minimum: 0 }), // Stock must be >= 0
  description: t.String({ minLength: 1 }),
  features: t.String({ minLength: 1 }),
});

export const productSelectSchema = createSelectSchema(table.products);

export const orderInsertSchema = createInsertSchema(table.orders, {
  orderNumber: t.String({ minLength: 1, maxLength: 50 }),
  customerName: t.String({ minLength: 1, maxLength: 255 }),
  customerEmail: t.String({ format: "email" }),
  subtotal: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  shipping: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  vat: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
  grandTotal: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
});

export const orderSelectSchema = createSelectSchema(table.orders);

// Better Auth schemas
export const userInsertSchema = createInsertSchema(table.users, {
  email: t.String({ format: "email" }),
  role: t.String({ enum: ["admin", "consumer"] }),
});

export const userSelectSchema = createSelectSchema(table.users);
