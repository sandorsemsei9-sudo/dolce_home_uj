"use client";

import React from "react";

export default function Features() {
  const items = [
    {
      // Teherautó - Masszívabb, teli forma
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
          <path d="M15 6.75a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v7.5h-3V6.75zM20.25 9h-2.25v5.25h3.75v-1.5c0-2.071-1.679-3.75-3.75-3.75z" />
          <path d="M15 15h6.75V16.5a3 3 0 11-6 0V15z" />
        </svg>
      ),
      title: "Gyors szállítás",
      desc: "3–5 munkanapon belül kézhez kapod.",
    },
    {
      // Kártya/Ajándék - Teli, barátságos forma
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 100-3.75h-5.25z" />
          <path d="M11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6a2.25 2.25 0 002.25-2.25v-6.75h-8.25z" />
        </svg>
      ),
      title: "Ingyenes szállítás",
      desc: "Bizonyos összeg felett teljesen díjmentes.",
    },
    {
      // Pajzs/Lakat - Biztonságérzetet adó teli forma
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M12.516 2.144a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.991a.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zm3.12 8.476a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4.017-5.5z" clipRule="evenodd" />
        </svg>
      ),
      title: "Biztonságos fizetés",
      desc: "Titkosított és megbízható checkout.",
    },
    {
      // Visszaküldés - Meghagytuk az eredeti vonalas stílust, mert az tetszett
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      ),
      title: "Egyszerű visszaküldés",
      desc: "Gond nélkül visszaküldheted a terméket.",
    },
  ];

  return (
    <section className="bg-[#fdfbf9] border-y border-[#efebe6]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 md:grid-cols-4 md:gap-x-8">
          {items.map((item, i) => (
            <div key={i} className="group flex flex-col items-center text-center">
              
              {/* Ikon konténer - kicsit nagyobb méret, hogy hangsúlyosabb legyen */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#efebe6]/30 text-[#d17d58] transition-all duration-500 group-hover:bg-[#d17d58] group-hover:text-white group-hover:shadow-xl group-hover:-translate-y-1">
                {item.icon}
              </div>

              {/* Cím - vastagabb és elegánsabb */}
              <h3 className="text-[14px] font-black uppercase tracking-widest text-[#2a211d]">
                {item.title}
              </h3>

              {/* Leírás */}
              <p className="mt-3 max-w-[200px] text-[13px] leading-relaxed text-[#7a665c] opacity-80">
                {item.desc}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}