// src/components/ShippingInfo.tsx
import { Truck, Globe } from 'lucide-react';

export default function ShippingInfo() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-white p-4 shadow-sm">
              <Truck className="h-8 w-8 text-orange-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Free UK Shipping</h3>
              <p className="mt-1 text-sm text-gray-600">
                Enjoy complimentary shipping on all orders within the United Kingdom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-white p-4 shadow-sm">
              <Globe className="h-8 w-8 text-orange-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold">International Shipping</h3>
              <p className="mt-1 text-sm text-gray-600">
                A flat rate of £50 applies to all orders to the US and Canada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}