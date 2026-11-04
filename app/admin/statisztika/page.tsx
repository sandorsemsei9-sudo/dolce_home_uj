"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Order {
  total_amount: number | string | null;
  status: string | null;
  created_at: string | null;
}

interface Expense {
  id: string | number;
  title: string;
  amount: number | string;
  date: string;
  category?: string;
}

interface MonthData {
  yearMonth: string;
  year: string;
  revenue: number;
  expenses: number;
  profit: number;
  name?: string;
  ordersCount: number;
  expensesCount: number;
}

const EXPENSE_CATEGORIES = [
  { value: "alapanyag", label: "Alapanyag / Beszerzés" },
  { value: "hirdetes", label: "Hirdetés / Marketing" },
  { value: "szallitas", label: "Szállítási díj" },
  { value: "egyeb", label: "Egyéb kiadás" },
];

export default function StatisticsPage() {
  const supabase = createClient();
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Új kiadás űrlap state-ek
  const [newExpenseTitle, setNewExpenseTitle] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
  const [newExpenseDate, setNewExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>("alapanyag");

  // Évválasztó és Részletező (Modal / Panel) state
  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [activeMonthModal, setActiveMonthModal] = useState<string | null>(null); // pl. "2026-11"

  // Adatok betöltése Supabase-ből
  async function fetchData() {
    setLoading(true);

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, status, created_at");

    if (ordersError) {
      console.error("Hiba a rendelések lekérésekor:", ordersError.message);
    } else {
      setOrders(ordersData || []);
    }

    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (expensesError) {
      console.error("Hiba a kiadások lekérésekor:", expensesError.message);
    } else {
      setExpensesList(expensesData || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [supabase]);

  // Elérhető évek kigyűjtése
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    yearsSet.add(currentYearStr);

    orders.forEach(o => {
      if (o.created_at) {
        const y = new Date(o.created_at).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
    });

    expensesList.forEach(e => {
      if (e.date) {
        const y = new Date(e.date).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
    });

    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [orders, expensesList, currentYearStr]);

  // Havi bontás számítása a kiválasztott év alapján + aktuális havi adatok külön kezelése
  const { monthlyBreakdown, yearlyStats } = useMemo(() => {
    const monthsMap: Record<string, MonthData> = {};

    // 12 hónap inicializálása a kiválasztott évre
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      const ym = `${selectedYear}-${monthStr}`;
      monthsMap[ym] = {
        yearMonth: ym,
        year: selectedYear,
        revenue: 0,
        expenses: 0,
        profit: 0,
        name: formatMonthName(ym),
        ordersCount: 0,
        expensesCount: 0,
      };
    }

    // Teljes globális havi térkép az aktuális hónap pontos kiszámításához (függetlenül a kiválasztott évtől)
    const globalMonthsMap: Record<string, { revenue: number; expenses: number }> = {};

    // Rendelések feldolgozása
    orders.forEach(o => {
      if (o.status === 'cancelled' || !o.created_at) return;
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return;
      
      const y = String(d.getFullYear());
      const ym = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Globális összesítés
      if (!globalMonthsMap[ym]) globalMonthsMap[ym] = { revenue: 0, expenses: 0 };
      globalMonthsMap[ym].revenue += Number(o.total_amount) || 0;

      // Kiválasztott év szűrése a havi listához
      if (y === selectedYear && monthsMap[ym]) {
        monthsMap[ym].revenue += Number(o.total_amount) || 0;
        monthsMap[ym].ordersCount += 1;
      }
    });

    // Kiadások feldolgozása
    expensesList.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;

      const y = String(d.getFullYear());
      const ym = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Globális összesítés
      if (!globalMonthsMap[ym]) globalMonthsMap[ym] = { revenue: 0, expenses: 0 };
      globalMonthsMap[ym].expenses += Number(e.amount) || 0;

      // Kiválasztott év szűrése a havi listához
      if (y === selectedYear && monthsMap[ym]) {
        monthsMap[ym].expenses += Number(e.amount) || 0;
        monthsMap[ym].expensesCount += 1;
      }
    });

    let totalRev = 0;
    let totalExp = 0;

    const breakdown = Object.values(monthsMap).map(m => {
      const profit = m.revenue - m.expenses;
      totalRev += m.revenue;
      totalExp += m.expenses;
      return { ...m, profit };
    }).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)); // Legfrissebb hónap elöl

    // Pontos aktuális hónap (pl. 2026-11) meghatározása
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = globalMonthsMap[currentYM] || { revenue: 0, expenses: 0 };
    const currentMonthProfit = currentMonthData.revenue - currentMonthData.expenses;

    return {
      monthlyBreakdown: breakdown,
      yearlyStats: {
        totalRevenue: totalRev,
        totalExpenses: totalExp,
        totalProfit: totalRev - totalExp,
        monthlyRevenue: currentMonthData.revenue,
        monthlyExpenses: currentMonthData.expenses,
        monthlyProfit: currentMonthProfit,
      }
    };
  }, [orders, expensesList, selectedYear]);

  function formatMonthName(ym: string): string {
    const [year, month] = ym.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' });
  }

  // Kiválasztott hónap kiadásainak szűrése
  const selectedMonthExpenses = useMemo(() => {
    if (!activeMonthModal) return [];
    return expensesList.filter(e => e.date && e.date.startsWith(activeMonthModal));
  }, [expensesList, activeMonthModal]);

  // Új kiadás mentése
  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) return;

    setSubmitting(true);
    const { error } = await supabase.from("expenses").insert([
      {
        title: newExpenseTitle,
        amount: Number(newExpenseAmount),
        date: newExpenseDate,
        category: newExpenseCategory,
      },
    ]);

    if (error) {
      alert("Hiba történt a kiadás mentésekor: " + error.message);
    } else {
      setNewExpenseTitle("");
      setNewExpenseAmount("");
      fetchData();
    }
    setSubmitting(false);
  }

  // Kiadás törlése
  async function handleDeleteExpense(id: string | number) {
    if (!confirm("Biztosan törölni szeretnéd ezt a kiadást?")) return;

    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert("Hiba a törlés során: " + error.message);
    } else {
      fetchData();
    }
  }

  function getCategoryLabel(catVal?: string) {
    const found = EXPENSE_CATEGORIES.find(c => c.value === catVal);
    return found ? found.label : (catVal || "Egyéb");
  }

  const cards = [
    { 
      title: `${selectedYear}. Évi összes bevétel`, 
      value: `${yearlyStats.totalRevenue.toLocaleString()} Ft`, 
      icon: "📈", 
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "Kiválasztott év bruttó forgalma"
    },
    { 
      title: `${selectedYear}. Évi összes kiadás`, 
      value: `${yearlyStats.totalExpenses.toLocaleString()} Ft`, 
      icon: "📉", 
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Kiválasztott év összes kiadása"
    },
    { 
      title: `${selectedYear}. Évi nettó profit`, 
      value: `${yearlyStats.totalProfit.toLocaleString()} Ft`, 
      icon: "💎", 
      color: yearlyStats.totalProfit >= 0 ? "text-emerald-600" : "text-amber-600",
      bg: "bg-emerald-50",
      desc: "Éves bevétel mínusz kiadás"
    },
    { 
      title: "Aktuális havi nettó profit", 
      value: `${yearlyStats.monthlyProfit.toLocaleString()} Ft`, 
      icon: "💰", 
      color: yearlyStats.monthlyProfit >= 0 ? "text-emerald-600" : "text-amber-600",
      bg: "bg-emerald-50",
      desc: "Aktuális hónap egyenlege"
    },
  ];

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER & ÉVVÁLASZTÓ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link href="/admin" className="text-xs font-black uppercase text-blue-600 tracking-widest hover:underline mb-2 inline-block">
            ← Vissza a Dashboardra
          </Link>
          <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">
            Pénzügyi <span className="text-blue-600">Statisztika</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">
            Bevételek, kiadások és havi részletek
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">Év szűrése:</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-50 border border-gray-200 font-black text-blue-600 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
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

      {/* --- HAVI BONTÁSI LISTA (Kattintható kártyák) --- */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">{selectedYear}. évi havi bontás</h3>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Kattints bármelyik hónapra a részletes adatokért és kiadásokért
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400 text-sm italic py-8 text-center animate-pulse">Havi adatok betöltése...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyBreakdown.map((m) => (
                <div 
                  key={m.yearMonth} 
                  onClick={() => setActiveMonthModal(m.yearMonth)}
                  className="bg-gray-50 p-6 rounded-[28px] border border-gray-200/60 flex flex-col justify-between space-y-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full capitalize">
                        {m.name}
                      </span>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Részletek →
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="text-xs font-bold uppercase tracking-wider">Bevétel ({m.ordersCount} db):</span>
                        <span className="font-extrabold text-blue-600">{m.revenue.toLocaleString()} Ft</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="text-xs font-bold uppercase tracking-wider">Kiadás ({m.expensesCount} db):</span>
                        <span className="font-extrabold text-amber-600">{m.expenses.toLocaleString()} Ft</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nettó profit:</span>
                    <span className={`font-black text-base ${m.profit >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {m.profit.toLocaleString()} Ft
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- RÉSZLETEZŐ MODAL / PANEL --- */}
      {activeMonthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[36px] p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase text-blue-600 tracking-widest">Havi részletes nézet</span>
                <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter capitalize">
                  {formatMonthName(activeMonthModal)}
                </h2>
              </div>
              <button 
                onClick={() => setActiveMonthModal(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {(() => {
              const mData = monthlyBreakdown.find(m => m.yearMonth === activeMonthModal);
              if (!mData) return null;
              return (
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Összes bevétel</p>
                    <p className="text-lg font-black text-blue-600">{mData.revenue.toLocaleString()} Ft</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Összes kiadás</p>
                    <p className="text-lg font-black text-amber-600">{mData.expenses.toLocaleString()} Ft</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Nettó profit</p>
                    <p className={`text-lg font-black ${mData.profit >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {mData.profit.toLocaleString()} Ft
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              <h4 className="text-lg font-black uppercase text-gray-800 italic">Ebben a hónapban rögzített kiadások:</h4>
              {selectedMonthExpenses.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-6 text-center">Nincsenek rögzített kiadások ebben a hónapban.</p>
              ) : (
                <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase text-gray-400 font-black">
                        <th className="pb-3">Dátum</th>
                        <th className="pb-3">Megnevezés</th>
                        <th className="pb-3">Kategória</th>
                        <th className="pb-3 text-right">Összeg</th>
                        <th className="pb-3 text-right">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {selectedMonthExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 text-gray-500 font-medium text-xs">{exp.date}</td>
                          <td className="py-3 font-bold text-gray-800">{exp.title}</td>
                          <td className="py-3">
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                              {getCategoryLabel(exp.category)}
                            </span>
                          </td>
                          <td className="py-3 font-extrabold text-amber-600 text-right">{Number(exp.amount).toLocaleString()} Ft</td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-gray-400 hover:text-amber-600 text-xs font-bold transition-colors p-1"
                              title="Törlés"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setActiveMonthModal(null)}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE MANAGEMENT & CATEGORIES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Új kiadás rögzítése */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic mb-6">Új kiadás rögzítése</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Megnevezés</label>
              <input 
                type="text" 
                placeholder="pl. Csomagolóanyag, Google Ads" 
                value={newExpenseTitle}
                onChange={(e) => setNewExpenseTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Kategória</label>
              <select 
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Összeg (Ft)</label>
              <input 
                type="number" 
                placeholder="pl. 15000" 
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Dátum</label>
              <input 
                type="date" 
                value={newExpenseDate}
                onChange={(e) => setNewExpenseDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Mentés..." : "Kiadás hozzáadása"}
            </button>
          </form>
        </div>

        {/* Teljes kiadási lista */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic mb-6">Összes rögzített kiadás</h3>
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-2">
              {expensesList.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-8 text-center">Még nincsenek rögzített kiadások.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase text-gray-400 font-black">
                      <th className="pb-3">Dátum</th>
                      <th className="pb-3">Megnevezés</th>
                      <th className="pb-3">Kategória</th>
                      <th className="pb-3 text-right">Összeg</th>
                      <th className="pb-3 text-right">Művelet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {expensesList.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-gray-500 font-medium text-xs">{exp.date}</td>
                        <td className="py-3 font-bold text-gray-800">{exp.title}</td>
                        <td className="py-3">
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                            {getCategoryLabel(exp.category)}
                          </span>
                        </td>
                        <td className="py-3 font-extrabold text-amber-600 text-right">{Number(exp.amount).toLocaleString()} Ft</td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-gray-400 hover:text-amber-600 text-xs font-bold transition-colors p-1"
                            title="Törlés"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}