"use client";

import { useState } from "react";
import { Allura } from "next/font/google";
import Hero from "./components/hero";
import Features from "./components/features";
import Categories from "./components/categories";
import HowItWorks from "./components/how-it-works";
import Newsletter from "./components/newsletter";
import Footer from "./components/footer";
import PopularProducts from "./components/popularproducts";
import Navbar from "./components/navbar";
import NewProducts from "./components/newproducts";
import { products } from "@/data/products";

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#fcf7f2] text-[#2d221e]">
      <Navbar />
<Hero 
  products={products.filter((product) => product.hero)}
  formatPrice={formatPrice}
/>
      <HowItWorks />
<PopularProducts 
  products={products.filter((product) => product.featured)}
/>

<NewProducts 
  products={products.filter((product) => product.isNew)}
/>
      <Newsletter />
      <Categories />
      <Features />
      <Footer />
    </main>
  );
}