// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IOrder } from '@/types/order';

export default function AdminPage( { settings }: { settings?: any } ) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingStatus, setShippingStatus] = useState<Record<string, boolean>>({});
  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/admin-fetch');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.isAdmin) {
      fetchOrders();
    } else if (status === 'unauthenticated' || (status === 'authenticated' && !(session?.user as any)?.isAdmin)) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleMarkAsShipped = async (orderId: string) => {
    setShippingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch('/api/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, isShipped: true } : o));
      } else {
        const data = await res.json();
        alert(`Failed to mark as shipped: ${data.error}`);
      }
    } catch (error) {
      alert("An error occurred while updating the order.");
    } finally {
      setShippingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (status === 'loading' || isLoading) {
    return <p className="text-center py-20">Loading Dashboard...</p>;
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - All Orders</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded-md">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold">Order ID: ...{order._id.slice(-6)}</p>
                  <p className="text-sm text-gray-600 break-all" title={order.userEmail}>{order.userEmail}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString('en-GB')}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="font-bold text-lg">£{order.totalAmount.toFixed(2)}</p>
                  {order.isShipped ? (
                     <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Shipped</span>
                  ) : (
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Paid</span>
                  )}
                </div>
              </div>
              {/* FIX: Add optional chaining to safely access shipping details */}
              {order.shippingAddress && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold">Shipping Address</h4>
                  <address className="not-italic text-sm text-gray-600">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address?.line1}<br />
                    {order.shippingAddress.address?.city}, {order.shippingAddress.address?.postal_code}<br />
                    {order.shippingAddress.address?.country}
                  </address>
                </div>
              )}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold">Items</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {order.products.map((p: any, i: number) => <li key={i}>{p.name} (x{p.quantity})</li>)}
                </ul>
              </div>
              <div className="mt-4 border-t pt-4">
                 <button 
                    onClick={() => handleMarkAsShipped(order._id)} 
                    disabled={order.isShipped || shippingStatus[order._id]}
                    className="w-full sm:w-auto bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-orange-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {shippingStatus[order._id] ? 'Processing...' : (order.isShipped ? 'Order Shipped' : 'Mark as Shipped & Notify')}
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}