import { Elysia } from "elysia";
import { ProductService } from "./service";
import { productsResponse } from "./model";

export const products = new Elysia({ prefix: "/products" }).get(
  "/",
  () => {
    return ProductService.getAllProducts();
  },
  {
    response: {
      200: productsResponse,
    },
  }
);

