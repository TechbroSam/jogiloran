// src/components/SearchModal.tsx
'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { client, urlFor } from '@/lib/sanity';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  images: any;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch all products once when the modal opens
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const query = `*[_type == "product"]{ _id, name, slug, images[0] }`;
        const products = await client.fetch(query);
        setAllProducts(products || []); // Ensure it's an array
      } catch (error) {
        console.error("Failed to fetch products for search:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []); // Empty dependency array ensures this runs only once

  // Filter products whenever the search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    const filtered = allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, allProducts]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Search Products</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full pl-10 pr-4 py-3 border rounded-md"
          autoFocus
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" />
        </div>
      </div>

      {/* Search Results */}
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {isLoading && <p className="text-gray-500 text-center py-4">Loading products...</p>}
        
        {!isLoading && searchTerm.trim() !== '' && filteredProducts.length === 0 && (
          <p className="text-gray-500 text-center py-4">No products found for "{searchTerm}".</p>
        )}
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <li key={product._id}>
              <Link
                href={`/product/${product.slug.current}`}
                onClick={onClose}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <Image
                  src={urlFor(product.images).url()}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <span className="font-medium">{product.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}