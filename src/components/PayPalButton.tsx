// src/components/PayPalButton.tsx
'use client';

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function PayPalButton() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "GBP" }}>
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
        createOrder={async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items),
          });
          const data = await res.json();
          return data.orderID;
        }}
        onApprove={async (data) => {
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderID: data.orderID,
              cartItems: items,
            }),
          });
          const orderData = await res.json();
          if (orderData.success) {
            clearCart();
            router.push('/success');
          } else {
            // Handle error
            console.error('Failed to finalize PayPal order.');
          }
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
}