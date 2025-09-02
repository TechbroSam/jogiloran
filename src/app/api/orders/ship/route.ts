// src/app/api/orders/ship/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { Resend } from 'resend';
import ShippedEmail from '../../../../../emails/ShippedEmail';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

// Extend the next-auth Session type to include isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & import('next-auth').DefaultSession['user'];
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Find the order by its _id and update it to set isShipped to true
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { isShipped: true }, 
      { new: true } // This option returns the updated document
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Now that the order is successfully updated, send the shipping confirmation email
    try {
      await resend.emails.send({
        from: 'Axion Leather <sales@samuelobior.com>',
        to: updatedOrder.userEmail,
        subject: `Your Order #${updatedOrder._id.toString().slice(-6)} has shipped!`,
        react: ShippedEmail({
          orderId: updatedOrder._id.toString(),
          shippedDate: new Date().toLocaleDateString('en-GB'),
        }),
      });
    } catch (emailError: unknown) {
      console.error("!!! FAILED TO SEND SHIPPED CONFIRMATION EMAIL !!!", emailError);
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error: unknown) {
    console.error("Failed to ship order:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}