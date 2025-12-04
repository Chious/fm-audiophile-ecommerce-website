import type {
  AdminProduct,
  AdminProductsResponse,
  AdminProductResponse,
  AdminProductCreateBody,
  AdminProductUpdateBody,
  AdminCategory,
  AdminCategoriesResponse,
  AdminCategoryResponse,
  AdminCategoryCreateBody,
  AdminCategoryUpdateBody,
  AdminClient,
  AdminClientsResponse,
  AdminClientResponse,
  AdminClientCreateBody,
  AdminClientUpdateBody,
} from "./model";
import productsData from "@/data/data.json";

// --- In-memory stores for admin data ---

let productIdCounter = 1;
let categoryIdCounter = 1;
let clientIdCounter = 1;

const adminProducts: AdminProduct[] = [];
const adminCategories: AdminCategory[] = [];
const adminClients: AdminClient[] = [];

// Seed initial admin products from static catalogue (basic fields only)
(() => {
  const seed = productsData as {
    slug: string;
    name: string;
    category: string;
    price: number;
    new?: boolean;
  }[];
  for (const p of seed) {
    adminProducts.push({
      id: productIdCounter++,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      new: Boolean(p.new),
    });
  }

  const uniqueCategories = Array.from(
    new Set(seed.map((p) => String(p.category)))
  );
  for (const cat of uniqueCategories) {
    adminCategories.push({
      id: categoryIdCounter++,
      slug: cat,
      name: cat[0]?.toUpperCase() + cat.slice(1),
      description: `Auto-generated category for ${cat}.`,
    });
  }
})();

export abstract class AdminProductService {
  static list(): AdminProductsResponse {
    return { products: adminProducts };
  }

  static get(id: number): AdminProduct | undefined {
    return adminProducts.find((p) => p.id === id);
  }

  static create(body: AdminProductCreateBody): AdminProductResponse {
    const product: AdminProduct = {
      id: productIdCounter++,
      ...body,
    };
    adminProducts.push(product);
    return { product };
  }

  static update(
    id: number,
    body: AdminProductUpdateBody
  ): AdminProductResponse | undefined {
    const product = this.get(id);
    if (!product) return undefined;

    Object.assign(product, body);
    return { product };
  }

  static delete(id: number): boolean {
    const index = adminProducts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    adminProducts.splice(index, 1);
    return true;
  }
}

export abstract class AdminCategoryService {
  static list(): AdminCategoriesResponse {
    return { categories: adminCategories };
  }

  static get(id: number): AdminCategory | undefined {
    return adminCategories.find((c) => c.id === id);
  }

  static create(body: AdminCategoryCreateBody): AdminCategoryResponse {
    const category: AdminCategory = {
      id: categoryIdCounter++,
      ...body,
    };
    adminCategories.push(category);
    return { category };
  }

  static update(
    id: number,
    body: AdminCategoryUpdateBody
  ): AdminCategoryResponse | undefined {
    const category = this.get(id);
    if (!category) return undefined;

    Object.assign(category, body);
    return { category };
  }

  static delete(id: number): boolean {
    const index = adminCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    adminCategories.splice(index, 1);
    return true;
  }
}

export abstract class AdminClientService {
  static list(): AdminClientsResponse {
    return { clients: adminClients };
  }

  static get(id: number): AdminClient | undefined {
    return adminClients.find((c) => c.id === id);
  }

  static create(body: AdminClientCreateBody): AdminClientResponse {
    const client: AdminClient = {
      id: clientIdCounter++,
      ...body,
    };
    adminClients.push(client);
    return { client };
  }

  static update(
    id: number,
    body: AdminClientUpdateBody
  ): AdminClientResponse | undefined {
    const client = this.get(id);
    if (!client) return undefined;

    Object.assign(client, body);
    return { client };
  }

  static delete(id: number): boolean {
    const index = adminClients.findIndex((c) => c.id === id);
    if (index === -1) return false;
    adminClients.splice(index, 1);
    return true;
  }
}
