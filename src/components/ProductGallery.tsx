// src/components/ProductGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

interface ProductGalleryProps {
  images: any[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  const handleThumbnailClick = (image: any) => {
    setMainImage(image);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <div className="order-last flex gap-4 lg:order-none lg:flex-col">
        {images.map((image, idx) => (
          // Add 'aspect-square' and 'w-20' (or another width) here
          <div
            key={idx}
            className="aspect-square w-20 overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
            onClick={() => handleThumbnailClick(image)}
          >
            <Image
              src={urlFor(image).url()}
              width={200}
              height={200}
              alt={`Thumbnail ${idx + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gray-100 lg:col-span-4 aspect-square">
        <Image
          src={urlFor(mainImage).url()}
          width={500}
          height={500}
          alt="Main product photo"
          className="h-full w-full object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}