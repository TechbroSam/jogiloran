// src/app/api/orders/route.ts
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await dbConnect();
  const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });

  return NextResponse.json({ orders });
}