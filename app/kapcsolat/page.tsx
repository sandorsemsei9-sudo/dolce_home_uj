"use client";

import { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function KapcsolatPage() {
  // Aktuálisan nyitott GYIK indexe
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Mennyi idő alatt készül el egy egyedi vászonkép?",
      a: "Az egyedi képek gyártása általában 1-2 munkanapot vesz igénybe, majd ezt követi a 1-2 napos szállítás, így összesen 3-4 munkanappal érdemes számolni."
    },
    {
      q: "Milyen felbontású kép szükséges a feltöltéshez?",
      a: "A tökéletes végeredmény érdekében legalább 2-3 MB méretű, nagy felbontású JPEG vagy PNG fájlt javasolunk. Rendszerünk jelzi, ha a kép minősége túl alacsony lenne."
    },
    {
      q: "Van lehetőség utánvétes fizetésre?",
      a: "Természetesen! A futárnál készpénzzel és bankkártyával is fizethetsz a csomag átvételekor. Emellett biztonságos online bankkártyás fizetést is biztosítunk."
    },
    {
      q: "Hogyan tisztíthatom a vászonképet?",
      a: "A vászonképeink speciális UV-álló réteget kapnak, így egy száraz vagy enyhén nedves mikroszálas törlőkendővel óvatosan portalaníthatók."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#2a211d]">
      <Navbar />

      {/* FEJLÉC SZEKCIÓ */}
      <section className="border-b border-[#efebe6] bg-[#fdfbf9]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
              Kapcsolat
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#2a211d] md:text-6xl">
              Miben segíthetünk?
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#5e4d45]">
              Kérdésed van a rendeléssel, egyedi vászonképpel vagy a szállítással kapcsolatban? 
              Írj nekünk, és munkatársaink hamarosan válaszolnak.
            </p>
          </div>
        </div>
      </section>

      {/* TARTALMI RÉSZ */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          
          {/* BAL OLDAL: ELÉRHETŐSÉG ÉS GYIK */}
          <div className="space-y-8">
            
            {/* Elérhetőségek kártya */}
            <div className="rounded-[32px] border border-[#efebe6] bg-white p-8 shadow-sm">
              <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-[#d17d58]">
                Elérhetőségek
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="text-xl">✉</span>
                  <div>
                    <p className="text-xs font-bold text-[#2a211d]">E-mail</p>
                    <p className="text-sm text-[#5e4d45]">info@dolcehome.hu</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4 border-t border-[#f7f3f0]">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-xs font-bold text-[#2a211d]">Telefon</p>
                    <p className="text-sm text-[#5e4d45]">+36 30 123 4567</p>
                    <p className="text-[11px] text-[#9a8f84] mt-1">H-P: 9:00 - 17:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4 border-t border-[#f7f3f0]">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-xs font-bold text-[#2a211d]">Cím</p>
                    <p className="text-sm text-[#5e4d45]">1111 Budapest, Minta utca 12.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* GYIK / ACCORDION SZEKCIÓ */}
            <div className="rounded-[32px] border border-[#efebe6] bg-[#fdfbf9] p-8 transition-all">
              <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-[#d17d58]">
                Gyakori Kérdések
              </p>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-[#efebe6] last:border-0">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between py-4 text-left transition-all hover:text-[#d17d58]"
                    >
                      <span className="text-sm font-bold text-[#2a211d] pr-4">{faq.q}</span>
                      <span className={`text-lg transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                        ↓
                      </span>
                    </button>
                    
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        openIndex === index ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden text-sm leading-relaxed text-[#5e4d45]">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JOBB OLDAL: ÜZENETKÜLDŐ FORM */}
          <div className="rounded-[40px] border border-[#efebe6] bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#d17d58]">
              Online Üzenet
            </p>
            <h2 className="text-2xl font-semibold text-[#2a211d]">
              Írj nekünk közvetlenül
            </h2>

            <form className="mt-10 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#4c4742] ml-1">Név</label>
                  <input
                    type="text"
                    placeholder="Teljes név"
                    className="w-full rounded-2xl border border-[#efebe6] bg-[#fdfbf9] px-5 py-4 text-sm outline-none transition focus:border-[#d17d58] placeholder:text-[#b0a8a0]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#4c4742] ml-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="pelda@email.hu"
                    className="w-full rounded-2xl border border-[#efebe6] bg-[#fdfbf9] px-5 py-4 text-sm outline-none transition focus:border-[#d17d58] placeholder:text-[#b0a8a0]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4c4742] ml-1">Tárgy</label>
                <input
                  type="text"
                  placeholder="Miben segíthetünk?"
                  className="w-full rounded-2xl border border-[#efebe6] bg-[#fdfbf9] px-5 py-4 text-sm outline-none transition focus:border-[#d17d58] placeholder:text-[#b0a8a0]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4c4742] ml-1">Üzenet</label>
                <textarea
                  rows={5}
                  placeholder="Írd le a kérdésedet vagy kérésedet..."
                  className="w-full rounded-2xl border border-[#efebe6] bg-[#fdfbf9] px-5 py-4 text-sm outline-none transition focus:border-[#d17d58] placeholder:text-[#b0a8a0] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-full bg-[#d17d58] px-12 py-4 text-sm font-bold text-white transition-all hover:bg-[#b06746] hover:shadow-lg active:scale-95"
              >
                Üzenet küldése
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}