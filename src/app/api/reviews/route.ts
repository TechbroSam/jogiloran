// src/app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeClient as sanityClient } from '@/lib/sanity';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Protect the route so only logged-in users can post
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, rating, reviewText, authorName } = await request.json();

    if (!productId || !rating || !reviewText || !authorName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Create the new review document in Sanity
    const newReview = {
      _type: 'review',
      authorName,
      rating,
      reviewText,
      product: {
        _type: 'reference',
        _ref: productId,
      },
    };

    await sanityClient.create(newReview);

    return NextResponse.json({ message: 'Review submitted successfully.' }, { status: 201 });

  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}