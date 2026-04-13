"use client";

import React from "react";

type CategoryItem = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  large?: boolean;
};

export default function Categories() {
  const items: CategoryItem[] = [
    {
      title: "Absztrakt & Modern",
      subtitle: "Modern, karakteres kompozíciók",
      image: "/absztrakt.png",
      href: "#",
    },
    {
      title: "Természet & Tájképek",
      subtitle: "Lágy, elegáns hangulatú képek",
      image: "/termeszet.png",
      href: "#",
    },
    {
      title: "Városi & Építészeti",
      subtitle: "Letisztult formák, finom részletek",
      image: "/varosi.png",
      href: "#",
    },
    {
      title: "Válassz egyedi képet!",
      subtitle: "Kiemelt vászonképek kedvezőbb áron",
      image: "/egyedi-kategoria.png",
      href: "#",
      large: true,
    },
    {
      title: "Gyerekszoba",
      subtitle: "Saját fotóból készült személyes dekor",
      image: "/gyerekszoba.png",
      href: "#",
    },
  ];

  return (
    <section className="relative bg-[#fdfbf9] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header rész finomítása */}
        <div className="mb-10 md:mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58] opacity-80">
            Kategóriák
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2a211d] md:text-4xl italic">
            Válogass stílus szerint
          </h2>
        </div>

        {/* Grid rendszer */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`group relative flex flex-col overflow-hidden rounded-[32px] transition-all duration-500 ease-in-out hover:shadow-2xl hover:shadow-[#d17d58]/10 ${
                item.large ? "md:col-span-4 h-[320px]" : "md:col-span-2 h-[320px]"
              }`}
            >
              {/* Kép réteg */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-contain transition duration-700 ease-out group-hover:scale-110"
              />

              {/* Finomabb, sötétebb gradiens a jobb olvashatóságért */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

              {/* Tartalom réteg */}
              <div className="relative mt-auto p-8 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="max-w-xs">
                  <h3 className="text-2xl font-bold text-white tracking-tight md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white/70 transition-colors group-hover:text-white/90">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <span>Megnézem</span>
                  <svg 
                    className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* Extra finom fehér keret hoverkor */}
              <div className="absolute inset-0 rounded-[32px] border-2 border-white/0 transition-colors duration-500 group-hover:border-white/10" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}