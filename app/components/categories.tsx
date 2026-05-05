"use client";

import React from "react";

type CategoryItem = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  gridClass: string; // Itt határozzuk meg az egyedi méretet
};

export default function Categories() {
  const items: CategoryItem[] = [
    {
      title: "Absztrakt & Modern",
      subtitle: "Modern, karakteres kompozíciók",
      image: "/images/lo.webp",
      href: "/termekek",
      gridClass: "md:col-span-4 h-[350px]", // Hosszabb elem
    },
    {
      title: "Természet & Tájképek",
      subtitle: "Lágy, elegáns hangulatú képek",
      image: "/images/falu.webp",
      href: "/termekek",
      gridClass: "md:col-span-2 h-[350px]", // Rövidebb elem
    },
    {
      title: "Városi & Építészeti",
      subtitle: "Letisztult formák, finom részletek",
      image: "/images/parizs.webp",
      href: "/termekek",
      gridClass: "md:col-span-3 h-[350px]", // Közepes elem
    },
    {
      title: "Gyerekszoba",
      subtitle: "Vidám, mesés dekorációk",
      image: "/images/halacskak.webp",
      href: "/termekek",
      gridClass: "md:col-span-3 h-[350px]", // Közepes elem
    },
  ];

  return (
    <section className="relative bg-[#fdfbf9] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58] opacity-80">
            Kategóriák
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2a211d] md:text-4xl italic">
            Válogass stílus szerint
          </h2>
        </div>

        {/* Dinamikus Grid rendszer */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`group relative flex flex-col overflow-hidden rounded-[40px] bg-[#2a211d] transition-all duration-500 ease-in-out hover:shadow-2xl ${item.gridClass}`}
            >
              {/* Kép réteg */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover opacity-95 brightness-[0.8] saturate-[0.8] transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-100 group-hover:brightness-100 group-hover:saturate-100"
              />

              {/* Overlay gradiens */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-50" />

              {/* Tartalom */}
              <div className="relative mt-auto p-10 z-10 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold text-white tracking-tight md:text-3xl drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 drop-shadow-md">
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}