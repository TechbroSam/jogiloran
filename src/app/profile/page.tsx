// src/app/profile/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { items } = useCartStore();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    // Redirect to home if not logged in
    router.push('/');
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <p className="mt-2"><strong>Name:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold">Your Cart ({items.length} items)</h2>
        {items.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {items.map(item => (
              <li key={item._id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>£{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2">Your cart is currently empty.</p>
        )}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
}