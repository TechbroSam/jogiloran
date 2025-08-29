// src/components/Header.tsx
import { client } from "@/lib/sanity";
import Navbar from "./Navbar";
import Banner from "./Banner";

interface Category {
  _id: string;
  name: string;
  slug: { current: string };
}

interface SiteSettings {
  title?: string;
  bannerMessage?: any[];
  bannerImage?: any;
  bannerUrl?: string;
  isBannerActive: boolean;
}

const getCategories = async (): Promise<Category[]> => {
  const query = `*[_type == "category"] { _id, name, slug }`;
  return client.fetch(query);
};

const getSiteSettings = async (): Promise<SiteSettings> => {
  const query = `*[_type == "siteSettings"][0]`;
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