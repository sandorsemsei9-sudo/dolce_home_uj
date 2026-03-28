"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Új kupon állapota
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
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

  async function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCoupon.code) return;

    const { error } = await supabase.from("coupons").insert([newCoupon]);

    if (error) {
      alert("Hiba: Lehet, hogy ez a kód már létezik!");
    } else {
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0 });
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
        <h1 className="text-3xl font-bold text-gray-900">Kuponok kezelése</h1>
      </div>

      {/* ÚJ KUPON LÉTREHOZÁSA */}
      <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Új kupon hozzáadása</h2>
        <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Kuponkód</label>
            <input
              type="text"
              placeholder="pl. NYAR20"
              className="w-full p-3 border rounded-xl outline-none focus:border-orange-400"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Típus</label>
            <select
              className="w-full p-3 border rounded-xl outline-none"
              value={newCoupon.discount_type}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
            >
              <option value="percentage">Százalék (%)</option>
              <option value="fixed">Fix összeg (Ft)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Érték</label>
            <input
              type="number"
              className="w-full p-3 border rounded-xl outline-none"
              value={newCoupon.discount_value}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Létrehozás
          </button>
        </form>
      </div>

      {/* KUPONOK LISTÁJA */}
      <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Kód</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Kedvezmény</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Min. vásárlás</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Betöltés...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Nincsenek aktív kuponok.</td></tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-orange-600">{coupon.code}</td>
                  <td className="p-4">
                    {coupon.discount_type === "percentage" 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.discount_value.toLocaleString()} Ft`}
                  </td>
                  <td className="p-4 text-gray-500">{coupon.min_order_amount.toLocaleString()} Ft</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Törlés
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