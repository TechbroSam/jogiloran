// src/components/ProductCard.tsx

import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
}

export default function ProductCard({ _id, name, price, imageUrl, slug }: ProductCardProps) {
  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          width={500}
          height={500}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        {/* Changed text-gray-800 to text-gray-900 for better contrast */}
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-800">{name}</h3>
        {/* Changed text-gray-900 to text-black for the price */}
        <p className="mt-1 text-lg font-semibold text-black">£{price}</p>
      </div>
    </Link>
  );
}