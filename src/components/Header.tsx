// src/components/Header.tsx
import { client } from "@/lib/sanity";
import Navbar from "./Navbar";
import Banner from "./Banner";

// Define the Sanity image type (or import from shared type file)
interface SanityImageSource {
  asset: {
    _ref: string;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: { current: string };
}

interface SiteSettings {
  title?: string;
  bannerMessage?: string[]; // Changed from any[] to string[]
  bannerImage?: SanityImageSource; // Changed from any to SanityImageSource
  bannerUrl?: string;
  isBannerActive: boolean;
}

const getCategories = async (): Promise<Category[]> => {
  const query = `*[_type == "category"] { _id, name, slug }`;
  return client.fetch(query);
};

const getSiteSettings = async (): Promise<SiteSettings> => {
  const query = `*[_type == "siteSettings"][0] {
    title,
    bannerMessage,
    bannerImage,
    bannerUrl,
    isBannerActive
  }`;
  return client.fetch(query);
};

export default async function Header() {
  // Fetch both sets of data in parallel for performance
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  
  return (
    <>
      {/* Conditionally render the Banner based on the fetched settings */}
      {settings?.isBannerActive && (
        <Banner 
          message={settings.bannerMessage} 
          title={settings.title}
          image={settings.bannerImage}
          url={settings.bannerUrl} 
        />
      )}
      {/* Pass the fetched categories down to the Navbar */}
      <Navbar categories={categories || []} />
    </>
  );
}