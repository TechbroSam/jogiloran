// src/app/cart/page.tsx
'use client';

import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import PayPalButton from "@/components/PayPalButton";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const { items, removeItem, increaseQuantity, decreaseQuantity } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "An unknown error occurred.");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe.js hasn't loaded yet.");

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>
            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {items.length > 0 ? (
                items.map((product) => (
                  <li key={`${product._id}-${product.size || ""}`} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={250}
                        height={250}
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <h3 className="text-sm">
                            <Link href={`/product/${product.slug}`} className="font-medium text-gray-700 hover:text-gray-800">{product.name}</Link>
                          </h3>
                          {product.size && <p className="mt-1 text-sm text-gray-500">Size: {product.size}</p>}
                          <p className="mt-1 text-sm font-medium text-gray-900">£{product.price.toFixed(2)}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <div className="flex justify-between items-center rounded border px-3">
                            <button onClick={() => decreaseQuantity(product._id, product.size)} className="px-3 py-1 hover:bg-gray-100">-</button>
                            <span className="px-4 text-sm">{product.quantity}</span>
                            <button onClick={() => increaseQuantity(product._id, product.size)} disabled={product.quantity >= product.stock} className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                          </div>
                          <div className="absolute top-0 right-0">
                            <button type="button" onClick={() => removeItem(product._id, product.size)} className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                              <span className="sr-only">Remove</span>
                              <Trash2 className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="py-6">
                  <p>Your cart is empty.</p>
                  <Link href="/" className="text-orange-700 font-semibold hover:underline mt-2 inline-block">
                    Continue Shopping &rarr;
                  </Link>
                </div>
              )}
            </ul>
          </section>

          {/* Order summary - Conditionally render if cart is not empty */}
          {items.length > 0 && (
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-medium text-gray-900">Order summary</h2>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">£{subtotal.toFixed(2)}</dd>
                </div>
              </dl>
              {error && (
                <div className="text-center text-sm text-red-600 mt-4">
                  <p>{error}</p>
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full rounded-md border border-transparent bg-orange-700 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Checkout with Card"}
                </button>
              </div>
              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-50 px-2 text-sm text-gray-500">OR</span>
                </div>
              </div>
              <div className="mt-4">
                <PayPalButton />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}