"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function ASZFPage() {
  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#1f1f1f]">
      <Navbar />
      
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="bg-white p-10 md:p-16 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          
          <header className="border-b pb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Általános Szerződési Feltételek</h1>
            <p className="text-sm text-gray-400 font-medium">Utoljára frissítve: 2024. 05. 22.</p>
          </header>

          <div className="prose prose-orange max-w-none space-y-8 text-gray-700 leading-relaxed">
            
            {/* 1. Üzemeltetői adatok */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">01</span>
                Üzemeltetői adatok
              </h2>
              <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-sm space-y-2">
                <p><strong>Szolgáltató neve:</strong> [Vállalkozás Neve / Egyéni Vállalkozó Neve]</p>
                <p><strong>Székhely:</strong> [Település, Utca, Házszám]</p>
                <p><strong>Adószám:</strong> [Adószám]</p>
                <p><strong>Nyilvántartási szám:</strong> [Vállalkozói igazolvány száma]</p>
                <p><strong>E-mail cím:</strong> [Email cím]</p>
                <p><strong>Telefonszám:</strong> [Telefonszám]</p>
              </div>
            </section>

            {/* 2. Megrendelés folyamata */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">02</span>
                Megrendelés folyamata
              </h2>
              <p>
                A webáruházban történő vásárlás elektronikus úton leadott megrendeléssel lehetséges. A rendelés leadásával a vásárló kijelenti, hogy elfogadja a jelen ÁSZF feltételeit és az Adatkezelési tájékoztatót. A szolgáltató a rendelés beérkezését követően automatikus visszaigazoló e-mailt küld.
              </p>
            </section>

            {/* 3. Árak és fizetés */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">03</span>
                Árak és fizetési feltételek
              </h2>
              <p>
                A termékek mellett feltüntetett árak magyar forintban értendők és tartalmazzák a törvényben előírt áfát (vagy alanyi adómentesek). A fizetés történhet bankkártyával (Stripe), banki átutalással vagy utánvéttel. Utánvét esetén a kezelési költség fix 790 Ft.
              </p>
            </section>

            {/* 4. Szállítás */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">04</span>
                Szállítási feltételek
              </h2>
              <p>
                A szállítási határidő általában a megrendeléstől számított 2-5 munkanap. Egyedi vászonképek esetén ez az időtartam a gyártás miatt meghosszabbodhat. A kiszállítást szerződött futárszolgálati partnereink végzik.
              </p>
            </section>

            {/* 5. Elállási jog */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">05</span>
                Elállási jog és garancia
              </h2>
              <p>
                A vásárlót 14 napos elállási jog illeti meg a termék kézhezvételétől számítva. 
                <strong className="text-red-500 block mt-2">Fontos kivétel:</strong> 
                A 45/2014. (II. 26.) Korm. rendelet értelmében az egyedi, a fogyasztó kérésére előállított termékekre (pl. egyedi fényképes vászonképek) nem vonatkozik az elállási jog.
              </p>
            </section>

            {/* 6. Kuponok használata */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-[#e3936e] rounded-full flex items-center justify-center text-xs italic">06</span>
                Kuponok és kedvezmények
              </h2>
              <p>
                A kuponkódok egyszeri felhasználásra jogosítanak, kivéve ha a promóció másként rendelkezik. A kuponok készpénzre nem válthatók és más kedvezményekkel nem feltétlenül vonhatók össze. A lejárt vagy már felhasznált kuponokat a rendszer automatikusan érvényteleníti.
              </p>
            </section>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}