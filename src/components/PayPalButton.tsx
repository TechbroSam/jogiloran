// src/components/PayPalButton.tsx
"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Address } from "./ShippingAddressForm"; // Import the Address type

interface PayPalButtonProps {
  subtotal: number;
  discount: number;
  shippingCost: number; // Accept shippingCost
   shippingAddress: Address | null; // Accept the address
}

export default function PayPalButton({
  subtotal,
  discount,
  shippingCost,
  shippingAddress,
}: PayPalButtonProps) {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

  if (!paypalClientId || !shippingAddress) {
    return <div className="text-center text-sm text-gray-500 py-3">Please confirm address to use PayPal.</div>;
  }

  return (
    <PayPalScriptProvider
      options={{ clientId: paypalClientId, currency: "GBP" }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        }}
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Send all three values to the backend
            body: JSON.stringify({ items, subtotal, discount, shippingCost, shippingAddress }),
          });
          const data = await res.json();
          return data.orderID;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderID: data.orderID,
              cartItems: items,
            }),
          });
          if (res.ok) {
            clearCart();
            router.push("/success");
          } else {
            console.error("Failed to finalize PayPal order.");
          }
        }}
        onError={(err: unknown) => console.error("PayPal Checkout Error:", err)}
      />
    </PayPalScriptProvider>
  );
}