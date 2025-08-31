// src/components/NewArrivals.tsx
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import ProductCard from "./ProductCard";
import { SanityImageSource } from '@/types/sanity';

interface Product {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  images: SanityImageSource; // Use specific type instead of any
}

const getNewestProducts = async () => {
  // GROQ query to get the 4 most recent products
  const query = `*[_type == "product"] | order(_createdAt desc)[0...4] {
    _id,
    name,
    price,
    slug,
    images[0]
  }`;
  const data: Product[] = await client.fetch(query);
  return data;
};

export default async function NewArrivals() {
  const products: Product[] = await getNewestProducts();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Our Newest Arrivals
          </h2>
          <Link className="text-orange-700 hover:text-orange-800" href="/products/newest">
            See All <span>&rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              _id={product._id}
              name={product.name}
              price={product.price}
              slug={product.slug.current}
              imageUrl={urlFor(product.images).url()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}