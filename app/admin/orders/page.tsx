"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Státuszok és színek definíciója
const statusMap: Record<string, { label: string; color: string }> = {
  waiting_for_payment: { label: "Utalásra vár", color: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  pending: { label: "Függőben / Fizetve", color: "bg-amber-50 text-amber-700 border-amber-100" },
  processing: { label: "Feldolgozás", color: "bg-blue-50 text-blue-700 border-blue-100" },
  shipped: { label: "Feladva", color: "bg-purple-50 text-purple-700 border-purple-100" },
  delivered: { label: "Kézbesítve", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "Törölve", color: "bg-rose-50 text-rose-700 border-rose-100" },
};

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) console.error("Hiba:", error.message);
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Fizetve jelölés funkció (Átutalásos rendelésekhez)
  const markAsPaid = async (orderId: string) => {
    if (!confirm("Biztosan megérkezett az utalás? A rendelés státusza 'Függőben' lesz.")) return;
    
    const { error } = await supabase
      .from("orders")
      .update({ status: "pending" })
      .eq("id", orderId);

    if (error) {
      alert("Hiba történt a frissítéskor: " + error.message);
    } else {
      fetchOrders();
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  return (
    <div className="p-6 md:p-10 bg-[#fbfbfb] min-h-screen text-[#1a1a1a]">
      {/* FEJLÉC */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-sm">
              Dashboard
            </h1>
            <p className="text-gray-400 font-medium mt-2 uppercase text-[10px] tracking-[0.3em]">
              Rendeléskezelés / {orders.length} tétel
            </p>
          </div>
          
          {/* SZŰRŐK */}
          <div className="flex flex-wrap gap-2">
            {["all", "waiting_for_payment", "pending", "shipped", "delivered"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === s 
                    ? "bg-black text-white border-black shadow-lg shadow-black/20" 
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-black"
                }`}
              >
                {s === "all" ? "Összes" : statusMap[s]?.label || s}
              </button>
            ))}
            <button 
              onClick={fetchOrders}
              className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-90"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* TÁBLÁZAT */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[40px] shadow-2xl shadow-gray-200/30 overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                  <th className="p-8">Rendelés</th>
                  <th className="p-8">Ügyfél</th>
                  <th className="p-8">Fizetési mód</th>
                  <th className="p-8 text-center">Összeg</th>
                  <th className="p-8 text-center">Státusz</th>
                  <th className="p-8 text-right">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-32 text-center text-gray-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">
                      Adatok szinkronizálása...
                    </td>
                  </tr>
                ) : orders.map((order) => {
                  const status = statusMap[order.status] || statusMap.pending;
                  
                  return (
                    <tr key={order.id} className="hover:bg-[#fafafa]/50 transition-colors group">
                      <td className="p-8">
                        {/* JAVÍTOTT RÉSZ: String kényszerítés a slice-hoz */}
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px]">
                          #{order.id ? String(order.id).slice(0, 8) : "N/A"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">
                          {order.created_at ? new Date(order.created_at).toLocaleString('hu-HU', {
                            month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : "Ismeretlen dátum"}
                        </p>
                      </td>
                      <td className="p-8">
                        <p className="font-black uppercase tracking-tight text-gray-800">{order.customer_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{order.customer_email}</p>
                      </td>
                      <td className="p-8">
                        <span className="text-[10px] font-black bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg uppercase tracking-tighter border border-gray-100 inline-flex items-center gap-2">
                          {order.payment_method === 'card' && '💳 Kártya'}
                          {order.payment_method === 'cash_on_delivery' && '🚚 Utánvét'}
                          {order.payment_method === 'transfer' && '🏦 Átutalás'}
                        </span>
                      </td>
                      <td className="p-8 text-center font-black text-gray-900">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="p-8 text-center">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Fizetve gomb csak várakozó utalásnál */}
                          {order.status === "waiting_for_payment" && (
                            <button 
                              onClick={() => markAsPaid(order.id)}
                              className="bg-emerald-500 text-white h-10 px-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              Fizetve ✅
                            </button>
                          )}
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center justify-center bg-white border border-gray-200 text-black h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Részletek
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {!loading && orders.length === 0 && (
            <div className="p-32 text-center">
              <p className="text-gray-300 font-black italic uppercase tracking-[0.2em] text-[10px]">
                Nincs megjeleníthető rendelés ebben a kategóriában.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}