// src/app/profile/page.tsx
'use client';
    
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store'; // Re-import the cart store

// Define the Order type
interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  products: { name: string, quantity: number }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Get cart items from the store
  const { items: cartItems } = useCartStore(); 
  
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.email) {
        const res = await fetch(`/api/orders?email=${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      }
    };
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }
    
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
      
      {/* Profile Details Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <p className="mt-2"><strong>Name:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
      </div>

      {/* Your Cart Section (Re-added) */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold">Your Cart ({cartItems.length} items)</h2>
        {cartItems.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {cartItems.map(item => (
              <li key={item._id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>£{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-gray-500">Your cart is currently empty.</p>
        )}
      </div>

      {/* Purchase History Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold">Purchase History</h2>
        <div className="mt-4 space-y-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order._id} className="border bg-white p-4 rounded-md">
                <div className="flex justify-between items-center font-semibold">
                  <span>Order ID: ...{order._id.slice(-6)}</span>
                  <span className="text-lg">£{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                <ul className="mt-2 text-sm list-disc list-inside text-gray-600">
                  {order.products.map((p, i) => <li key={i}>{p.name} (x{p.quantity})</li>)}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You have no past orders.</p>
          )}
        </div>
      </div>
    </div>
  );
}