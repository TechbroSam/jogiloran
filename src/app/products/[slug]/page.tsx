// src/app/products/[slug]/page.tsx
import { client, urlFor } from "@/lib/sanity";
import ProductCard from "@/components/ProductCard";
import FilterSortControls from "@/components/FilterSortControls"; // Import the new component

interface Product {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  images: any;
}

// The component now accepts searchParams
export default async function ProductListingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  const sort = searchParams.sort as string || 'newest';

  // Determine the ordering for the GROQ query
  let orderClause = '';
  switch (sort) {
    case 'price-asc':
      orderClause = `| order(price asc)`;
      break;
    case 'price-desc':
      orderClause = `| order(price desc)`;
      break;
    case 'name-asc':
      orderClause = `| order(name asc)`;
      break;
    default: // 'newest'
      orderClause = `| order(_createdAt desc)`;
  }

  // Determine the filtering for the GROQ query
  let filterClause = '';
  let pageTitle = '';
  switch (slug) {
    case 'newest':
      filterClause = `*[_type == "product"]`;
      pageTitle = "New Arrivals";
      break;
    case 'bestsellers':
      filterClause = `*[_type == "product" && isBestSeller == true]`;
      pageTitle = "Best Sellers";
      break;
    default:
      filterClause = `*[_type == "product" && category->slug.current == "${slug}"]`;
      const category = await client.fetch(`*[_type == "category" && slug.current == "${slug}"][0]`);
      pageTitle = category ? `Shop ${category.name}` : "Products";
  }

  // Combine the filter and order clauses into the final query
  const fullQuery = filterClause + orderClause + `{
    _id, name, price, slug, images[0]
  }`;

  const products: Product[] = await client.fetch(fullQuery);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {pageTitle}
          </h2>
        </div>

        {/* Add the Filter/Sort Controls */}
        <FilterSortControls />

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                price={product.price}
                slug={product.slug.current}
                imageUrl={urlFor(product.images).url()}
              />
            ))
          ) : (
            <p className="col-span-full text-center">No products found for this selection.</p>
          )}
        </div>
      </div>
    </div>
  );
}