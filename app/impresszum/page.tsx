"use client";

import Link from "next/link";

export default function Impresszum() {
  return (
    <main className="min-h-screen bg-[#f8f3ef] py-16 px-6 md:py-24">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#ede3da]">
        
        {/* Vissza gomb */}
        <Link 
          href="/" 
          className="text-[#d17d58] font-semibold text-sm uppercase tracking-wider hover:underline mb-8 block"
        >
          ← Vissza a főoldalra
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold text-[#2a211d] mb-10 border-b border-[#ede3da] pb-6">
          Impresszum
        </h1>

        <div className="space-y-8 text-[#5e4d45] leading-relaxed">
          
          {/* Szolgáltató adatai */}
          <section>
            <h2 className="text-xl font-bold text-[#2a211d] mb-3">A szolgáltató adatai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b07a5e] font-semibold">Név / Cégnév</p>
                <p className="font-medium text-lg text-[#2a211d]">[Ide írd a Nevedet vagy Cégedet]</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b07a5e] font-semibold">Székhely</p>
                <p>[Ide írd a címedet: Város, utca, házszám]</p>
              </div>
            </div>
          </section>

          {/* Kapcsolati adatok */}
          <section>
            <h2 className="text-xl font-bold text-[#2a211d] mb-3">Elérhetőségek</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b07a5e] font-semibold">E-mail cím</p>
                <p className="font-medium">[Ide írd az email címedet]</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b07a5e] font-semibold">Telefonszám</p>
                <p>[Ide írd a telefonszámodat]</p>
              </div>
            </div>
          </section>

          {/* Hatósági adatok */}
          <section className="bg-[#fffcf9] p-6 rounded-2xl border border-[#f3e9e0]">
            <h2 className="text-xl font-bold text-[#2a211d] mb-3">Nyilvántartási adatok</h2>
            <div className="space-y-3">
              <p><span className="font-semibold">Adószám:</span> [Ide az adószámodat]</p>
              <p><span className="font-semibold">Cégjegyzékszám / Nyilvántartási szám:</span> [Ide a számodat]</p>
              <p><span className="font-semibold">Bejegyző hatóság:</span> [Pl. Fővárosi Törvényszék Cégbírósága]</p>
              <p><span className="font-semibold">Kamarai tagság:</span> [Pl. Budapesti Kereskedelmi és Iparkamara]</p>
            </div>
          </section>

          {/* Tárhelyszolgáltató - KÖTELEZŐ ELEM */}
          <section>
            <h2 className="text-xl font-bold text-[#2a211d] mb-3">Tárhelyszolgáltató adatai</h2>
            <div className="p-4 border-l-4 border-[#d17d58] bg-[#fdfaf8]">
              <p className="font-semibold text-[#2a211d]">[Tárhelyszolgáltató neve]</p>
              <p>Székhely: [Tárhelyszolgáltató címe]</p>
              <p>E-mail: [Tárhelyszolgáltató email címe]</p>
            </div>
          </section>

          {/* Szerzői jogok */}
          <section className="text-sm pt-6 opacity-80">
            <p>
              A weboldalon megjelenő minden tartalom (szövegek, képek, grafikák) a 
              <strong> Dolce Home</strong> szellemi tulajdonát képezi, azok felhasználása 
              kizárólag előzetes írásbeli engedéllyel lehetséges.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}