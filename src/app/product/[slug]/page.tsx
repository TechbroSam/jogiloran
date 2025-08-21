// src/app/product/[slug]/page.tsx

import { client, urlFor } from "@/lib/sanity";
import ProductGallery from "@/components/ProductGallery";
import AddToCartBtn from "@/components/AddToCartBtn";
import { notFound } from 'next/navigation';

// Define the shape of the data we expect
interface ProductDetail {
  _id: string;
  name: string;
  price: number;
  description: string;
  slug: { current: string };
  images: any[];
}

// Fetches the data for a single product based on its slug
const getProductDetails = async (slug: string) => {
  const query = `*[_type == "product" && slug.current == "${slug}"][0] {
    _id, name, price, description, slug, images
  }`;
  const data = await client.fetch(query);
  return data;
};

// Generates static pages for all products at build time for performance
export async function generateStaticParams() {
  const query = `*[_type == "product"] { "slug": slug.current }`;
  const slugs: { slug: string }[] = await client.fetch(query);

  // Ensure slugs is an array before mapping over it to prevent errors
  return (slugs || []).map((item) => ({
    slug: item.slug,
  }));
}

// The main page component
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product: ProductDetail = await getProductDetails(params.slug);

  // If no product is found for the given slug, show a 404 page
  if (!product) {
    notFound();
  }

  // Prepare a clean product object to be added to the cart
  const productForCart = {
    _id: product._id,
    name: product.name,
    price: product.price,
    imageUrl: urlFor(product.images[0]).url(),
    quantity: 1,
  };

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <ProductGallery images={product.images} />

          <div className="md:py-8">
            <div className="mb-2 md:mb-3">
              <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl">{product.name}</h2>
            </div>
            
            <div className="mb-4">
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-gray-800 md:text-2xl">
                  £{product.price.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* You can add more details here if needed */}
            <div className="mb-6 flex items-center gap-2 text-gray-500">
              <p>Free Shipping</p>
            </div>

            <div className="flex gap-2.5">
              <AddToCartBtn product={productForCart} />
            </div>

            <div className="mt-10 md:mt-16 lg:mt-20">
              <div className="mb-3 text-lg font-semibold text-gray-800">Description</div>
              <p className="text-gray-500">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}