"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function VisszakuldesPage() {
  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#1f1f1f]">
      <Navbar />
      
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-12">
          
          <header className="text-center space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Visszaküldés & Garancia</h1>
            <p className="text-gray-500 max-w-lg mx-auto font-medium">
              Szeretnénk, ha elégedett lennél a faladon díszelgő alkotással. Itt találod a részleteket, ha valami mégsem stimmel.
            </p>
          </header>

          <div className="bg-white p-10 md:p-16 rounded-[45px] border border-gray-100 shadow-sm space-y-12">
            
            {/* 1. EGYEDI TERMÉKEK KIVÉTELE */}
            <div className="space-y-4 bg-orange-50/50 p-8 rounded-[30px] border border-orange-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-lg font-black uppercase italic">Fontos tudnivaló egyedi képeknél</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                A 45/2014. (II. 26.) Korm. rendelet értelmében a **kifejezetten a vásárló kérésére, egyedi igényei alapján legyártott termékekre** (pl. saját fotóból készült vászonkép) nem vonatkozik a 14 napos indoklás nélküli elállási jog. Kérjük, ezt vedd figyelembe a rendelésed véglegesítésekor!
              </p>
            </div>

            {/* 2. MIRE VAN GARANCIA? */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic border-b pb-4">Mikor küldjük újra?</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-bold uppercase text-xs tracking-widest text-[#e3936e]">Szállítási sérülés</h4>
                  <p className="text-sm text-gray-500">Ha a futár sérült dobozt hoz, vagy kibontás után látod, hogy a keret megrepedt, a vászon kiszakadt.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold uppercase text-xs tracking-widest text-[#e3936e]">Gyártási hiba</h4>
                  <p className="text-sm text-gray-500">Ha a nyomat színei szemmel láthatóan hibásak (nem a monitorod beállítása miatt), vagy nem a kért méretet kaptad.</p>
                </div>
              </div>
            </div>

            {/* 3. FOLYAMAT */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black uppercase italic border-b pb-4">A visszaküldés menete</h2>
              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 shrink-0 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black italic">1</div>
                  <div>
                    <h4 className="font-bold text-black uppercase tracking-tight">Fotózd le a hibát</h4>
                    <p className="text-sm text-gray-500">Készíts pár tiszta fotót a sérülésről vagy a hibáról, illetve a csomagolásról is, ha az is sérült volt.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 shrink-0 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black italic">2</div>
                  <div>
                    <h4 className="font-bold text-black uppercase tracking-tight">Írj nekünk e-mailt</h4>
                    <p className="text-sm text-gray-500 font-medium text-black">info@webshopod.hu</p>
                    <p className="text-sm text-gray-500 mt-1">Küldd el a rendelésszámodat és a fotókat. 24 órán belül válaszolunk!</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 shrink-0 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black italic">3</div>
                  <div>
                    <h4 className="font-bold text-black uppercase tracking-tight">Csere vagy javítás</h4>
                    <p className="text-sm text-gray-500">Jogos reklamáció esetén saját költségünkön gyártjuk újra és szállítjuk ki neked a hibátlan terméket.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VISSZAUTALÁS */}
            <div className="bg-gray-50 p-8 rounded-[35px] text-center space-y-2">
              <span className="text-2xl">💰</span>
              <h4 className="font-bold uppercase tracking-tight">Pénzvisszatérítés</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto italic">
                Amennyiben elállásra jogosult terméket vásároltál (nem egyedi kép), a vételárat a termék visszaérkezését követő 14 napon belül visszautaljuk a megadott bankszámládra.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}