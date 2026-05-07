"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Kupon generáló függvény
const generateCouponCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DH-${result}`;
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [generatedCode, setGeneratedCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const newCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    try {
      // 1. Feliratkozás mentése
      const { error: subError } = await supabase
        .from("newsletter_subs")
        .insert([{ email }]);

      if (subError) {
        if (subError.code === "23505") throw new Error("Ez az e-mail cím már feliratkozott!");
        throw subError;
      }

      // 2. Kupon létrehozása
      const { error: couponError } = await supabase
        .from("coupons")
        .insert([{ 
          code: newCode, 
          discount_value: 10, 
          discount_type: 'percentage',
          expires_at: expiresAt.toISOString(),
          is_one_time: true 
        }]);

      if (couponError) throw couponError;

      setGeneratedCode(newCode);
      setStatus("success");
      setEmail(""); // Input ürítése
    } catch (err: any) {
      setErrorMessage(err.message || "Hiba történt.");
      setStatus("error");
    }
  };

  return (
    <footer className="border-t border-[#efebe6] bg-[#fdfbf9] text-[#2a211d]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        
        {/* FELSŐ RÉSZ: HÍRLEVÉL ÉS CÍMSOR */}
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#2a211d] md:text-5xl">
            {status === "success" ? "Üdvözlünk a körünkben!" : "Maradj naprakész"} <br /> 
            <span className="text-[#d17d58]">
              {status === "success" ? "Íme a kedvezményed" : "a Dolce Home újdonságaival"}
            </span>
          </h2>
          
          <div className="mt-4 max-w-md">
            {status === "success" ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <p className="mb-4 text-[#5e4d45]">Használd ezt a kódot a pénztárnál (24 óráig érvényes):</p>
                <button 
                  onClick={handleCopy}
                  className="group relative flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#d17d58] bg-white px-8 py-3 transition-all hover:bg-[#fdf8f5]"
                >
                  <span className="text-xl font-bold tracking-widest text-[#d17d58]">{generatedCode}</span>
                  <span className="text-xs font-medium text-[#d17d58] opacity-60 group-hover:opacity-100">
                    {copied ? "Másolva! ✓" : "Másolás"}
                  </span>
                </button>
              </div>
            ) : (
              <p className="text-[#5e4d45]">
                Iratkozz fel, és egy **-10%-os egyedi kupont** küldünk az első vásárlásodhoz!
              </p>
            )}
          </div>
          
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email címed..."
                className="w-full rounded-2xl border border-[#efebe6] bg-white px-6 py-4 text-sm outline-none transition-all focus:border-[#d17d58] focus:ring-1 focus:ring-[#d17d58] placeholder:text-[#b0a8a0]"
              />
              <button 
                type="submit"
                disabled={status === "loading"}
                className="rounded-2xl bg-[#d17d58] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#b06746] hover:shadow-lg active:scale-95 shrink-0 disabled:opacity-50"
              >
                {status === "loading" ? "Folyamatban..." : "Kérem a kupont"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-4 text-sm font-medium text-red-500">{errorMessage}</p>
          )}
        </div>

        {/* KÖZÉPSŐ RÉSZ: LINKELÉS ÉS INFÓK */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand/Social */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold tracking-tight text-[#2a211d]">Dolce Home</h3>
            <p className="text-sm leading-relaxed text-[#5e4d45]">
              Prémium faldekorációk és egyedi vászonképek, amelyek életet és stílust visznek az otthonodba.
            </p>
            <div className="flex gap-4">
              <Link href="https://www.facebook.com/profile.php?id=61578828933307" className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#efebe6] text-[#5e4d45] transition-all hover:border-[#d17d58] hover:text-[#d17d58]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7H7v-3h3.5V9.5c0-3.4 2-5.3 5-5.3 1.4 0 2.8.2 2.8.2v3h-1.6c-1.6 0-2.1 1-2.1 2v2.4H18l-.6 3h-2.8v7A10 10 0 0022 12z" /></svg>
              </Link>
              <Link href="https://www.instagram.com/dolce.home.hungary/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#efebe6] text-[#5e4d45] transition-all hover:border-[#d17d58] hover:text-[#d17d58]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A5.5 5.5 0 1017.5 13 5.5 5.5 0 0012 7.5zm0 2A3.5 3.5 0 1115.5 13 3.5 3.5 0 0112 9.5zM18 6.5a1 1 0 110 2 1 1 0 010-2z" /></svg>
              </Link>
            </div>
          </div>

          {/* Menü */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#d17d58]">Felfedezés</p>
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <Link href="/termekek" className="text-[#5e4d45] transition hover:text-[#d17d58]">Galéria</Link>
              <Link href="/egyedi-vaszonkep" className="text-[#5e4d45] transition hover:text-[#d17d58]">Egyedi készítés</Link>
              <Link href="/kapcsolat" className="text-[#5e4d45] transition hover:text-[#d17d58]">Kapcsolat</Link>
            </nav>
          </div>

          {/* Jogi */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#d17d58]">Információk</p>
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <Link href="/aszf" className="text-[#5e4d45] transition hover:text-[#d17d58]">ÁSZF</Link>
              <Link href="/adatvedelem" className="text-[#5e4d45] transition hover:text-[#d17d58]">Adatvédelem</Link>
              <Link href="/szallitasi-infok" className="text-[#5e4d45] transition hover:text-[#d17d58]">Szállítási infók</Link>
              <Link href="/visszakuldes" className="text-[#5e4d45] transition hover:text-[#d17d58]">Visszaküldés</Link>
            </nav>
          </div>

          {/* Kapcsolat */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#d17d58]">Kapcsolat</p>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <a href="mailto:info@dolce-home.hu" className="flex items-center gap-2 text-[#5e4d45] transition hover:text-[#d17d58]">
                <span>✉</span> info@dolce-home.hu
              </a>
              <a href="tel:+36702465783" className="flex items-center gap-2 text-[#5e4d45] transition hover:text-[#d17d58]">
                <span>📞</span> +36 70 246 5783
              </a>
              <a href="tel:+36705310124" className="flex items-center gap-2 text-[#5e4d45] transition hover:text-[#d17d58]">
                <span>📞</span> +36 70 531 0124
              </a>
              <p className="mt-2 flex items-start gap-2 text-[#7a746d]">
                <span className="mt-0.5 text-xs">📍</span> Győr Rét Utca 22. Magyarország
              </p>
            </div>
          </div>
        </div>

        {/* ALSÓ SÁV */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-[#efebe6] pt-8 text-xs font-medium text-[#9a8f84] md:flex-row">
          <p>© {new Date().getFullYear()} Dolce Home. Minden jog fenntartva.</p>
          <div className="flex gap-8">
            <span className="flex gap-1 items-center">Magyar termék 🇭🇺</span>
            <Link href="/impresszum" className="hover:text-[#2a211d]">Impresszum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}