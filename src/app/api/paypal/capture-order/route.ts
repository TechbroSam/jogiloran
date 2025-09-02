// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { writeClient as sanityClient } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { Resend } from 'resend';
import OrderConfirmationEmail from '../../../../../emails/OrderConfirmationEmail';
import { CartItem } from '@/types/cart';


const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const loggedInSession = await getServerSession(authOptions);

  try {
    const { orderID, cartItems }: { orderID: string; cartItems: CartItem[] } = await request.json();
    
    const paypalRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    const capture = await client.execute(paypalRequest);
    const capturedOrder = capture.result;

    const shippingDetails = capturedOrder.purchase_units[0].shipping;
    const capturedAmount = capturedOrder.purchase_units[0].payments.captures[0].amount.value;
    const userEmail = loggedInSession?.user?.email || capturedOrder.payer.email_address;

    await dbConnect();
    
    const newOrder = new Order({
      userEmail: userEmail,
      products: cartItems.map((item: CartItem) => ({
        productId: item._id,
        name: `${item.name}${item.size ? ` - Size: ${item.size}` : ''}`,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: parseFloat(capturedAmount),
      shippingAddress: {
        name: shippingDetails.name.full_name,
        address: {
          line1: shippingDetails.address.address_line_1,
          line2: shippingDetails.address.address_line_2 || null,
          city: shippingDetails.address.admin_area_2,
          state: shippingDetails.address.admin_area_1,
          postal_code: shippingDetails.address.postal_code,
          country: shippingDetails.address.country_code,
        },
      },
      isPaid: true,
    });
    await newOrder.save();

    // --- NON-CRITICAL TASKS WITH SEPARATE ERROR HANDLING ---
    // These tasks will be attempted, but their failure will not stop the checkout process.

    // 1. Attempt to send confirmation email
    try {
      await resend.emails.send({
        from: 'Axion Leather <sales@samuelobior.com>',
        to: newOrder.userEmail,
        subject: `Order Confirmation - #${newOrder._id.toString().slice(-6)}`,
        react: OrderConfirmationEmail({
          orderId: newOrder._id.toString(),
          orderDate: newOrder.createdAt.toLocaleDateString('en-GB'),
          totalAmount: newOrder.totalAmount.toFixed(2),
          shippingAddress: newOrder.shippingAddress,
          products: newOrder.products,
        }),
      });
    } catch (emailError: unknown) {
      console.error("!!! FAILED TO SEND PAYPAL CONFIRMATION EMAIL !!!", emailError);
    }

    // 2. Attempt to decrement stock in Sanity
    try {
      const transaction = sanityClient.transaction();
      cartItems.forEach((item: CartItem) => {
        if (item.size) {
          transaction.patch(item._id, (p) => p.dec({ [`sizes[size=="${item.size}"].stock`]: item.quantity }));
        } else {
          transaction.patch(item._id, (p) => p.dec({ stock: item.quantity }));
        }
      });
      await transaction.commit();
    } catch (stockError: unknown) {
      console.error("!!! FAILED TO DECREMENT STOCK FOR PAYPAL ORDER !!!", stockError);
    }
    // --- END OF NON-CRITICAL TASKS ---

    // Since the order was saved, we can now send a success response to the frontend.
    return NextResponse.json({ success: true, orderId: newOrder._id });

  } catch (error: unknown) {
    console.error("Failed to capture PayPal order:", error);
    return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
  }
}