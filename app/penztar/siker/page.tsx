"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useCartStore } from "../../store/useCartStore"; // Ellenőrizd az elérési utat!

export default function SikerPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // 1. Amint betölt az oldal, ürítjük a kosarat
    clearCart();

    // 2. Rendelés sikerét ünneplő konfetti effekt
    const count = 200;
    const defaults = { origin: { y: 0.7 }, colors: ["#e3936e", "#1a1a1a"] };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-6 text-[#1a1a1a]">
      <div className="max-w-md w-full bg-white rounded-[50px] p-12 text-center shadow-2xl border border-gray-50 relative overflow-hidden">
        {/* Siker ikon */}
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-bounce">
          ✓
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">
          Szuper! <br />
          <span className="text-[#e3936e]">Rendelve.</span>
        </h1>

        <p className="text-gray-500 font-bold mb-10 text-xs leading-relaxed uppercase tracking-widest">
          Köszönjük a bizalmad! Hamarosan küldjük a visszaigazolást e-mailben.
        </p>

        <Link
          href="/"
          className="block w-full bg-[#1a1a1a] text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#e3936e] transition-all active:scale-95 shadow-lg"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  );
}