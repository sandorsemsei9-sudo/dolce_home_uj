"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Product } from "@/app/types/product";

import "swiper/css";
import "swiper/css/navigation";

type NewProductsProps = {
  products?: Product[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price);
}

// Kedvezményes / eredeti ár párkereső a megadott szabályok alapján ("helyett" nélkül)
function getOriginalPrice(currentPrice: number): number | null {
  switch (currentPrice) {
    case 4990: return 5990;
    case 5990: return 7490;
    case 6990: return 7990;
    case 7490: return 8990;
    case 7890: return 9990;
    case 7990: return 8990;
    case 8990: return 9990;
    case 9990: return 11990;
    case 11490: return 13990;
    case 11990: return 14990;
    case 12990: return 14990;
    case 14990: return 16990;
    case 16990: return 19990;
    case 21990: return 24990;
    case 26990: return 29990;
    default: return null;
  }
}

export default function NewProducts({
  products = [],
}: NewProductsProps) {
  if (!products.length) return null;

  const showNavigation = products.length >= 1;

  return (
    <section className="relative bg-[#fdfbf9] overflow-hidden">
      <style jsx global>{`
        .glass-3d-badge {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#d17d58]">
              Újdonságok
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-[#2a211d] italic leading-tight md:text-5xl">
              Legújabb vászonképeink
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#7a665c]">
              Fedezd fel legújabb vászonképeinket, és inspirálódj a folyamatosan
              bővülő kollekciónkból. Prémium minőségű faldekorációk, modern
              megjelenés és többféle méret vár, hogy könnyedén megtaláld az
              otthonodhoz legjobban illő vászonképet.
            </p>
          </div>

          <Link
            href="/vaszonkepek"
            className="group hidden md:flex items-center gap-2 text-sm font-bold text-[#7a665c] transition-colors hover:text-[#d17d58]"
          >
            Összes vászonkép
            <span className="transition-transform group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>

        <div className="relative group/swiper">

          {/* NAVIGÁCIÓ */}
          {showNavigation && (
            <>
              <button className="new-prev absolute -left-4 top-[35%] z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] shadow-sm transition-all hover:bg-[#2a211d] hover:text-white lg:flex xl:-left-12">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button className="new-next absolute -right-4 top-[35%] z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] shadow-sm transition-all hover:bg-[#2a211d] hover:text-white lg:flex xl:-right-12">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".new-prev",
              nextEl: ".new-next",
            }}
            spaceBetween={32}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!pb-12"
          >
            {products.map((product) => {
              const originalPrice = getOriginalPrice(product.price);

              return (
                <SwiperSlide key={product.id}>
                  <article className="group flex flex-col">

                    <div className="relative mb-6 block aspect-[4/5] overflow-hidden rounded-[48px] border border-[#efebe6] bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(42,33,29,0.06)]">
                      <div className="absolute right-7 top-7 z-20 flex flex-col items-center gap-2 pointer-events-none">
                        <div className="glass-3d-badge relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110">
                          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100">
                            <path d="M25 35 C 35 20, 65 20, 75 35 M 75 35 L 75 22 M 75 35 L 62 35" stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M75 65 C 65 80, 35 80, 25 65 M 25 65 L 25 78 M 25 65 L 38 65" stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-sm font-black tracking-tighter text-[#2a211d]">3D</span>
                        </div>

                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2a211d] opacity-0 transition-opacity duration-300 group-hover:opacity-40">
                          Interaktív
                        </span>
                      </div>

                      <Link href={`/vaszonkepek/${product.slug}`} className="block h-full w-full">
                        <div className="relative h-full w-full p-10 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-md">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width:640px)85vw,(max-width:1024px)45vw,(max-width:1280px)30vw,22vw"
                            className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]"
                            priority={product.id <= 4}
                          />
                        </div>

                        <div className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 ease-in-out scale-105 group-hover:opacity-100 group-hover:scale-100">
                          <Image
                            src={product.mockupImage || "/images/mockup.webp"}
                            alt={`${product.name} mockup`}
                            fill
                            sizes="(max-width:640px)85vw,(max-width:1024px)45vw,(max-width:1280px)30vw,22vw"
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    </div>

                    <div className="px-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#d17d58]">
                        {product.category}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-[#2a211d]">
                        {product.name}
                      </h3>

                      <div className="mt-6 flex items-center justify-between border-t border-[#efebe6] pt-6">
                        <div className="flex flex-col">
                          {originalPrice && (
                            <span className="text-xs font-bold text-[#d17d58] line-through mb-0.5">
                              {formatPrice(originalPrice)} Ft
                            </span>
                          )}
                          <p className="text-xl font-black text-[#2a211d]">
                            {formatPrice(product.price)} Ft <span className="text-[10px] font-bold text-[#8a7f76] uppercase tracking-tighter">-tól</span>
                          </p>
                        </div>

                        <Link
                          href={`/vaszonkepek/${product.slug}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f3ef] text-[#2a211d] transition-all hover:bg-[#d17d58] hover:text-white"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>

                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}