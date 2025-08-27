// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { writeClient as sanityClient } from "@/lib/sanity";
import OrderConfirmationEmail from "../../../../../emails/OrderConfirmationEmail";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log("Stripe webhook received" + req);
  const body = await req.text();

  // FIX: Get the headers object correctly
  // FIX: Added 'await' to the headers() call
  const signature = (await headers()).get("stripe-signature") as string;

  console.log("signasture" + signature);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
  console.log("event" + event);

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the full session object to get all necessary details
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      // FIX: Expand shipping_details and customer to ensure they are included
      expand: ["line_items.data.price.product", "customer"],
    });

    // Use 'any' to bypass the type error and then safely access the properties
    const sessionData = fullSession as any;
    console.log(sessionData);
    const lineItems: any[] = sessionData.line_items?.data || [];
    const shippingDetails = sessionData.customer_details;

    const customerEmail = fullSession.customer_details?.email;

    if (!customerEmail) {
      console.error("Webhook Error: Customer email not found in session.");
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    if (!shippingDetails) {
      return NextResponse.json(
        { error: "Missing required shipping details in session information" },
        { status: 400 }
      );
    }

    await dbConnect();

    try {
      const newOrder = new Order({
        userEmail: customerEmail,
        products: lineItems.map((item) => {
          const product = item.price?.product as Stripe.Product;
          return {
            name: product.name,
            quantity: item.quantity,
            price: (item.price?.unit_amount ?? 0) / 100,
          };
        }),
        totalAmount: (fullSession.amount_total ?? 0) / 100,
        shippingAddress: {
          // This will now be correctly populated
          name: shippingDetails?.name,
          address: {
            line1: shippingDetails?.address?.line1,
            line2: shippingDetails?.address?.line2,
            city: shippingDetails?.address?.city,
            state: shippingDetails?.address?.state,
            postal_code: shippingDetails?.address?.postal_code,
            country: shippingDetails?.address?.country,
          },
        },
        isPaid: true,
      });

      await newOrder.save();

      // --- START: CORRECTED STOCK DECREMENT LOGIC ---
      try {
        const transaction = sanityClient.transaction();
        for (const item of lineItems) {
          const product = item.price?.product as Stripe.Product;
          const sanityProductId = product.metadata.sanityProductId;
          const purchasedSize = product.metadata.size;
          const quantityPurchased = item.quantity!;

          if (!sanityProductId) continue;

          // Case 1: Product has a size (e.g., shoes)
          if (purchasedSize) {
            transaction.patch(sanityProductId, (p) =>
              p.dec({
                [`sizes[size=="${purchasedSize}"].stock`]: quantityPurchased,
              })
            );
          }
          // Case 2: Product has a single stock value (e.g., backpacks)
          else {
            transaction.patch(sanityProductId, (p) =>
              p.dec({ stock: quantityPurchased })
            );
          }
        }
        await transaction.commit();
      } catch (stockError) {
        console.error(
          "!!! FAILED TO DECREMENT STOCK FOR STRIPE ORDER !!!",
          stockError
        );
      }
      // --- END: CORRECTED STOCK DECREMENT LOGIC ---

      try {
        // --- SEND CONFIRMATION EMAIL ---
        await resend.emails.send({
          from: "Axion Leather <sales@samuelobior.com>",
          to: newOrder.userEmail,
          subject: `Order Confirmation - #${newOrder._id.toString().slice(-6)}`,
          react: OrderConfirmationEmail({
            orderId: newOrder._id.toString(),
            orderDate: newOrder.createdAt.toLocaleDateString(),
            totalAmount: newOrder.totalAmount.toFixed(2),
            shippingAddress: newOrder.shippingAddress,
            products: newOrder.products,
          }),
        });
        // --- END EMAIL LOGIC ---
      } catch (emailError) {
        console.error(
          "!!! FAILED TO SEND STRIPE CONFIRMATION EMAIL !!!",
          emailError
        );
      }
    } catch (error) {
      console.error("Error processing Stripe order:", error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
