// src/types/order.ts

export interface IOrder {
  _id: string;
  userEmail: string;
  createdAt: string;
  totalAmount: number;
  isShipped: boolean;
  shippingAddress: {
    name: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  products: { name: string; quantity: number }[];
}