"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import R2PresignedImage from "./R2PresignedImage";
import { getCartFromStorage } from "@/utils/cartStorage";
import { api } from "@/utils/eden";
import type { product } from "@/api/modules/products/model";

type CartItem = {
  slug: string;
  quantity: number;
  product: product | null;
  total: number;
};

type CartView = {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  grandTotal: number;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartButtonWithModal() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartView | null>(null);

  useEffect(() => {
    const buildCartFromServer = async () => {
      const stored = getCartFromStorage();
      if (!stored || !stored.items || stored.items.length === 0) {
        setCart(null);
        return;
      }

      try {
        const cartItems: CartItem[] = await Promise.all(
          stored.items.map(async (item) => {
            try {
              const { data } = await api.products({ slug: item.slug }).get();
              const productData = data?.product ?? null;
              const price = productData?.price ?? 0;
              return {
                slug: item.slug,
                quantity: item.quantity,
                product: productData,
                total: price * item.quantity,
              };
            } catch {
              return {
                slug: item.slug,
                quantity: item.quantity,
                product: null,
                total: 0,
              };
            }
          })
        );

        const subtotal = cartItems.reduce((sum, i) => sum + i.total, 0);
        const shipping = 50;
        const vat = Math.round(subtotal * 0.2);
        const grandTotal = subtotal + shipping + vat;

        setCart({
          cartItems,
          subtotal,
          shipping,
          vat,
          grandTotal,
        });
      } catch (error) {
        console.error("Failed to build cart from server data:", error);
        setCart(null);
      }
    };

    void buildCartFromServer();

    const handleCartUpdated = () => {
      void buildCartFromServer();
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  const itemCount =
    cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCartOpen((prev) => !prev)}
        className="relative"
        aria-label="Open cart"
      >
        <ShoppingCart width={20} height={20} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange text-xs rounded-full px-1.5 py-0.5">
            {itemCount}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center px-4">
          <div className="mt-24 w-full max-w-md bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h6 className="uppercase">Cart</h6>
              <button
                type="button"
                className="text-body text-black/50 hover:text-orange"
                onClick={() => setIsCartOpen(false)}
              >
                Close
              </button>
            </div>

            {!cart || cart.cartItems.length === 0 ? (
              <p className="text-body text-black/50">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.cartItems.map((item) => (
                    <div key={item.slug} className="flex items-center gap-4">
                      {item.product && (
                        <>
                          <R2PresignedImage
                            src={item.product.image}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-black">
                              {item.product.name}
                            </p>
                            <p className="text-body text-black/50">
                              {formatPrice(item.product.price)} x{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-black">
                            {formatPrice(item.total)}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-body text-black/50 uppercase">
                    Total
                  </span>
                  <span className="font-bold text-black">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors"
                >
                  Checkout
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
