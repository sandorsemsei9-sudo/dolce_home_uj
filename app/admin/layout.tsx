"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Kibővített menüpontok az új funkciókkal
  const menuItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Rendelések", href: "/admin/orders" },
    { name: "Termékek", href: "/admin/products" },
    { name: "Kategóriák", href: "/admin/categories" },
    { name: "Kuponok", href: "/admin/coupons" },     // <--- ÚJ: Itt kezeled a WELCOME10-et
    { name: "Hírlevél", href: "/admin/newsletter" }, // <--- ÚJ: Itt látod az e-maileket
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 min-h-screen border-r bg-white p-6 sticky top-0 flex flex-col">
        <div className="mb-8">
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

        {/* Státusz kártya alul */}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Egy kis üdvözlő fejléc a tartalom felett (opcionális) */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition uppercase tracking-widest">
              ← Vissza a bolthoz
            </Link>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}