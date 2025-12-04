import type { product, productsResponse, productResponse } from "./model";
import productsData from "@/data/data.json";

const getProducts = (): product[] => {
  return productsData as product[];
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

  static getProductsByCategory(category: string): productsResponse {
    const products = getProducts();
    const filtered = products.filter((p) => p.category === category);
    return { products: filtered };
  }
}
