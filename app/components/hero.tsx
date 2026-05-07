"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 6; 
    const rotateY = (centerX - x) / 6; 

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsPressed(false);
  };

  if (!products || products.length === 0) return null;

  return (
    <section id="hero" className="relative overflow-hidden bg-[#f8f3ef]">
      {/* Háttérkép */}
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
        @keyframes fadeInSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatingImage { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.01); } }
        
        .animate-hero-text { animation: fadeInSlide 0.8s ease-out forwards; }
        .animate-floating-img { animation: floatingImage 4s ease-in-out infinite; }
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
        
        .perspective-container { perspective: 1200px; }
        
        /* Modern Üveghatás Stílus - Kompaktabb és tisztább */
        .glass-btn-3d {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 55px;
          height: 55pxx;
          border-radius: 24px;
        }
        
        .glass-btn-3d:hover {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.12);
        }

        .btn-pressed {
          transform: scale(0.92) translateZ(0) !important;
          box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Átmenetes overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#f8f3ef]/95 via-[#f8f3ef]/80 to-transparent" />

      <div className="relative z-20 mx-auto flex flex-col md:grid max-w-7xl gap-10 px-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
        
        {/* Szöveges oldal */}
        <div className="max-w-xl mb-10 md:mb-0">
          <p className="animate-hero-text mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#d17d58]"> Örökítsd meg a legszebb pillanataidat </p>
          <h1 className="animate-hero-text delay-1 text-4xl font-semibold leading-[1.1] tracking-tight text-[#2a211d] md:text-6xl"> Tedd különlegessé <br /> az otthonod <br /> vászonképekkel </h1>
          <p className="animate-hero-text delay-2 mt-5 max-w-lg text-base leading-relaxed text-[#5e4d45] md:text-lg"> Válogass modern kollekcióinkból, vagy készíts egyedi vászonképet a saját fotódból. </p>
          <div className="animate-hero-text delay-3 mt-8 flex flex-wrap gap-4">
            <Link href="/egyedi-vaszonkep" className="rounded-2xl bg-[#d17d58] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-[#b06a4a] hover:-translate-y-0.5"> Feltöltöm a képem </Link>
            <Link href="/termekek" className="rounded-2xl border border-[#dccfc5] bg-white/90 px-7 py-3.5 text-base font-semibold text-[#463732] shadow-sm transition hover:bg-white"> Kollekció megtekintése </Link>
          </div>
        </div>

        {/* Swiper oldal */}
        <div className="relative w-full overflow-visible">
          <div className="mx-auto max-w-[620px]">
            <div className="relative">
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
                      <div className="relative flex items-center justify-center px-4 md:px-10 min-h-[400px] md:min-h-[480px]">
                        
                        {/* A JAVÍTOTT 3D GOMB ÉS IKON */}
                        <div className="absolute left-6 top-6 z-40 perspective-container">
                          <div
                            className={`glass-btn-3d transition-all duration-200 ease-out 
                              ${isPressed ? 'btn-pressed' : ''}
                            `}
                            style={{
                              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                              transformStyle: 'preserve-3d',
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={(e) => { e.preventDefault(); setIsPressed(true); }}
                            onMouseUp={() => setIsPressed(false)}
                          >
                            <div className="flex items-center justify-center w-full h-full" style={{ transform: 'translateZ(30px)' }}>
                              <svg 
                                viewBox="0 0 100 100" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-12 h-12" 
                              >
                                <path d="M25 35 C 35 20, 65 20, 75 35" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" />
                                <path d="M75 35 L 75 22 M 75 35 L 62 35" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M75 65 C 65 80, 35 80, 25 65" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" />
                                <path d="M25 65 L 25 78 M 25 65 L 38 65" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                <text x="50" y="58" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="900" fill="#2a211d" textAnchor="middle">3D</text>
                              </svg> 
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-6 right-6 z-20 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-[#2a211d] shadow-lg backdrop-blur">{formatPrice(product.price)} Ft-tól</div>
                        
                        <div className="animate-floating-img relative w-full h-[350px] md:h-[450px]">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-105"
                            priority={index === 0}
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