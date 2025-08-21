// src/components/BestSellers.tsx
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  images: any;
}

// 1. Renamed function to getBestSellers
const getBestSellers = async () => {
  // 2. Updated query to filter for isBestSeller == true
  const query = `*[_type == "product" && isBestSeller == true][0...4] {
    _id,
    name,
    price,
    slug,
    images[0]
  }`;
  const data = await client.fetch(query);
  return data;
};

export default async function BestSellers() {
  // Use the correct function
  const products: Product[] = await getBestSellers();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Our Best Sellers
          </h2>
          {/* 3. Updated the Link to the correct href */}
          <Link className="text-orange-700 hover:text-orange-800" href="/products/bestsellers">
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