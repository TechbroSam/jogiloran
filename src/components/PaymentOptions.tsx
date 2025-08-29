// src/components/PaymentOptions.tsx
'use client';

import { useState } from 'react';
import PayPalButton from "./PayPalButton";
import { useCartStore } from '@/lib/store';
import { loadStripe } from '@stripe/stripe-js';

// FIX: The variable name was incorrect. It's NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, not PUBLISHER_KEY.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentOptions({ subtotal, discount, shippingCost }: { subtotal: number, discount: number, shippingCost: number }) {
  const { items } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal, discount, shippingCost  }),
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
    <div>
      <button
        onClick={handleStripeCheckout}
        disabled={isLoading}
        className="w-full rounded-md border border-transparent bg-black py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-500"
      >
        {isLoading ? 'Processing...' : 'Pay with Card'}
      </button>

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-2 text-sm text-gray-500">OR</span>
        </div>
      </div>
      <div className="mt-4">
        <PayPalButton subtotal={subtotal} discount={discount} shippingCost={shippingCost} />
      </div>
    </div>
  );
}