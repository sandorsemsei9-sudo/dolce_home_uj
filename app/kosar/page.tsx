"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCartStore } from "../store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function KosarPage() {
  const supabase = createClient();
  const [isHydrated, setIsHydrated] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { items, removeItem, updateQuantity, getTotalPrice, appliedCoupon, setCoupon } = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsLoading(true);
    setCouponError("");

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .ilike("code", couponInput.trim()) // .ilike = kis/nagybetű nem számít
        .eq("is_used", false)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setCouponError("Érvénytelen, lejárt vagy már felhasznált kód.");
        setCoupon(null);
      } else {
        // Megnézzük melyik oszlopban van az érték (percent vagy value)
        const discount = data.discount_percent || data.discount_value || 0;
        
        setCoupon({
          code: data.code, // Az adatbázis szerinti pontos kódot mentjük el
          discountValue: discount
        });
        setCouponInput("");
      }
    } catch (err) {
      setCouponError("Hiba a kupon ellenőrzésekor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountValue) / 100 : 0;
  const finalTotal = subtotal - discountAmount;

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-10">Kosár</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border">
            <p className="text-gray-500">Üres a kosarad.</p>
            <Link href="/termekek" className="mt-4 inline-block text-[#e3936e] font-bold underline">Irány a webshop</Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4 bg-white rounded-2xl border items-center">
                  <img src={item.image} className="h-20 w-20 object-cover rounded-lg" alt="" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.size} cm</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-2 border rounded">-</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2 border rounded">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.id, item.size)} className="text-xs text-red-500 underline">Törlés</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-3xl border h-fit space-y-4 shadow-sm">
              <h2 className="text-xl font-bold">Összesítés</h2>
              <div className="flex justify-between text-sm">
                <span>Részösszeg:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="py-4 border-t border-b border-dashed">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Kuponkód" 
                      className="border rounded-lg px-3 py-2 text-sm flex-1 outline-none"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button onClick={handleApplyCoupon} className="bg-[#3a4358] text-white px-4 py-2 rounded-lg text-sm font-bold">
                      {isLoading ? "..." : "OK"}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-green-600 font-bold tracking-wider">Aktív kupon</span>
                      <span className="text-sm font-bold text-green-800">{appliedCoupon.code} (-{appliedCoupon.discountValue}%)</span>
                    </div>
                    <button onClick={() => setCoupon(null)} className="text-[10px] text-red-500 font-bold hover:underline uppercase">Törlés</button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
              </div>

              <div className="flex justify-between text-xl font-black border-t pt-4">
                <span>Végösszeg:</span>
                <span className="text-[#c79a4a]">{formatPrice(finalTotal)}</span>
              </div>

              <Link href="/penztar" className="block w-full bg-[#e3936e] text-white text-center py-4 rounded-full font-bold">
                Pénztárhoz lépek
              </Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}