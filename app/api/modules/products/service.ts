import type { product, productsResponse } from "./model";
import productsData from "@/data/data.json";

const getProducts = (): product[] => {
  return productsData.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    price: item.price,
  }));
};

export abstract class ProductService {
  static getAllProducts(): productsResponse {
    const products = getProducts();
    return { products };
  }

  static getProductBySlug(slug: string): product | undefined {
    const products = getProducts();
    return products.find((p) => p.slug === slug);
  }
}
