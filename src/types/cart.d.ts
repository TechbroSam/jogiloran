// src/types/cart.d.ts
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  stock?: number;
  slug?: string;
  imageUrl?: string;
}