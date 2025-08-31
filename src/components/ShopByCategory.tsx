// src/components/ShopByCategory.tsx
import Link from "next/link";
import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";

// Define the Category interface with specific types
interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  image: {
    asset: {
      _ref: string;
    };
  }; // Matches Sanity's image type structure
}

// Explicitly type the return value of getCategories
const getCategories = async (): Promise<Category[]> => {
  const query = `*[_type == "category"] {
    _id,
    name,
    slug,
    image
  }`;
  const data: Category[] = await client.fetch(query);
  return data;
};

export default async function ShopByCategory() {
  const categories: Category[] = await getCategories();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Shop by Category
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
          {categories.map((category: Category) => (
            <Link
              href={`/products/${category.slug.current}`}
              key={category._id}
              className="group relative block overflow-hidden rounded-lg"
            >
              <div className="aspect-[2/3] w-full bg-gray-200">
                <Image
                  src={urlFor(category.image).url()}
                  alt={`Image of ${category.name}`}
                  width={500}
                  height={750}
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-80 lg:opacity-70 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end">
                <h3 className="text-base md:text-lg lg:text-2xl font-semibold text-white lg:transform-gpu lg:transition-all lg:duration-300 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}