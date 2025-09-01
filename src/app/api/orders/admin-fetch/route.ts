// src/app/api/orders/admin-fetch/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Extend the next-auth Session type to include isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & import('next-auth').DefaultSession['user'];
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  // Ensure the user is an admin
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}