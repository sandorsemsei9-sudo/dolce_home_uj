"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  description: string;
  mockupImage?: string;
};

type PopularProductsProps = {
  products?: Product[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price);
}

export default function PopularProducts({
  products = [],
}: PopularProductsProps) {
  if (!products.length) return null;

  const showNavigation = products.length >= 1;

  return (
    <section className="relative bg-[#fdfbf9] py-24 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6">
        
        {/* HEADER - Balra zárt, elegáns dőlt betűvel */}
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#d17d58]">
              Válogatás
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-[#2a211d] italic leading-tight md:text-5xl">
              Népszerű termékek
            </h2>
          </div>

          <Link
            href="/termekek"
            className="group hidden md:flex items-center gap-2 text-sm font-bold text-[#7a665c] transition-colors hover:text-[#d17d58]"
          >
            Összes termék
            <span className="transition-transform group-hover:translate-x-1.5">→</span>
          </Link>
        </div>

        <div className="relative group/swiper">
          
          {/* NAVIGÁCIÓ - Letisztultabb körök */}
          {showNavigation && (
            <>
              <button className="popular-prev absolute -left-4 top-[35%] z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] shadow-sm transition-all hover:bg-[#2a211d] hover:text-white lg:flex xl:-left-12">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>

              <button className="popular-next absolute -right-4 top-[35%] z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] shadow-sm transition-all hover:bg-[#2a211d] hover:text-white lg:flex xl:-right-12">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <Swiper
            modules={[Navigation]}
            navigation={showNavigation ? { prevEl: ".popular-prev", nextEl: ".popular-next" } : false}
            spaceBetween={32}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <article className="group flex flex-col">
                  
                  {/* KÉP KONTÉNER - Extra kerekített sarok és mockup hover */}
                  <Link href={`/termekek/${product.slug}`} className="relative mb-6 block aspect-[4/5] overflow-hidden rounded-[48px] border border-[#efebe6] bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(42,33,29,0.06)]">
                    
                    {/* Badge a sarokban */}
                    <div className="absolute top-6 left-8 z-10 text-[10px] font-bold uppercase tracking-widest text-[#2a211d]/40">
                      NÉPSZERŰ TERMÉK
                    </div>

                    {/* Alap kép */}
                    <div className="relative h-full w-full p-10 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-md">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]"
                      />
                    </div>

                    {/* Mockup kép hoverre */}
                    <div className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 ease-in-out scale-105 group-hover:opacity-100 group-hover:scale-100">
                      <Image
                        src={product.mockupImage || "/images/mockup.jpg"}
                        alt={`${product.name} mockup`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* TERMÉK INFÓ - Szellős elrendezés */}
                  <div className="px-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#d17d58]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#2a211d]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#8a7f76]">
                      40×60 • 60×120 cm
                    </p>

                    {/* ÁR ÉS NYÍL - Egy sorban a kép szerint */}
                    <div className="mt-6 flex items-center justify-between border-t border-[#efebe6] pt-6">
                      <p className="text-xl font-black text-[#2a211d]">
                        {formatPrice(product.price)} Ft -tól
                      </p>
                      
                      <Link 
                        href={`/termekek/${product.slug}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f3ef] text-[#2a211d] transition-all duration-300 hover:bg-[#d17d58] hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}