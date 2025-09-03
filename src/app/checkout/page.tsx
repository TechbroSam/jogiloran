// src/app/checkout/page.tsx
"use client";

import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";
import ShippingAddressForm, { Address } from "@/components/ShippingAddressForm"; // Import the Address type
import OrderSummary from "@/components/OrderSummary";
import PaymentOptions from "@/components/PaymentOptions";
import Link from "next/link";

export default function CheckoutPage() {
  const { items } = useCartStore();
  const [settings, setSettings] = useState<{ discountPercentage?: number }>({});
  const [shippingCost, setShippingCost] = useState(0);
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      window.location.href = "/cart";
    }
    const getSiteSettings = async () => {
      const query = `*[_type == "siteSettings"][0]{ discountPercentage }`;
      const data = await client.fetch(query);
      setSettings(data || {});
    };
    getSiteSettings();
  }, [items]);

  const discount = settings?.discountPercentage || 0;
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // This function handles the submitted address
  const handleAddressSubmit = (address: Address) => {
    setShippingAddress(address); // Save the address
    setIsAddressSubmitted(true); // Show the payment options
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Checkout
          </h1>
          <Link
            href="/cart"
            className="text-sm font-medium text-orange-700 hover:text-orange-600"
          >
            &larr; Back to Cart
          </Link>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <main className="lg:col-span-7">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                Shipping Address
              </h2>
              <ShippingAddressForm
                onShippingCostChange={setShippingCost}
                onAddressSubmit={handleAddressSubmit} // Use the new handler function
              />
            </div>
          </main>

          <aside className="mt-16 rounded-lg bg-gray-50 p-6 lg:col-span-5 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <OrderSummary shippingCost={shippingCost} discount={discount} />

            {isAddressSubmitted && (
              <div className="mt-6 border-t pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Payment
                </h2>
                <PaymentOptions
                  subtotal={subtotal}
                  discount={discount}
                  shippingCost={shippingCost}
                  shippingAddress={shippingAddress} // Pass address to payment options
                />
              </div>
            )}
            <div className="mt-16 rounded-lg bg-gray-50 p-6 flex flex-col items-start">
            <h2 className="md:text-lg font-medium text-gray-900">This app is in sandbox mode</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please use only <a href="https://www.sandbox.paypal.com/uk/webapps/mpp/account-selection" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline hover:text-orange-600">sandbox paypal</a> and <a href="https://docs.stripe.com/testing" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline hover:text-orange-600">test stripe cards</a> to checkout.
            </p>
          </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
