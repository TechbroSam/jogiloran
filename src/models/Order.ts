// src/models/Order.ts
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  products: [
    {
      productId: { type: String },
      name: { type: String },
      quantity: { type: Number },
      price: { type: Number },
    },
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postal_code: { type: String },
      country: { type: String },
    },
  },
  isPaid: { type: Boolean, default: false },
  isShipped: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);