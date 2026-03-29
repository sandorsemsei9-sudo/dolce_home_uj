"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function SzallitasPage() {
  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#1f1f1f]">
      <Navbar />
      
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-12">
          
          <header className="text-center space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Szállítás & Átvétel</h1>
            <p className="text-gray-500 max-w-lg mx-auto font-medium">
              Mindent megteszünk, hogy a kiválasztott vászonképed a lehető leggyorsabban és legbiztonságosabban megérkezzen hozzád.
            </p>
          </header>

          {/* FŐ KÁRTYÁK */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl">
                🚚
              </div>
              <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Házhozszállítás</h3>
              <p className="text-sm text-gray-500 font-medium">Szerződött futárszolgálatunk az ország egész területén házhoz szállítja a csomagodat.</p>
              <span className="text-2xl font-black text-[#e3936e]">1.990 Ft</span>
            </div>

            <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl">
                ⏱️
              </div>
              <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Szállítási idő</h3>
              <p className="text-sm text-gray-500 font-medium">A raktáron lévő termékeknél 2-3 munkanap, egyedi gyártású képeknél 3-5 munkanap.</p>
              <span className="text-2xl font-black text-[#e3936e]">Gyors gyártás</span>
            </div>
          </div>

          {/* RÉSZLETES INFORMÁCIÓK */}
          <div className="bg-white p-10 md:p-16 rounded-[45px] border border-gray-100 shadow-sm space-y-10">
            
            <div className="space-y-8">
              <h2 className="text-2xl font-black uppercase italic border-b pb-4">Tudnivalók</h2>
              
              <div className="grid gap-10 text-sm">
                <div className="flex gap-5">
                  <span className="text-2xl">📧</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-black uppercase tracking-tight">Hogyan kapok értesítést?</h4>
                    <p className="text-gray-500 leading-relaxed">A rendelésed feladásakor e-mailben küldünk egy csomagszámot, amivel a futárszolgálat oldalán követheted a csomagod útját.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <span className="text-2xl">📦</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-black uppercase tracking-tight">Biztonságos csomagolás</h4>
                    <p className="text-gray-500 leading-relaxed">Minden képet többrétegű védőfóliába és erős kartondobozba csomagolunk, hogy karcmentesen érkezzen meg.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <span className="text-2xl">🛡️</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-black uppercase tracking-tight">Sérülésmentes garancia</h4>
                    <p className="text-gray-500 leading-relaxed">Ha a szállítás során mégis megsérülne a termék, fotózd le, küldd el nekünk, és mi azonnal és díjmentesen küldünk egy újat!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UTÁNVÉT INFÓ */}
            <div className="bg-[#1a1a1a] text-white p-8 rounded-[35px] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold uppercase tracking-widest text-[10px] opacity-50">Fizetés a futárnál</h4>
                <p className="font-bold text-lg">Utánvétes fizetés (Készpénz vagy Kártya)</p>
              </div>
              <div className="bg-[#e3936e] px-8 py-3 rounded-2xl font-black text-sm">
                + 790 Ft
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}