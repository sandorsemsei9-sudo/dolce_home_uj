"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminDashboard() {
  const supabase = createClient();
  
  // Hydration hiba elleni védelem
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,    // Függőben + Feldolgozás alatt
    waitingForShip: 0,  // Kiszállított (shipped)
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString('hu-HU'));

    async function fetchStats() {
      setLoading(true);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Rendelések lekérése (total_amount mezővel)
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, status, created_at");

      if (error) {
        console.error("Hiba a statisztika lekérésekor:", error.message);
      }

      if (orders) {
        // 1. Összes bevétel (kivéve a törölt rendelések)
        const total = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        
        // 2. Aktuális havi bevétel
        const monthly = orders
          .filter(o => o.status !== 'cancelled' && o.created_at >= firstDayOfMonth)
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        // 3. Aktív rendelések (pending + processing)
        const active = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        
        // 4. Kiszállított csomagok (shipped)
        const shipping = orders.filter(o => o.status === 'shipped').length;

        setStats({
          totalRevenue: total,
          activeOrders: active,
          waitingForShip: shipping,
          monthlyRevenue: monthly,
        });
      }
      setLoading(false);
    }

    fetchStats();
  }, [supabase]);

  const cards = [
    { 
      title: "Havi bevétel", 
      value: `${stats.monthlyRevenue.toLocaleString()} Ft`, 
      icon: "📅", 
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "Ebben a hónapban"
    },
    { 
      title: "Aktív rendelés", 
      value: stats.activeOrders, 
      icon: "⚡", 
      color: "text-orange-600",
      bg: "bg-orange-50",
      desc: "Gyártás / Feldolgozás"
    },
    { 
      title: "Kiszállítva", 
      value: stats.waitingForShip, 
      icon: "🚚", 
      color: "text-purple-600",
      bg: "bg-purple-50",
      desc: "Összes feladott csomag"
    },
    { 
      title: "Összes forgalom", 
      value: `${stats.totalRevenue.toLocaleString()} Ft`, 
      icon: "💰", 
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "Mindenkori bevétel"
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">
            Dash<span className="text-blue-600">board</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 uppercase text-[10px] tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> 
            Élő rendszeradatok — Dolce Home
          </p>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-400">Utolsó frissítés</p>
            <p className="text-sm font-bold text-gray-900">
              {mounted ? currentTime : "--:--:--"}
            </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`w-14 h-14 ${card.bg} rounded-[20px] flex items-center justify-center text-3xl mb-6 shadow-inner`}>
              {card.icon}
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.title}</p>
            <p className={`text-3xl font-black tracking-tighter ${card.color}`}>
              {loading ? <span className="animate-pulse">...</span> : card.value}
            </p>
            <p className="text-gray-400 text-[11px] mt-2 font-medium italic">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-[50px] p-12 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 italic uppercase tracking-tighter text-white">Rendelések <br/> Kezelése</h2>
            <p className="text-gray-400 mb-10 max-w-sm font-medium leading-relaxed">
              Jelenleg <span className="text-white font-black underline decoration-blue-500 underline-offset-4">{stats.activeOrders} db</span> függőben lévő rendelés vár feldolgozásra.
            </p>
            <Link 
              href="/admin/orders" 
              className="bg-white text-black px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all inline-block shadow-lg active:scale-95"
            >
              Ugrás a listához →
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 text-[200px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            📦
          </div>
        </div>

        <div className="bg-white border-4 border-dashed border-gray-100 rounded-[50px] p-12 flex flex-col justify-center items-center text-center hover:border-blue-100 transition-colors">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">✨</div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Új Termék?</h3>
          <p className="text-gray-400 mb-8 max-w-xs font-medium italic text-sm">
            Tölts fel új képeket, állítsd be a variánsokat és frissítsd a kínálatot.
          </p>
          <Link 
            href="/admin/products" 
            className="text-gray-900 font-black text-xs uppercase tracking-widest border-b-4 border-blue-500 pb-2 hover:text-blue-600 transition-all"
          >
            Termék hozzáadása
          </Link>
        </div>
      </div>
    </div>
  );
}