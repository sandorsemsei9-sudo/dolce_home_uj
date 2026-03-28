"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // A login oldalon ne látszódjon a menü
  if (pathname === "/admin/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const menuItems = [
    { name: "📊 Dashboard", path: "/admin" },
    { name: "📦 Rendelések", path: "/admin/orders" },
    { name: "🖼️ Termékek", path: "/admin/products" },
    { name: "📁 Kategóriák", path: "/admin/categories" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col p-6 shadow-sm">
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
  );
}