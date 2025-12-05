"use client";

import { useState } from "react";
import type { product } from "@/api/modules/products/model";
import { addItemToCart } from "@/utils/cartStorage";
import { toast } from "sonner";

interface ProductAddToCartProps {
  product: product;
}

export default function ProductAddToCart({ product }: ProductAddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  const isValid = quantity > 0; // Check quantity > 0 in the stock, or not available, cart would only save for 30 minutes

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!isValid) return;
    // 僅將商品數量存入 localStorage，其餘價格與資訊由伺服器提供
    addItemToCart(product.slug, quantity);
    // Reset quantity after adding to cart
    setQuantity(1);
    toast.success("Product has been add to the cart!");
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-gray">
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity <= 1}
          className="px-4 py-3 text-black/50 hover:text-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="px-6 py-3 text-body font-bold text-black">
          {quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(1)}
          className="px-4 py-3 text-black/50 hover:text-orange transition-colors font-bold"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={!isValid}
        className="uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
      >
        ADD TO CART
      </button>
    </div>
  );
}
