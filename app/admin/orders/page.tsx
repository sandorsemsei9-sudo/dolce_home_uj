"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const markAsPaid = async (orderId: string) => {
    if (!confirm("Biztosan megérkezett az utalás?")) return;
    const { error } = await supabase.from("orders").update({ status: "pending" }).eq("id", orderId);
    if (!error) fetchOrders();
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('hu-HU', { 
      year: 'numeric',
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-4 md:p-10 bg-[#fbfbfb] min-h-screen text-[#1a1a1a]">
      
      <div className="max-w-7xl mx-auto mb-6 md:mb-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Dashboard</h1>
            <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-[0.3em]">
              Rendeléskezelés / {orders.length} tétel
            </p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {["all", "waiting_for_payment", "pending", "shipped", "delivered"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  filter === s 
                    ? "bg-black text-white border-black shadow-lg" 
                    : "bg-white text-gray-400 border-gray-100"
                }`}
              >
                {s === "all" ? "Összes" : statusMap[s]?.label || s}
              </button>
            ))}
            <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-100 rounded-xl shrink-0">🔄</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="p-20 text-center font-black uppercase text-[10px] tracking-widest animate-pulse text-gray-300">Szinkronizálás...</div>
        ) : (
          <>
            {/* MOBIL NÉZET */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {orders.map((order) => {
                const status = statusMap[order.status] || statusMap.pending;
                return (
                  <div key={order.id} className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                          #{String(order.id).slice(0, 8)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tight">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div>
                      <p className="font-black uppercase tracking-tight text-gray-800 text-sm leading-none">{order.customer_name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{order.customer_email}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <p className="font-black text-gray-900">{formatPrice(order.total_amount)}</p>
                      <div className="flex gap-2">
                        {order.status === "waiting_for_payment" && (
                          <button onClick={() => markAsPaid(order.id)} className="bg-emerald-500 text-white h-9 px-4 rounded-full text-[9px] font-black uppercase">Fizetve ✅</button>
                        )}
                        <Link href={`/admin/orders/${order.id}`} className="bg-black text-white h-9 px-5 rounded-full text-[9px] font-black uppercase flex items-center">Részletek</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

{/* ASZTALI NÉZET: TÁBLÁZAT */}
<div className="hidden md:block bg-white border border-gray-100 rounded-[30px] shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50/50 border-b border-gray-50 text-[9px] uppercase tracking-widest text-gray-400 font-black">
          <th className="px-4 py-4">Rendelés</th>
          <th className="px-4 py-4">Dátum</th>
          <th className="px-4 py-4">Ügyfél</th>
          <th className="px-4 py-4">Mód</th>
          <th className="px-4 py-4 text-center">Összeg</th>
          <th className="px-4 py-4 text-center">Státusz</th>
          <th className="px-4 py-4 text-right">Művelet</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {orders.map((order) => {
          const status = statusMap[order.status] || statusMap.pending;
          return (
            <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
              {/* ID */}
              <td className="px-4 py-4">
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                  #{String(order.id).slice(0, 8)}
                </span>
              </td>
              
              {/* DÁTUM */}
              <td className="px-4 py-4 whitespace-nowrap">
                <p className="text-[10px] font-bold text-gray-500">
                  {formatDate(order.created_at)}
                </p>
              </td>
              
              {/* ÜGYFÉL */}
              <td className="px-4 py-4">
                <p className="font-extrabold uppercase text-[12px] text-gray-900 leading-none">
                  {order.customer_name}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">{order.customer_email}</p>
              </td>
              
              {/* MÓD */}
              <td className="px-4 py-4">
                <span className="text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">
                  {order.payment_method === 'card' ? '💳 CARD' : '🏦 BANK'}
                </span>
              </td>
              
              {/* ÖSSZEG */}
              <td className="px-4 py-4 text-center font-black text-gray-900 text-sm whitespace-nowrap">
                {formatPrice(order.total_amount)}
              </td>
              
              {/* STÁTUSZ */}
              <td className="px-4 py-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase border whitespace-nowrap ${status.color}`}>
                  {status.label}
                </span>
              </td>
              
              {/* MŰVELET - Itt a lényeg! */}
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end items-center gap-2">
                  {order.status === "waiting_for_payment" && (
                    <button 
                      onClick={() => markAsPaid(order.id)} 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm active:scale-95"
                    >
                      Fizetve
                    </button>
                  )}
                  <Link 
                    href={`/admin/orders/${order.id}`} 
                    className="bg-black text-white h-8 px-4 rounded-lg text-[9px] font-black uppercase flex items-center hover:opacity-80 transition-all shadow-sm active:scale-95"
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
</div>
          </>
        )}
      </div>
    </div>
  );
}