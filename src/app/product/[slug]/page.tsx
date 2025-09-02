// src/app/product/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { client, urlFor } from "@/lib/sanity";
import ProductGallery from "@/components/ProductGallery";
import { useCartStore } from "@/lib/store";
import Reviews from '@/components/Reviews';
import { SanityImageSource } from '@/types/sanity';

// Define the shape for a review
interface Review {
  _id: string;
  authorName: string;
  rating: number;
  reviewText: string;
  _createdAt: string;
}

// Define the shape for a single size object
interface SizeOption {
  _key: string;
  size: string;
  stock: number;
}

// Define the shape for the full product details
interface ProductDetail {
  _id: string;
  name: string;
  price: number;
  description: string;
  slug: { current: string };
  current: string;
  images: SanityImageSource[];
  stock?: number;
  sizes?: SizeOption[];
  reviews: Review[];
}

// Define the page's props (params is not a Promise in client components)
interface ProductPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = params; // Directly access slug from params
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const query = `*[_type == "product" && slug.current == "${slug}"][0]{..., "sizes": sizes[]{_key, size, stock}, "reviews": *[_type == "review" && product._ref == ^._id] | order(_createdAt desc)}`;
        const data = await client.fetch(query);
        setProduct(data);
        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        setError("Failed to load product details.");
      }
    };
    getProductDetails();
  }, [slug]);

  const handleAddToCart = () => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size.");
      return;
    }
    if (product) {
      const stockLimit = selectedSize ? selectedSize.stock : product.stock || 0;
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: urlFor(product.images[0]).url(),
        quantity: 1,
        size: selectedSize?.size || undefined,
        stock: stockLimit,
        slug: product.slug.current,
      });
      setError(null);
      alert(`${product.name} ${selectedSize ? `(Size: ${selectedSize.size})` : ''} added to cart!`);
    }
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  const stockAvailable = selectedSize ? selectedSize.stock : product.stock || 0;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <ProductGallery images={product.images} />
          <div className="md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl">{product.name}</h2>
            <p className="mt-2 text-xl font-bold text-gray-800">£{product.price.toFixed(2)}</p>
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size._key}
                      onClick={() => { setSelectedSize(size); setError(null); }}
                      className={`px-4 py-2 border rounded-md text-sm transition ${
                        selectedSize?._key === size._key
                          ? 'bg-orange-700 text-white border-orange-700'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                      } ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={size.stock === 0}
                    >
                      {size.size} {size.stock === 0 && '(Out of Stock)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="flex gap-2.5 mt-6">
              {stockAvailable > 0 ? (
                <button onClick={handleAddToCart} className="flex-1 rounded-lg bg-orange-700 text-white px-8 py-3 text-center font-semibold hover:bg-orange-800">
                  Add to Cart
                </button>
              ) : (
                <button disabled className="flex-1 rounded-lg bg-gray-400 text-white px-8 py-3 text-center font-semibold cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>
            
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <Reviews reviews={product.reviews} />
        </div>
      </div>
    </div>
  );
}