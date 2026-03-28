"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Allura } from "next/font/google";
import { useCartStore } from "../store/useCartStore";

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
});

const navLinks = [
  { label: "Főoldal", href: "/" },
  { label: "Egyedi vászonkép", href: "/egyedi-vaszonkep" },
  { label: "Galériánk", href: "/termekek" },
  { label: "Kapcsolat", href: "/kapcsolat" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 
      ${scrolled 
        ? "bg-white/90 border-b border-[#efebe6] backdrop-blur-md py-3 shadow-sm" 
        : "bg-[#fdfbf9]/50 py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          
          {/* LOGO ÉS SZÖVEG IGAZÍTÁSA */}
          <Link href="/" className="group flex items-center gap-3 outline-none">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#efebe6] bg-white p-1.5 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md group-hover:border-[#d17d58]/30">
              <img src="/logo.png" alt="Dolce Home" className="h-full w-full object-contain" />
            </div>
            
            {/* A -mb-1 húzza lejjebb a szöveget, hogy optikailag középen legyen a logóval */}
            <span className={`${allura.className} text-3xl md:text-4xl text-[#2a211d] transition-all duration-300 group-hover:text-[#d17d58] -mb-1`}>
              Dolce Home
            </span>
          </Link>

          {/* DESKTOP NAV - Aláhúzás animációval */}
          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group/link relative text-[11px] font-black uppercase tracking-[0.2em] text-[#7a665c] transition-colors hover:text-[#2a211d]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#d17d58] transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </nav>

          {/* JOBB OLDAL - KOSÁR ANIMÁCIÓVAL */}
          <div className="flex items-center gap-4">
            <Link
              href="/kosar"
              className="relative flex h-11 items-center gap-3 rounded-full border border-[#efebe6] bg-white px-5 transition-all duration-300 hover:border-[#d17d58] hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="relative">
                <svg 
                  className="h-5 w-5 text-[#2a211d] transition-colors group-hover:text-[#d17d58]" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#d17d58] text-[9px] font-bold text-white animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden text-xs font-bold uppercase tracking-wider text-[#2a211d] sm:block group-hover:text-[#d17d58]">
                Kosár
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] transition-all hover:bg-[#f8f3ef] lg:hidden"
            >
              <div className="relative h-5 w-5">
                <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 ${mobileOpen ? "top-2 rotate-45" : "top-1"}`} />
                <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 top-2 ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 ${mobileOpen ? "top-2 -rotate-45" : "top-3"}`} />
              </div>
            </button>
          </div>
        </div>

        {/* MOBIL MENÜ */}
        <div className={`overflow-hidden transition-all duration-500 lg:hidden ${mobileOpen ? "max-h-[400px] opacity-100 py-8" : "max-h-0 opacity-0"}`}>
          <nav className="flex flex-col gap-6 border-t border-[#efebe6] pt-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-bold text-[#2a211d] hover:text-[#d17d58] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}