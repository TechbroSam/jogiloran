// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string;
  stock: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, size?: string) => void;
  increaseQuantity: (itemId: string, size?: string) => void;
  decreaseQuantity: (itemId: string, size?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i._id === item._id && i.size === item.size);
        if (existingItem) {
          get().increaseQuantity(item._id, item.size);
        } else if (item.stock > 0) {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      // UPDATED: increaseQuantity now respects the stock limit
      increaseQuantity: (itemId, size) => {
        set({
          items: get().items.map((item) => {
            if (item._id === itemId && item.size === size && item.quantity < item.stock) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        });
      },
      decreaseQuantity: (itemId, size) => {
        set({
          items: get().items.map((item) =>
            item._id === itemId && item.size === size && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        });
      },
      removeItem: (itemId, size) => {
        set({ items: get().items.filter((item) => !(item._id === itemId && item.size === size)) });
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