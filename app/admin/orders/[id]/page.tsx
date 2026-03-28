"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

// Bővített státusz opciók
const statusOptions = [
  { value: "waiting_for_payment", label: "Utalásra vár" },
  { value: "pending", label: "Függőben / Fizetve" },
  { value: "processing", label: "Feldolgozás alatt" },
  { value: "shipped", label: "Feladva / Futárnál" },
  { value: "delivered", label: "Kézbesítve" },
  { value: "cancelled", label: "Törölve" },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      
      const { data: orderData, error: oError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (oError) console.error("Rendelés hiba:", oError.message);

      const { data: itemsData, error: iError } = await supabase
        .from("order_items")
        .select("*") 
        .eq("order_id", id);

      if (iError) console.error("Tételek hiba:", iError.message);

      if (orderData) {
        setOrder(orderData);
        setSelectedStatus(orderData.status);
      }
      
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchOrderDetails();
  }, [id, supabase]);

  const handleStatusSave = async () => {
    setIsSavingStatus(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: selectedStatus })
      .eq("id", id);

    if (!error) {
      setOrder({ ...order, status: selectedStatus });
      alert("Állapot sikeresen frissítve!");
    } else {
      alert("Hiba történt a mentés során: " + error.message);
    }
    setIsSavingStatus(false);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  if (loading) return (
    <div className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-[0.3em]">
      Adatok betöltése...
    </div>
  );
  
  if (!order) return (
    <div className="p-20 text-center text-red-500 font-black uppercase italic">
      Rendelés nem található!
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 bg-[#fbfbfb] min-h-screen text-[#1a1a1a]">
      
      {/* FEJLÉC */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button 
            onClick={() => router.back()} 
            className="group mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Vissza a rendelésekhez
          </button>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            {/* JAVÍTOTT: String konverzió az ID-hoz */}
            Rendelés <span className="text-blue-600">#{String(order.id).slice(0, 8)}</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-widest font-black">
            Beérkezett: {new Date(order.created_at).toLocaleString('hu-HU')}
          </p>
        </div>

        {/* STÁTUSZ KEZELŐ */}
        <div className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest py-3 px-6 outline-none cursor-pointer"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleStatusSave}
            disabled={isSavingStatus || selectedStatus === order.status}
            className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedStatus === order.status 
              ? "bg-gray-50 text-gray-300" 
              : "bg-black text-white hover:bg-emerald-500 hover:shadow-emerald-500/20 active:scale-95 shadow-lg"
            }`}
          >
            {isSavingStatus ? "..." : "Frissítés"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* BAL OSZLOP: ÜGYFÉL INFÓK */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 italic underline decoration-blue-500 decoration-2 underline-offset-4">Számlázási adatok</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Vevő / Cégnév</p>
                <p className="font-black text-gray-900 text-lg uppercase">{order.billing_name}</p>
                {order.billing_tax_number && (
                  <p className="text-xs font-bold text-gray-400 mt-1">Adószám: {order.billing_tax_number}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Elérhetőség</p>
                <p className="font-bold text-gray-800">{order.customer_email}</p>
                <p className="font-bold text-gray-800">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cím</p>
                <p className="font-bold text-gray-800">
                  {order.billing_postcode} {order.billing_city}<br />
                  {order.billing_address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f0f0ee] p-8 rounded-[40px] border border-gray-200 shadow-inner">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 italic">Szállítási cím</h2>
            <div className="space-y-2 font-bold text-gray-700">
              <p className="text-lg font-black text-black uppercase tracking-tight">📦 {order.customer_name}</p>
              <p>{order.shipping_postcode} {order.shipping_city}</p>
              <p>{order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* JOBB OSZLOP: RENDELT TÉTELEK */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex justify-between items-end">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Csomag tartalma</h2>
              <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{items.length} tétel</span>
            </div>
            
            <div className="divide-y divide-gray-50 flex-1">
              {items.map((item) => (
                <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-300 border border-gray-100">
                      🖼️
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">
                        {item.product_name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase italic">
                        Méret: {item.size_name}
                      </p>
                      <p className="text-xs font-bold text-blue-500 mt-2 bg-blue-50 w-fit px-2 py-1 rounded">
                        {item.quantity} db × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-gray-900 tracking-tighter">
                      {formatPrice(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ÖSSZESÍTŐ SÁV - Most már Banki átutalással bővítve */}
            <div className="bg-black p-10 flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Végösszeg</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase bg-gray-800 px-3 py-1 rounded-md text-gray-300">
                    {order.payment_method === 'card' && '💳 Bankkártya'}
                    {order.payment_method === 'cash_on_delivery' && '🚚 Utánvét'}
                    {order.payment_method === 'transfer' && '🏦 Banki átutalás'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black italic tracking-tighter text-[#c79a4a]">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}