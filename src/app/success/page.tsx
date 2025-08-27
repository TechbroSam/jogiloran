// src/app/success/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  // Clear the cart when the component mounts
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-8">
        Thank you for your order. A confirmation email has been sent to you.
      </p>
      <Link href="/" className="bg-orange-700 text-white px-6 py-3 rounded-md hover:bg-orange-800">
        Continue Shopping
      </Link>
    </div>
  );
}