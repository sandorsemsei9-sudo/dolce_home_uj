"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  if (pathname === "/admin/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", emoji: "📊" },
    { name: "Rendelések", path: "/admin/orders", emoji: "📦" },
    { name: "Termékek", path: "/admin/products", emoji: "🖼️" },
    { name: "Kategóriák", path: "/admin/categories", emoji: "📁" },
  ];

  return (
    <>
      {/* ASZTALI OLDALSÁV (Marad bal oldalon, md kijelzőtől felfelé) */}
      <aside className="hidden md:flex w-64 bg-white border-r min-h-screen flex-col p-6 shadow-sm sticky top-0">
        <div className="mb-10">
          <h1 className="text-xl font-black italic uppercase">Dolce Home</h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest">ADMIN</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path))
                  ? "bg-blue-600 text-white shadow-blue-200 shadow-lg"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span>{item.emoji}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors border-t pt-6"
        >
          🚪 Kijelentkezés
        </button>
      </aside>

      {/* MOBIL ALSÓ MENÜ (Csak telefonon látszik, md alatt) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              pathname === item.path ? "text-blue-600 scale-110" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-bold mt-1">
               {item.name === "Dashboard" ? "Főoldal" : item.name}
            </span>
          </Link>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center p-2 text-red-400">
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-bold mt-1">Ki</span>
        </button>
      </nav>
    </>
  );
}