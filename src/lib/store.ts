// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void; // New action
  decreaseQuantity: (itemId: string) => void; // New action
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i._id === item._id);
        if (existingItem) {
          get().increaseQuantity(item._id); // Use the new action
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item._id !== itemId) });
      },
      increaseQuantity: (itemId) => {
        set({
          items: get().items.map((item) =>
            item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        });
      },
      decreaseQuantity: (itemId) => {
        set({
          items: get().items.map((item) =>
            item._id === itemId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ).filter(item => item.quantity > 0), // Optional: remove if quantity becomes 0
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);