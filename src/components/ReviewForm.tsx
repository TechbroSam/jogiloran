// src/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || rating === 0 || reviewText.trim() === '') {
      setMessage('Please log in and fill out all fields.');
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          reviewText,
          authorName: session.user?.name,
        }),
      });

      if (res.ok) {
        setMessage('Thank you! Your review has been submitted.');
        setRating(0);
        setReviewText('');
      } else {
        throw new Error('Failed to submit review.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <p className="mt-4">Please log in to leave a review.</p>;
  }

  return (
    <div className="mt-10 border-t pt-10">
      <h4 className="text-xl font-bold">Write a review</h4>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">Your Rating</label>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <Star
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  className={`h-6 w-6 cursor-pointer ${
                    starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium">Your Review</label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            required
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-orange-700 text-white px-6 py-2 rounded-md hover:bg-orange-800 disabled:bg-gray-400"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>
    </div>
  );
}