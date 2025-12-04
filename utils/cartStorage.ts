const CART_STORAGE_KEY = "audiophile_cart";
export interface LocalCartItem {
  slug: string;
  quantity: number;
}

export interface LocalCart {
  items: LocalCartItem[];
}

export const getCartFromStorage = (): LocalCart | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalCart;
  } catch {
    return null;
  }
};

export const setCartToStorage = (cart: LocalCart | null) => {
  if (typeof window === "undefined") return;

  if (!cart || cart.items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addItemToCart = (slug: string, quantity: number) => {
  if (typeof window === "undefined") return null;

  const existing = getCartFromStorage();
  const items = existing?.items ? [...existing.items] : [];

  const index = items.findIndex((item) => item.slug === slug);
  if (index >= 0) {
    const existingItem = items[index];
    items[index] = {
      ...existingItem,
      quantity: existingItem.quantity + quantity,
    };
  } else {
    items.push({
      slug,
      quantity,
    });
  }

  const cart: LocalCart = { items };
  setCartToStorage(cart);

  // 通知其他組件（例如 Navbar）購物車已更新
  window.dispatchEvent(new Event("cart-updated"));

  return cart;
};

export const clearCartStorage = () => {
  setCartToStorage(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
};
