import { t } from "elysia";

export const product = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  price: t.Number(),
});

export type product = typeof product.static;

export const productsResponse = t.Object({
  products: t.Array(product),
});

export type productsResponse = typeof productsResponse.static;
