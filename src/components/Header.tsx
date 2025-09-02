import { client } from "@/lib/sanity";

import type { PortableTextBlock } from '@portabletext/types'; // Import the correct type

import Navbar from "./Navbar";
import Banner from "./Banner";

// Define the Sanity image type
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
  bannerMessage?: PortableTextBlock[];
  bannerImage?: SanityImageSource;
  bannerUrl?: string;
  isBannerActive: boolean;
  discountPercentage?: number;
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
    isBannerActive,
    discountPercentage
  }`;
  return client.fetch(query);
};

export default async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      {settings?.isBannerActive && (
        <Banner
          message={settings.bannerMessage}
          title={settings.title}
          image={settings.bannerImage}
          url={settings.bannerUrl}
          // Note: discountPercentage is not passed to Banner in your current setup
        />
      )}
      <Navbar categories={categories || []} />
    </>
  );
}