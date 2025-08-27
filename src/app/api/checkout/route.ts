// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { CartItem } from '@/lib/store';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { client as sanityClient } from '@/lib/sanity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface SanityProduct {
  _id: string;
  name: string;
  stock?: number;
  sizes?: { _key: string; size: string; stock: number }[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  try {
    const cartItems = (await request.json()) as CartItem[];
    const productIds = cartItems.map(item => item._id);
    
    const sanityProducts: SanityProduct[] = await sanityClient.fetch(
      `*[_type == "product" && _id in $productIds]{_id, name, stock, "sizes": sizes[]{_key, size, stock}}`,
      { productIds }
    );

    for (const item of cartItems) {
      const productInSanity = sanityProducts.find(p => p._id === item._id);
      if (!productInSanity) {
        return NextResponse.json({ error: `Product "${item.name}" not found.` }, { status: 404 });
      }

      let availableStock = 0;
      if (item.size && productInSanity.sizes) {
        const sizeVariant = productInSanity.sizes.find(s => s.size === item.size);
        if (!sizeVariant) return NextResponse.json({ error: `Size "${item.size}" for "${item.name}" not found.` }, { status: 404 });
        availableStock = sizeVariant.stock;
      } else if (productInSanity.stock !== undefined) {
        availableStock = productInSanity.stock;
      }

      if (item.quantity > availableStock) {
        const sizeText = item.size ? ` (Size: ${item.size})` : '';
        return NextResponse.json({ error: `Sorry, we only have ${availableStock} of "${item.name}"${sizeText} left.` }, { status: 400 });
      }
    }

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `${item.name}${item.size ? ` - Size: ${item.size}` : ''}`,
          images: [item.imageUrl],
          metadata: { sanityProductId: item._id, size: item.size || '' },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: session?.user?.email || undefined,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cart`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['GB', 'US', 'CA'] },
    });

    return NextResponse.json({ sessionId: stripeSession.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating checkout session' }, { status: 500 });
  }
}