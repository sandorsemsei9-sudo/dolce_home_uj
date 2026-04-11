"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [customFiles, setCustomFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      
      try {
        // 1. Rendelés alapadatok lekérése
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();

        // 2. Kosár tartalmának lekérése
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", id);

        if (orderData) {
          setOrder(orderData);
          setSelectedStatus(orderData.status);

          // 3. Egyedi gyártási fájlok lekérése a custom_orders táblából
          const { data: customData } = await supabase
            .from("custom_orders")
            .select("*")
            .eq("order_id", id);

          // Dátum formázása a Storage mappához (ÉÉÉÉ-HH-NN)
          const orderDate = new Date(orderData.created_at).toISOString().split('T')[0];
          
          const filesWithUrls = (customData || []).map(file => {
            // Fájlnév kinyerése az adatbázisból
            const previewFileName = file.preview_url?.split('/').pop();
            const originalFileName = file.original_image_url?.split('/').pop();

            // URL generálása a Storage struktúra alapján (Dátum/previews/fájlnév)
            const { data: pUrl } = supabase.storage
              .from('custom-canvas')
              .getPublicUrl(`${orderDate}/previews/${previewFileName}`);

            const { data: oUrl } = supabase.storage
              .from('custom-canvas')
              .getPublicUrl(`${orderDate}/originals/${originalFileName}`);

            return {
              ...file,
              fullPreviewUrl: pUrl.publicUrl,
              fullOriginalUrl: oUrl.publicUrl,
              debugPath: `${orderDate}/previews/${previewFileName}`
            };
          });

          setCustomFiles(filesWithUrls);
        }
        
        setItems(itemsData || []);
      } catch (error) {
        console.error("Hiba:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOrderDetails();
  }, [id, supabase]);

  const handleStatusSave = async () => {
    setIsSavingStatus(true);
    const { error } = await supabase.from("orders").update({ status: selectedStatus }).eq("id", id);
    if (!error) {
      setOrder({ ...order, status: selectedStatus });
      alert("Állapot frissítve!");
    }
    setIsSavingStatus(false);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  if (loading) return <div className="p-10 text-center font-black uppercase text-gray-400 animate-pulse">Betöltés...</div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-black uppercase">Rendelés nem található!</div>;

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-20 font-sans text-gray-900">
      
      {/* FEJLÉC */}
      <div className="bg-white border-b px-6 py-8 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="text-[10px] font-black uppercase text-gray-400 mb-4 block hover:text-black transition-colors">
          ← Vissza a listához
        </button>
        <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter">
          Rendelés <span className="text-blue-600">#{String(order.id).slice(0, 6)}</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8 mt-4">
        
        {/* STÁTUSZ KEZELŐ */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-4">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rendelés állapota</p>
          <div className="flex flex-col md:flex-row gap-3">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 h-14 bg-gray-50 rounded-2xl px-5 text-[11px] font-black uppercase outline-none border-2 border-transparent focus:border-blue-500 transition-all"
            >
              <option value="waiting_for_payment">Utalásra vár</option>
              <option value="pending">Fizetve / Függőben</option>
              <option value="processing">Gyártás alatt</option>
              <option value="shipped">Kiszállítás alatt</option>
              <option value="delivered">Kézbesítve</option>
              <option value="cancelled">Törölve</option>
            </select>
            <button 
              onClick={handleStatusSave}
              disabled={isSavingStatus || selectedStatus === order.status}
              className="h-14 px-10 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 shadow-lg"
            >
              {isSavingStatus ? "Mentés..." : "Státusz mentése"}
            </button>
          </div>
        </div>

        {/* EGYEDI GYÁRTÁSI FÁJLOK (A CUSTOM_ORDERS TÁBLÁBÓL) */}
        {customFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest ml-4 italic underline decoration-2 underline-offset-4">Gyártási fájlok</h2>
            <div className="grid grid-cols-1 gap-4">
              {customFiles.map((file, idx) => (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-[40px] border-2 border-emerald-50 shadow-xl flex flex-col md:flex-row gap-8 items-center">
                  {/* Kép előnézet */}
                  <div className="w-full md:w-56 aspect-square bg-gray-50 rounded-[30px] overflow-hidden border border-gray-100 shadow-inner">
                    <img 
                      src={file.fullPreviewUrl} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400?text=Kép+nem+található")}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full text-center md:text-left">
                    <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight mb-1">{file.product_name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Méret: {file.size} | Arány: {file.ratio}</p>
                      <p className="text-[8px] text-red-300 font-mono mt-2 opacity-50">Path: {file.debugPath}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a href={file.fullPreviewUrl} target="_blank" rel="noreferrer" className="h-12 bg-gray-100 text-black flex items-center justify-center rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">
                        👁️ Előnézet
                      </a>
                      <a href={file.fullOriginalUrl} target="_blank" download className="h-12 bg-blue-600 text-white flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        📥 Eredeti letöltése
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VEVŐ ADATAI */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">Ügyfél adatai</h2>
            <div className="space-y-1">
              <p className="font-black text-3xl uppercase tracking-tighter leading-none">{order.billing_name}</p>
              <p className="text-sm font-bold text-gray-400">{order.customer_email} • {order.customer_phone}</p>
            </div>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-300 mb-2">Számlázási cím</p>
              <p className="text-sm font-bold text-gray-700">{order.billing_postcode} {order.billing_city}, {order.billing_address}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-300 mb-2">Szállítási cím</p>
              <p className="text-sm font-bold text-gray-700">{order.shipping_postcode} {order.shipping_city}, {order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* TERMÉKEK (KOSÁR) */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Kosár tartalma</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[30px] border border-gray-100 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight leading-none mb-1">{item.product_name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase italic">{item.size_name}</p>
                <p className="text-[10px] font-black text-blue-500 mt-2 bg-blue-50 w-fit px-2 py-0.5 rounded">{item.quantity} db × {formatPrice(item.price)}</p>
              </div>
              <p className="font-black text-xl italic tracking-tighter">{formatPrice(item.quantity * item.price)}</p>
            </div>
          ))}
        </div>

        {/* ÖSSZESÍTŐ */}
        <div className="bg-black p-12 rounded-[55px] text-white flex flex-col items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-2">Fizetendő összesen</p>
          <p className="text-6xl font-black italic tracking-tighter text-[#c79a4a]">
            {formatPrice(order.total_amount)}
          </p>
          <div className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest">
              {order.payment_method === 'card' ? '💳 Bankkártya' : order.payment_method === 'transfer' ? '🏦 Átutalás' : '🚚 Utánvét'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}