// src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { CartItem } from '@/lib/store';

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request: NextRequest) {
  try {
    const cartItems = (await request.json()) as CartItem[];
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer("return=representation");
    paypalRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: subtotal.toFixed(2),
        },
      }],
    });

    const order = await client.execute(paypalRequest);
    return NextResponse.json({ orderID: order.result.id });

  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}