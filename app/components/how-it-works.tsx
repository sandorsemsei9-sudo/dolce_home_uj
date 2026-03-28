"use client";

import React from "react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "📷",
    title: "Válassz fotót",
    description: "Töltsd fel saját képed, vagy válassz a galériánkból.",
    bg: "/select.webp"
  },
  {
    number: "02",
    icon: "🖼️",
    title: "Állítsd be",
    description: "Válaszd ki a méretet és formátumot, majd nézd meg előnézetben.",
    bg: "/upload.webp",
  },
  {
    number: "03",
    icon: "🛒",
    title: "Rendeld meg",
    description: "Add hozzá a kosárhoz, és pár napon belül megérkezik hozzád.",
    bg: "/order.webp",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[#fdfbf9] py-20 md:py-28 overflow-hidden">
      {/* GPU gyorsított háttér */}
      <div className="absolute inset-0 bg-[#f8f3ef]/40 pointer-events-none transform-gpu" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* FEJLÉC */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#d17d58]">
            Egyszerű folyamat
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-[#2a211d] md:text-5xl italic leading-tight">
            Vászonkép rendelése
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#7a665c] opacity-80">
            Néhány egyszerű lépésben elkészítheted a saját, személyre szabott
            vászonképedet.
          </p>
        </div>

        {/* KÁRTYA GRID */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <Link 
              href="/egyedi-vaszonkep" 
              key={step.number}
              className="group relative flex flex-col items-center text-center rounded-[32px] bg-white border border-[#efebe6] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] will-change-transform"
            >
              {/* KÉP RÉTEG - Optimalizálva */}
              <div className="absolute inset-0 z-0 rounded-[32px] overflow-hidden transform-gpu">
                <img
                  src={step.bg}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 will-change-transform"
                  loading="lazy"
                  decoding="async" 
                />
                {/* Fix overlay az akadozó opacity-váltás helyett */}
                <div className="absolute inset-0 bg-white/90 transition-colors duration-500 group-hover:bg-white/75" />
              </div>

              {/* TARTALOM */}
              <div className="relative z-10 w-full px-6 py-12 md:py-16 flex flex-col items-center">
                {/* Ikon Box - GPU gyorsítva */}
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm border border-[#f0ece8] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 will-change-transform transform-gpu">
                  {step.icon}
                </div>

                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
                  {step.number}. Lépés
                </div>

                <h3 className="text-xl font-bold text-[#2a211d] md:text-2xl transition-colors duration-300 group-hover:text-[#d17d58]">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-[#7a665c] md:text-base opacity-90">
                  {step.description}
                </p>

                {/* Indítás gomb - finomabb animáció */}
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d17d58] opacity-0 transition-all duration-500 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                  Indítás <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}