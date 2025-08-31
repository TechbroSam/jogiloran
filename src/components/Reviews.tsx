// src/components/Reviews.tsx
'use client';

import { Star } from 'lucide-react';

interface Review {
  _id: string;
  authorName: string;
  rating: number;
  reviewText: string;
  _createdAt: string;
}

interface ReviewsProps {
  reviews: Review[];
}

// A simple component to render star ratings
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

export default function Reviews({ reviews }: ReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return <p className="mt-8 text-gray-500">No reviews yet.</p>;
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h3>
      <div className="flex items-center gap-3 mt-4">
        <StarRating rating={Math.round(averageRating)} />
        <p className="text-sm text-gray-700">
          Based on {reviews.length} review{reviews.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="mt-8 space-y-8 border-t border-gray-200 pt-8">
        {reviews.map((review) => (
          <div key={review._id} className="flex flex-col">
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <p className="font-semibold">{review.authorName}</p>
            </div>
            <p className="mt-3 text-gray-600">{review.reviewText}</p>
            <p className="mt-2 text-xs text-gray-400">
              {new Date(review._createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}