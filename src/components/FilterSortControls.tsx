// src/components/FilterSortControls.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function FilterSortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('sort', e.target.value);
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  return (
    <div className="flex justify-end mb-8">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm font-medium">Sort by:</label>
        <select
          id="sort-by"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          onChange={handleSortChange}
          // Set the default value from the current URL parameter
          defaultValue={searchParams.get('sort') || 'newest'}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}