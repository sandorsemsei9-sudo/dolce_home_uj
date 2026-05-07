"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// Swiper dinamikus betöltése - ez drasztikusan javítja a mobil TBT-t
const Swiper = dynamic(() => import("swiper/react").then((m) => m.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import("swiper/react").then((m) => m.SwiperSlide), { ssr: false });

import { Navigation, Autoplay, EffectFade } from "swiper/modules";

// Stílusok maradnak, de a Next.js optimalizálja őket
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  description: string;
};

type HeroProps = {
  products: Product[];
  formatPrice: (price: number) => string;
};

export default function Hero({ products, formatPrice }: HeroProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section id="hero" className="relative overflow-hidden bg-[#f8f3ef]">
      {/* 1. HÁTTÉRKÉP - LCP optimalizálva */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.webp" 
          alt="háttér" 
          fill 
          className="object-cover opacity-60"
          priority 
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
          quality={80}
        />
      </div>

      <style jsx global>{`
        /* Csak akkor fusson az animáció, ha látszik, és használjunk 'will-change'-et a GPU gyorsításhoz */
        .animate-hero-text {
          opacity: 0;
          animation: fadeInSlide 0.6s ease-out forwards;
          will-change: transform, opacity;
        }
        .animate-floating-img {
          animation: floatingImage 4s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatingImage {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
      `}</style>

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#f8f3ef]/95 via-[#f8f3ef]/80 to-transparent" />

      <div className="relative z-20 mx-auto flex flex-col md:grid max-w-7xl gap-10 px-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
        
        {/* BAL OLDAL: SZÖVEG */}
        <div className="max-w-xl mb-10 md:mb-0">
          <p className="animate-hero-text mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#d17d58]">
            Örökítsd meg a legszebb pillanataidat
          </p>

          <h1 className="animate-hero-text delay-1 text-4xl font-semibold leading-[1.1] tracking-tight text-[#2a211d] md:text-6xl">
            Tedd különlegessé <br /> az otthonod <br /> vászonképekkel
          </h1>

          <p className="animate-hero-text delay-2 mt-5 max-w-lg text-base leading-relaxed text-[#5e4d45] md:text-lg">
            Válogass modern kollekcióinkból, vagy készíts egyedi vászonképet a
            saját fotódból.
          </p>

          <div className="animate-hero-text delay-3 mt-8 flex flex-wrap gap-4">
            <Link 
              href="/egyedi-vaszonkep"
              className="rounded-2xl bg-[#d17d58] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition transform hover:-translate-y-0.5"
            >
              Feltöltöm a képem
            </Link>
          </div>
        </div>

        {/* JOBB OLDAL: SWIPER - Csak kliensoldalon rendereljük a JS terhelés csökkentésére */}
        <div className="relative w-full overflow-visible min-h-[400px]">
          {isMounted && (
            <div className="mx-auto max-w-[620px]">
              <div className="relative">
                <button className="hero-prev absolute -left-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-xl hover:bg-white transition-opacity">‹</button>
                <button className="hero-next absolute -right-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-xl hover:bg-white transition-opacity">›</button>

                <Swiper
                  modules={[Navigation, Autoplay, EffectFade]}
                  effect="fade"
                  fadeEffect={{ crossFade: true }}
                  speed={600}
                  loop={true}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
                >
                  {products.map((product, index) => (
                    <SwiperSlide key={product.id}>
                      <Link href={`/termekek/${product.slug}`} className="group block flex flex-col outline-none">
                        <div className="relative flex items-center justify-center px-4 md:px-10 min-h-[350px] md:min-h-[450px]">
                          <div className="animate-floating-img relative w-full h-[320px] md:h-[420px]">
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              fill
                              className="object-contain drop-shadow-xl"
                              // Csak az abszolút első termék kapjon priority-t, a háttérkép mellett
                              priority={index === 0}
                              loading={index === 0 ? "eager" : "lazy"}
                              sizes="(max-width: 768px) 100vw, 500px"
                            />
                          </div>
                        </div>
                        <div className="mt-4 border-l-4 border-[#d17d58] pl-4">
                          <h2 className="text-2xl font-bold text-[#2a211d]">{product.name}</h2>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>
      </div>
    </section> 
  );
}