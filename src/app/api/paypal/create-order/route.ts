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
    // Receive items, discount, AND shippingCost from the request
    const { items: cartItems, discount, shippingCost, shippingAddress } = await request.json();
    
    const itemTotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
    const discountAmount = (itemTotal * (discount || 0)) / 100;
    // The final total now includes shipping
    const finalTotal = itemTotal - discountAmount + shippingCost;

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer("return=representation");
    paypalRequest.requestBody({
      intent: 'CAPTURE',
        // Pre-fill the shipping information for PayPal
      application_context: {
        shipping_preference: 'SET_PROVIDED_ADDRESS',
      },
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: finalTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'GBP',
              value: itemTotal.toFixed(2),
            },
            discount: {
              currency_code: 'GBP',
              value: discountAmount.toFixed(2),
            },
            // Add the shipping cost to the breakdown
            shipping: {
              currency_code: 'GBP',
              value: shippingCost.toFixed(2),
            },
            handling: { currency_code: 'GBP', value: '0.00' },
            insurance: { currency_code: 'GBP', value: '0.00' },
            shipping_discount: { currency_code: 'GBP', value: '0.00' },
            tax_total: { currency_code: 'GBP', value: '0.00' },
          }
        },
        shipping: {
          name: {
            full_name: shippingAddress.name,
          },
          address: {
            address_line_1: shippingAddress.address1,
            admin_area_2: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            country_code: shippingAddress.country,
          }
        }
      }],
    });

    const order = await client.execute(paypalRequest);
    return NextResponse.json({ orderID: order.result.id });

  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json({ error: "Failed to create PayPal order." }, { status: 500 });
  }
}