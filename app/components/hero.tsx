"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";

// Swiper stílusok
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
  if (!products || products.length === 0) return null;

  return (
    <section id="hero" className="relative overflow-hidden bg-[url('/hero-bg.webp')] bg-cover bg-center">
      <style jsx>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-hero-text {
          animation: fadeInSlide 1s ease-out forwards;
        }
        .animate-hero-swiper {
          animation: fadeInRight 1.2s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,243,239,0.98)_0%,rgba(248,243,239,0.96)_34%,rgba(248,243,239,0.86)_58%,rgba(248,243,239,0.74)_100%)]" />

      <div className="relative mx-auto flex flex-col md:grid max-w-7xl gap-10 px-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
        
        {/* BAL OLDAL: SZÖVEG */}
        <div className="max-w-xl mb-10 md:mb-0">
          <p className="animate-hero-text mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#d17d58]">
            Örökítsd meg a legszebb pillanataidat
          </p>

          <h1 className="animate-hero-text delay-1 text-4xl font-semibold leading-[1.05] tracking-tight text-[#2a211d] md:text-6xl">
            Tedd különlegessé
            <br />
            az otthonod
            <br />
            vászonképekkel
          </h1>

          <p className="animate-hero-text delay-2 mt-5 max-w-lg text-base leading-8 text-[#5e4d45] md:text-lg">
            Válogass modern kollekcióinkból, vagy készíts egyedi vászonképet a
            saját fotódból. Letisztult design, prémium megjelenés, meleg
            otthonhangulat.
          </p>

          <div className="animate-hero-text delay-3 mt-8 flex flex-wrap gap-4">
            {/* Linkre cseréltük a gombot */}
            <Link 
              href="/egyedi-vaszonkep"
              className="rounded-2xl bg-gradient-to-r from-[#e3936e] to-[#d77d5d] px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(215,125,93,0.30)] transition hover:-translate-y-0.5"
            >
              Feltöltöm a képem
            </Link>

            {/* Itt is Linket használunk a korábbi 'a' helyett az egyöntetűségért */}
            <Link
              href="/termekek"
              className="rounded-2xl border border-[#dccfc5] bg-white/95 px-7 py-3.5 text-base font-semibold text-[#463732] shadow-sm transition hover:bg-[#fff4ed]"
            >
              Kollekció megtekintése
            </Link>
          </div>
        </div>

        {/* JOBB OLDAL: SWIPER */}
        <div className="animate-hero-swiper relative w-full overflow-visible">
          <div className="mx-auto max-w-[620px]">
            <div className="relative">
              <button className="hero-prev absolute -left-2 md:-left-5 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e0d5cc] bg-white/95 text-xl text-[#4d3b34] shadow-md transition hover:bg-[#fff4ed]">‹</button>
              <button className="hero-next absolute -right-2 md:-right-5 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e0d5cc] bg-white/95 text-xl text-[#4d3b34] shadow-md transition hover:bg-[#fff4ed]">›</button>

              <Swiper
                modules={[Navigation, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={600}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
              >
                {products.map((product) => (
                  <SwiperSlide key={product.id}>
                    <Link href={`/termekek/${product.slug}`} className="group block flex flex-col outline-none">
                      <div className="relative flex items-center justify-center px-4 md:px-10 min-h-[300px] md:min-h-[400px]">
                        <div className="absolute left-2 md:left-6 top-6 z-20 rounded-full bg-[#df7f58] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">Akció</div>
                        <div className="absolute bottom-6 right-2 md:right-6 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#2a211d] shadow backdrop-blur">{formatPrice(product.price)} Ft-tól</div>
                        
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full max-h-[350px] md:max-h-[420px] object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-[1.02]" 
                        />
                      </div>

                      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
                        <div className="max-w-md border-l-2 border-[#d17d58] pl-4">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-[#b07a5e]">{product.category}</p>
                          <h2 className="mt-2 text-2xl font-semibold text-[#2a211d] md:text-[26px] group-hover:text-[#d17d58] transition-colors">{product.name}</h2>
                          <div className="mt-3 h-[2px] w-10 bg-[#d17d58] transition-all group-hover:w-16" />
                        </div>
                        
                        <div className="flex shrink-0">
                          <div className="rounded-2xl bg-gradient-to-r from-[#e3936e] to-[#d77d5d] px-6 py-3 text-sm font-semibold text-white transition group-hover:-translate-y-0.5 shadow-md">
                            Részletek →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}