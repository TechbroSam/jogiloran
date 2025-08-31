// src/components/Banner.tsx
'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PortableText, PortableTextBlock } from '@portabletext/react';
import { urlFor } from '@/lib/sanity';
import { SanityImageSource } from '@/types/sanity';

interface BannerProps {
  title?: string;
  message?: PortableTextBlock[]; // Changed from any[] to PortableTextBlock[]
  image?: SanityImageSource; // Changed from any to SanityImageSource
  url?: string;
}

export default function Banner({ title, message, image, url }: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const BannerContent = () => (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-3 sm:px-3.5">
      {image && (
        <div className="hidden sm:block flex-shrink-0">
          <Image
            src={urlFor(image).width(128).height(64).url()}
            alt={title || "Banner Ad"}
            width={128}
            height={64}
            className="object-contain"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mx-auto text-center sm:text-left">
        <div className="text-sm leading-6 text-gray-900">
          {title && <strong className="font-semibold">{title}</strong>}
          <span className="sm:inline-block sm:ml-2">
            {message && <PortableText value={message} />}
          </span>
        </div>
      </div>
      <div className="flex flex-1 justify-end">
        <button type="button" className="-m-3 p-3" onClick={(e) => { e.preventDefault(); setIsVisible(false); }}>
          <X className="h-5 w-5 text-gray-900" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (url) {
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <BannerContent />
      </Link>
    );
  }

  return <BannerContent />;
}