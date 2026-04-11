"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    is_used: false,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  }

  // Segédfüggvény a dátum szép megjelenítéséhez
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  async function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCoupon.code) return;

    const { error } = await supabase.from("coupons").insert([newCoupon]);

    if (error) {
      alert("Hiba: Lehet, hogy ez a kód már létezik!");
    } else {
      setNewCoupon({ 
        code: "", 
        discount_type: "percentage", 
        discount_value: 0, 
        min_order_amount: 0, 
        is_used: false 
      });
      fetchCoupons();
    }
  }

  async function deleteCoupon(id: number) {
    if (!confirm("Biztosan törlöd ezt a kupont?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 italic">Kupon <span className="text-orange-500">Kezelő</span></h1>
      </div>

      {/* ÚJ KUPON LÉTREHOZÁSA */}
      <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 uppercase text-[11px] tracking-widest text-gray-400">Új kupon hozzáadása</h2>
        <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Kuponkód</label>
            <input
              type="text"
              placeholder="pl. NYAR20"
              className="w-full p-3 border rounded-xl outline-none focus:border-orange-400 text-black font-bold"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Típus</label>
            <select
              className="w-full p-3 border rounded-xl outline-none text-black font-medium"
              value={newCoupon.discount_type}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
            >
              <option value="percentage">Százalék (%)</option>
              <option value="fixed">Fix összeg (Ft)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Kedvezmény</label>
            <input
              type="number"
              className="w-full p-3 border rounded-xl outline-none text-black font-bold"
              value={newCoupon.discount_value}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white p-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-lg active:scale-95"
          >
            Létrehozás
          </button>
        </form>
      </div>

      {/* KUPONOK LISTÁJA */}
      <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden text-black">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Létrehozva</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Kód</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Kedvezmény</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Állapot</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest">Betöltés...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Nincsenek aktív kuponok.</td></tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-[10px] font-medium text-gray-400 whitespace-nowrap">
                    {formatDate(coupon.created_at)}
                  </td>
                  <td className="p-4 font-mono font-black text-orange-600">{coupon.code}</td>
                  <td className="p-4 font-bold">
                    {coupon.discount_type === "percentage" 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.discount_value.toLocaleString()} Ft`}
                  </td>
                  <td className="p-4">
                    {coupon.is_used ? (
                      <span className="px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-full uppercase border border-red-100">Felhasználva</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full uppercase border border-green-100">Érvényes</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}