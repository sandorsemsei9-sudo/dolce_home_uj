"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image"; // Next.js képoptimalizáló

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
    <section 
      id="hero" 
      className="relative overflow-hidden bg-[#f8f3ef]" // Fix háttérszín a villódzás ellen
    >
      {/* Optimalizált háttérkép */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.webp" 
          alt="háttér" 
          fill 
          className="object-cover opacity-60"
          priority 
        />
      </div>

      <style jsx global>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Finom lebegő animáció a termékképnek */
        @keyframes floatingImage {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.01); }
        }
        .animate-hero-text {
          animation: fadeInSlide 0.8s ease-out forwards;
        }
        .animate-floating-img {
          animation: floatingImage 4s ease-in-out infinite;
        }
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
      `}</style>

      {/* Finomabb átmenetes overlay */}
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
            saját fotódból. Letisztult design, prémium megjelenés.
          </p>

          <div className="animate-hero-text delay-3 mt-8 flex flex-wrap gap-4">
            <Link 
              href="/egyedi-vaszonkep"
              className="rounded-2xl bg-[#d17d58] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-[#b06a4a] hover:-translate-y-0.5"
            >
              Feltöltöm a képem
            </Link>

            <Link
              href="/termekek"
              className="rounded-2xl border border-[#dccfc5] bg-white/90 px-7 py-3.5 text-base font-semibold text-[#463732] shadow-sm transition hover:bg-white"
            >
              Kollekció megtekintése
            </Link>
          </div>
        </div>

        {/* JOBB OLDAL: SWIPER */}
        <div className="relative w-full overflow-visible">
          <div className="mx-auto max-w-[620px]">
            <div className="relative">
              {/* Navigációs gombok - kicsit finomítva */}
              <button className="hero-prev absolute -left-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-xl transition hover:bg-white">‹</button>
              <button className="hero-next absolute -right-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-xl transition hover:bg-white">›</button>

              <Swiper
                modules={[Navigation, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={800}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
              >
                {products.map((product, index) => (
                  <SwiperSlide key={product.id}>
                    <Link href={`/termekek/${product.slug}`} className="group block flex flex-col outline-none">
                      <div className="relative flex items-center justify-center px-4 md:px-10 min-h-[350px] md:min-h-[450px]">
                        
                        <div className="absolute left-6 top-6 z-20 rounded-full bg-[#df7f58] px-3 py-1 text-[11px] font-bold uppercase text-white shadow-md">Akció</div>
                        <div className="absolute bottom-6 right-6 z-20 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-[#2a211d] shadow-lg backdrop-blur">{formatPrice(product.price)} Ft-tól</div>
                        
                        {/* ANIMÁLT KÉP TÁROLÓ */}
                        <div className="animate-floating-img relative w-full h-[320px] md:h-[420px]">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-105"
                            priority={index === 0} // Az első kép azonnal töltsön be!
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        </div>
                      </div>

                      <div className="mt-4 border-l-4 border-[#d17d58] pl-4 transition-all group-hover:pl-6">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#b07a5e]">{product.category}</p>
                        <h2 className="mt-1 text-2xl font-bold text-[#2a211d] group-hover:text-[#d17d58] transition-colors">{product.name}</h2>
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