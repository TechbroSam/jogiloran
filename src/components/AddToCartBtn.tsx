// src/components/AddToCartBtn.tsx
'use client';

import { useCartStore, CartItem } from '@/lib/store';

export default function AddToCartBtn({ product }: { product: CartItem }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    // You could add a user notification (a "toast") here
    console.log(`${product.name} added to cart`);
  };

  return (
    <button
      onClick={handleAddToCart}
      type="button"
      className="flex-1 rounded-lg bg-orange-700 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-orange-300 transition duration-100 hover:bg-orange-800 focus-visible:ring active:bg-orange-900 sm:flex-none md:text-base"
    >
      Add to cart
    </button>
  );
}