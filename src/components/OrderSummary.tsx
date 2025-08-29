// src/components/OrderSummary.tsx
'use client';

import { useCartStore } from "@/lib/store";

interface OrderSummaryProps {
  shippingCost: number;
  discount: number;
}

export default function OrderSummary({ shippingCost, discount }: OrderSummaryProps) {
  const { items } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + shippingCost;

  return (
    <dl className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <dt className="text-sm">Subtotal</dt>
        <dd className="text-sm font-medium">£{subtotal.toFixed(2)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="flex items-center text-sm"><span>Discount ({discount}%)</span></dt>
          <dd className="text-sm font-medium text-red-600">- £{discountAmount.toFixed(2)}</dd>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="text-sm">Shipping</dt>
        <dd className="text-sm font-medium">£{shippingCost.toFixed(2)}</dd>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="text-base font-medium">Order total</dt>
        <dd className="text-base font-medium">£{total.toFixed(2)}</dd>
      </div>
    </dl>
  );
}