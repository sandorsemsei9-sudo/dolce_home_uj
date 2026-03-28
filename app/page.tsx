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
      <Hero products={products} formatPrice={formatPrice} />
      <HowItWorks />
      <PopularProducts products={products} />
      <Newsletter />
      <Categories />
      <Features />
      <Footer />
    </main>
  );
}