// src/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { client as sanityClient } from '@/lib/sanity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product', 'shipping_details'],
    });

    const shippingDetails = (fullSession as any).shipping_details;
    const customerEmail = fullSession.customer_details?.email;
    const lineItems = fullSession.line_items?.data || [];
    
    if (!shippingDetails || !customerEmail) {
      return NextResponse.json({ error: 'Missing required session info' }, { status: 400 });
    }
    
    await dbConnect();
    
    try {
      const newOrder = new Order({
        userEmail: customerEmail,
        products: lineItems.map((item: any) => ({
          productId: item.price?.product?.metadata?.sanityProductId,
          name: item.price?.product?.name,
          quantity: item.quantity,
          price: (item.price?.unit_amount ?? 0) / 100,
        })),
        totalAmount: (fullSession.amount_total ?? 0) / 100,
        shippingAddress: {
          name: shippingDetails.name,
          address: shippingDetails.address,
        },
        isPaid: true,
      });
      await newOrder.save();

      const transaction = sanityClient.transaction();
      for (const item of lineItems) {
        const product = item.price?.product as Stripe.Product;
        const sanityProductId = product.metadata.sanityProductId;
        const purchasedSize = product.metadata.size;
        const quantityPurchased = item.quantity!;
        
        if (!sanityProductId) continue;

        if (purchasedSize) {
          transaction.patch(sanityProductId, (p) =>
            p.dec({ [`sizes[size=="${purchasedSize}"].stock`]: quantityPurchased })
          );
        } else {
          transaction.patch(sanityProductId, (p) => p.dec({ stock: quantityPurchased }));
        }
      }
      await transaction.commit();

    } catch (dbError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}