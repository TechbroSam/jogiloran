// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { CartItem } from "@/lib/store";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { client as sanityClient } from "@/lib/sanity";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const getSiteSettings = async () => {
  const query = `*[_type == "siteSettings"][0]{ discountPercentage }`;
  return sanityClient.fetch(query);
};

interface SanityProduct {
  _id: string;
  name: string;
  stock?: number;
  sizes?: { _key: string; size: string; stock: number }[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const { items: cartItems, discount } = (await request.json()) as {
      items: CartItem[];
      discount: number;
    };
    const productIds = cartItems.map((item) => item._id);

    // FIX: Destructure the incoming object to get the 'items' array and 'discount'

    const sanityProducts: SanityProduct[] = await sanityClient.fetch(
      `*[_type == "product" && _id in $productIds]{_id, name, stock, "sizes": sizes[]{_key, size, stock}}`,
      { productIds }
    );

    for (const item of cartItems) {
      const productInSanity = sanityProducts.find((p) => p._id === item._id);
      if (!productInSanity) {
        return NextResponse.json(
          { error: `Product "${item.name}" not found.` },
          { status: 404 }
        );
      }

      let availableStock = 0;
      if (item.size && productInSanity.sizes) {
        const sizeVariant = productInSanity.sizes.find(
          (s) => s.size === item.size
        );
        if (!sizeVariant)
          return NextResponse.json(
            { error: `Size "${item.size}" for "${item.name}" not found.` },
            { status: 404 }
          );
        availableStock = sizeVariant.stock;
      } else if (productInSanity.stock !== undefined) {
        availableStock = productInSanity.stock;
      }

      if (item.quantity > availableStock) {
        const sizeText = item.size ? ` (Size: ${item.size})` : "";
        return NextResponse.json(
          {
            error: `Sorry, we only have ${availableStock} of "${item.name}"${sizeText} left.`,
          },
          { status: 400 }
        );
      }
    }

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.name}${item.size ? ` - Size: ${item.size}` : ""}`,
          images: [item.imageUrl],
          metadata: { sanityProductId: item._id, size: item.size || "" },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: session?.user?.email || undefined,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cart`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "CA"],
      },
      shipping_options: [
        { shipping_rate: process.env.STRIPE_UK_SHIPPING_RATE_ID! },
        { shipping_rate: process.env.STRIPE_INTERNATIONAL_SHIPPING_RATE_ID! },
      ],
    };

    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discount,
        duration: "once",
      });
      params.discounts = [{ coupon: coupon.id }];
    }

    const stripeSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (err: any) {
    console.error("Error creating Stripe session:", err);
    return NextResponse.json(
      { error: err.message || "Error creating checkout session" },
      { status: 500 }
    );
  }
}
