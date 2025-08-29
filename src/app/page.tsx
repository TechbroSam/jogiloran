// src/app/page.tsx

import BestSellers from "@/components/BestSellers";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import ShippingInfo from "@/components/ShippingInfo";
import ShopByCategory from "@/components/ShopByCategory";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <ShippingInfo/>
      <BestSellers />
      <ShopByCategory/>
      <NewArrivals />
    </div>
  );
}