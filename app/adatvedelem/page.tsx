"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function AdatvedelemPage() {
  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#1f1f1f]">
      <Navbar />
      
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="bg-white p-10 md:p-16 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          
          <header className="border-b pb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Adatkezelési Tájékoztató</h1>
            <p className="text-sm text-gray-400 font-medium">Hatályos: 2024. 05. 22-től</p>
          </header>

          <div className="prose prose-orange max-w-none space-y-8 text-gray-700 leading-relaxed text-sm">
            
            <p className="italic text-gray-500">
              Ez a tájékoztató azt mutatja be, hogyan kezeljük a személyes adataidat, amikor a webshopunkat használod vagy vásárolsz nálunk.
            </p>

            {/* 1. Adatkezelő */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">01</span>
                Ki kezeli az adataidat?
              </h2>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                <p><strong>Adatkezelő neve:</strong> [Vállalkozás Neve]</p>
                <p><strong>Székhely:</strong> [Cím]</p>
                <p><strong>E-mail:</strong> [Email cím]</p>
                <p><strong>Weboldal:</strong> [Domain név]</p>
              </div>
            </section>

            {/* 2. Gyűjtött adatok */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">02</span>
                Milyen adatokat gyűjtünk?
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Vásárlási adatok:</strong> Név, e-mail cím, telefonszám, számlázási és szállítási cím.</li>
                <li><strong>Technikai adatok:</strong> IP-cím, böngésző típusa (a biztonságos működéshez).</li>
                <li><strong>Egyedi rendelések:</strong> Az általad feltöltött fényképek (kizárólag a gyártás céljából).</li>
              </ul>
            </section>

            {/* 3. Cél és jogalap */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">03</span>
                Miért kezeljük ezeket?
              </h2>
              <p>Az adatkezelés elsődleges célja a köztünk létrejött **szerződés teljesítése** (a rendelésed összeállítása, kiszállítása és a számlázás). Jogszabályi kötelezettségünk továbbá a számviteli bizonylatok (számlák) megőrzése.</p>
            </section>

            {/* 4. Adattovábbítás */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">04</span>
                Kinek adjuk át az adatokat?
              </h2>
              <p>Az adataidat csak a szolgáltatás teljesítéséhez szükséges partnereknek továbbítjuk:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Szállítás:</strong> [Futárszolgálat neve, pl. GLS / MPL / Foxpost]</li>
                <li><strong>Fizetés:</strong> Stripe (bankkártyás fizetés esetén)</li>
                <li><strong>Tárhely/Adatbázis:</strong> Supabase / Vercel</li>
              </ul>
            </section>

            {/* 5. Megőrzési idő */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">05</span>
                Meddig őrizzük meg?
              </h2>
              <p>A számlázási adatokat a törvényi előírásoknak megfelelően **8 évig** őrizzük. A marketing célú adatokat (ha feliratkoztál) a hozzájárulásod visszavonásáig kezeljük.</p>
            </section>

            {/* 6. Jogok */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">06</span>
                Milyen jogaid vannak?
              </h2>
              <p>Bármikor kérhetsz tájékoztatást az adataidról, kérheted azok helyesbítését, törlését vagy az adatkezelés korlátozását. Panasz esetén a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhatsz.</p>
            </section>

          </div>

          <div className="pt-10 border-t border-gray-100">
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
              Biztonságos adatkezelés • GDPR kompatibilis
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}