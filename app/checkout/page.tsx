"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/eden";
import R2PresignedImage from "@/components/R2PresignedImage";
import { VALIDATION_MESSAGES, ERROR_MESSAGES } from "./validation";
import { getCartFromStorage } from "@/utils/cartStorage";
import type { product } from "@/api/modules/products/model";

// Use Eden Treaty type inference
type CheckoutPostResult = Awaited<ReturnType<typeof api.checkout.post>>;
type CheckoutResponse = NonNullable<CheckoutPostResult["data"]>;

type CartItem = {
  slug: string;
  quantity: number;
  product: product | null;
  total: number;
};

type CartResponse = {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  grandTotal: number;
};

// Infer checkout body type from API
type CheckoutBody = NonNullable<
  Awaited<ReturnType<typeof api.checkout.post>>["data"]
>["receivedPayload"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState<CheckoutResponse | null>(null);

  const [formData, setFormData] = useState<CheckoutBody>({
    name: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    country: "",
    payment: "emoney",
    emoneyNumber: "",
    emoneyPin: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutBody, string>>
  >({});

  useEffect(() => {
    const buildCartFromServer = async () => {
      // 僅從 localStorage 取得數量與商品 slug，價格與其他資料由伺服器提供
      const stored = getCartFromStorage();
      if (!stored || stored.items.length === 0) {
        setCart(null);
        setLoading(false);
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
        console.error("Failed to load cart from server:", error);
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    void buildCartFromServer();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutBody, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = VALIDATION_MESSAGES.name.required;
    }
    if (!formData.email?.trim()) {
      newErrors.email = VALIDATION_MESSAGES.email.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email.invalid;
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.phone.required;
    }
    if (!formData.address?.trim()) {
      newErrors.address = VALIDATION_MESSAGES.address.required;
    }
    if (!formData.zip?.trim()) {
      newErrors.zip = VALIDATION_MESSAGES.zip.required;
    }
    if (!formData.city?.trim()) {
      newErrors.city = VALIDATION_MESSAGES.city.required;
    }
    if (!formData.country?.trim()) {
      newErrors.country = VALIDATION_MESSAGES.country.required;
    }
    if (!formData.payment) {
      newErrors.payment = VALIDATION_MESSAGES.payment.required;
    }
    if (formData.payment === "emoney") {
      if (!formData.emoneyNumber?.trim()) {
        newErrors.emoneyNumber = VALIDATION_MESSAGES.emoneyNumber.required;
      }
      if (!formData.emoneyPin?.trim()) {
        newErrors.emoneyPin = VALIDATION_MESSAGES.emoneyPin.required;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { data, error } = await api.checkout.post(formData);
      if (error || !data) {
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : ERROR_MESSAGES.checkoutFailed;
        alert(errorMessage);
        return;
      }
      setOrderData(data);
      setShowSuccess(true);
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.checkoutFailed;
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutBody]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-24 text-center">
        <p>{ERROR_MESSAGES.loading}</p>
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-24 text-center">
        <h2 className="mb-4">{ERROR_MESSAGES.cartEmpty}</h2>
        <Link
          href="/"
          className="uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors inline-block"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (showSuccess && orderData) {
    const otherItemsCount = orderData.cartItems.length - 1;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 md:p-8 lg:p-12 max-w-lg w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2">Thank you for your order</h2>
            <p className="text-body text-black/50">
              You will receive an email confirmation shortly.
            </p>
          </div>

          <div className="bg-gray rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {orderData.cartItems[0]?.product && (
                  <>
                    <R2PresignedImage
                      src={orderData.cartItems[0].product.image}
                      alt={orderData.cartItems[0].product.name}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-black">
                        {orderData.cartItems[0].product.name}
                      </p>
                      <p className="text-body text-black/50">
                        {formatPrice(orderData.cartItems[0].product.price)} x{" "}
                        {orderData.cartItems[0].quantity}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <p className="font-bold text-black">
                {formatPrice(orderData.cartItems[0]?.total || 0)}
              </p>
            </div>
            {otherItemsCount > 0 && (
              <div className="pt-4 border-t border-black/10">
                <p className="text-body text-black/50 text-center">
                  and {otherItemsCount} other item(s)
                </p>
              </div>
            )}
          </div>

          <div className="bg-black rounded-lg p-6 text-white">
            <p className="text-body text-white/50 mb-2 uppercase">
              Grand total
            </p>
            <p className="text-2xl font-bold">
              {formatPrice(orderData.grandTotal)}
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-6 uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-8 md:py-16 overflow-scroll">
      <Link
        href="/"
        className="text-body text-black/50 hover:text-orange mb-8 inline-block transition-colors"
      >
        Go back
      </Link>

      <h1 className="mb-8 md:mb-12">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Checkout Form */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 md:p-8">
          {/* Billing Details */}
          <h6 className="text-orange mb-6 uppercase">Billing Details</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="name"
                className="block text-body font-bold mb-2 text-black"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.name ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="Alexei Ward"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-body font-bold mb-2 text-black"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="alexei@mail.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-body font-bold mb-2 text-black"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.phone ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="+1 202-555-0136"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <h6 className="text-orange mb-6 uppercase">Shipping Info</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-body font-bold mb-2 text-black"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.address ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="1137 Williams Avenue"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="zip"
                className="block text-body font-bold mb-2 text-black"
              >
                ZIP Code
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.zip ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="10001"
              />
              {errors.zip && (
                <p className="text-red-500 text-sm mt-1">{errors.zip}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-body font-bold mb-2 text-black"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.city ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="New York"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-body font-bold mb-2 text-black"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.country ? "border-red-500" : "border-black/20"
                } focus:outline-none focus:border-orange`}
                placeholder="United States"
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <h6 className="text-orange mb-6 uppercase">Payment Details</h6>
          <div className="mb-6">
            <label className="block text-body font-bold mb-4 text-black">
              Payment Method
            </label>
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-orange transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="emoney"
                  checked={formData.payment === "emoney"}
                  onChange={handleChange}
                  className="mr-4"
                />
                <span className="text-body font-bold text-black">e-Money</span>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-orange transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={formData.payment === "cash"}
                  onChange={handleChange}
                  className="mr-4"
                />
                <span className="text-body font-bold text-black">
                  Cash on Delivery
                </span>
              </label>
            </div>
            {errors.payment && (
              <p className="text-red-500 text-sm mt-1">{errors.payment}</p>
            )}
          </div>

          {formData.payment === "emoney" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="emoneyNumber"
                  className="block text-body font-bold mb-2 text-black"
                >
                  e-Money Number
                </label>
                <input
                  type="text"
                  id="emoneyNumber"
                  name="emoneyNumber"
                  value={formData.emoneyNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.emoneyNumber ? "border-red-500" : "border-black/20"
                  } focus:outline-none focus:border-orange`}
                  placeholder="238521993"
                />
                {errors.emoneyNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.emoneyNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="emoneyPin"
                  className="block text-body font-bold mb-2 text-black"
                >
                  e-Money PIN
                </label>
                <input
                  type="text"
                  id="emoneyPin"
                  name="emoneyPin"
                  value={formData.emoneyPin}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.emoneyPin ? "border-red-500" : "border-black/20"
                  } focus:outline-none focus:border-orange`}
                  placeholder="6891"
                />
                {errors.emoneyPin && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.emoneyPin}
                  </p>
                )}
              </div>
            </div>
          )}

          {formData.payment === "cash" && (
            <div className="bg-gray rounded-lg p-4">
              <p className="text-body text-black/50">
                The &apos;Cash on Delivery&apos; option enables you to pay in
                cash when our delivery courier arrives at your residence. Just
                make sure your address is correct so that your order will not be
                cancelled.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 md:p-8">
            <h6 className="mb-6 uppercase">Summary</h6>
            <div className="space-y-4 mb-6">
              {cart.cartItems.map((item) => (
                <div key={item.slug} className="flex items-center gap-4">
                  {item.product && (
                    <>
                      <R2PresignedImage
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-black">
                          {item.product.name}
                        </p>
                        <p className="text-body text-black/50">
                          {formatPrice(item.product.price)} x {item.quantity}
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

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-body text-black/50 uppercase">Total</span>
                <span className="font-bold text-black">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body text-black/50 uppercase">
                  Shipping
                </span>
                <span className="font-bold text-black">
                  {formatPrice(cart.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body text-black/50 uppercase">VAT</span>
                <span className="font-bold text-black">
                  {formatPrice(cart.vat)}
                </span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-body text-black/50 uppercase">
                Grand Total
              </span>
              <span className="text-lg font-bold text-orange">
                {formatPrice(cart.grandTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full uppercase bg-orange text-white px-8 py-3 hover:bg-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : "Continue & Pay"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
