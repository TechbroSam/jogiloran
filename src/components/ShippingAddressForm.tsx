// src/components/ShippingAddressForm.tsx
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";

// Export the Address interface so other components can use it
export interface Address {
  name: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingAddressFormProps {
  onShippingCostChange: (cost: number) => void;
  onAddressSubmit: (address: Address) => void;
}

export default function ShippingAddressForm({ onShippingCostChange, onAddressSubmit }: ShippingAddressFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Address>({
    name: session?.user?.name || '',
    address1: '',
    city: '',
    postalCode: '',
    country: 'GB',
  });

  // This effect calculates the shipping cost whenever the country changes.
  useEffect(() => {
    let cost = 0;
    if (formData.country === 'US' || formData.country === 'CA') {
      cost = 50;
    }
    onShippingCostChange(cost);
  }, [formData.country, onShippingCostChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you might do more validation here.
    onAddressSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <input type="text" id="address1" name="address1" value={formData.address1} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
          {/* FIX: Wrapper for custom dropdown arrow styling */}
          <div className="relative mt-1">
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="block w-full appearance-none rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      <button 
        type="submit" 
        className="mt-6 w-full cursor-pointer rounded-md border border-transparent bg-orange-700 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-orange-800"
      >
        Confirm Address & View Payment Options
      </button>
    </form>
  );
}