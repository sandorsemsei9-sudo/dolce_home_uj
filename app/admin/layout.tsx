"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Rendelések", href: "/admin/orders" },
    { name: "Termékek", href: "/admin/products" },
    { name: "Kategóriák", href: "/admin/categories" },
    { name: "Kuponok", href: "/admin/coupons" },
    { name: "Hírlevél", href: "/admin/newsletter" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* MOBIL FEJLÉC - Fix magassággal (h-16) */}
      <div className="md:hidden bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">
          DOLCE <span className="text-[#de8c63]">HOME</span>
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-100 rounded-xl w-10 h-10 flex items-center justify-center"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* SIDEBAR (Asztalin látszik, mobilon becsúszik) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-64 bg-white p-6 border-r transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-8 hidden md:block">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 italic uppercase">
            DOLCE <span className="text-[#de8c63]">HOME</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Adminisztráció
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-black text-white shadow-lg translate-x-1"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="p-4 bg-[#fcfaf8] rounded-2xl border border-[#f3e7dc]">
            <p className="text-[10px] text-[#8a7b72] uppercase font-bold tracking-wider">Rendszer</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-[#3b2b24]">Éles üzemmód</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBIL HÁTTÉR SÖTÉTÍTÉS */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT - JAVÍTOTT RÉSZ: pt-4 md:pt-8 */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Asztali "Vissza a bolthoz" gomb */}
          <div className="mb-8 hidden md:flex items-center justify-between">
            <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition uppercase tracking-widest">
              ← Vissza a bolthoz
            </Link>
          </div>
          
          {/* Itt jelenik meg az OrdersPage vagy Dashboard */}
          {children}
        </div>
      </main>
    </div>
  );
}