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
  const [customImages, setCustomImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      
      // 1. Rendelés és tételek lekérése
      const { data: orderData } = await supabase.from("orders").select("*").eq("id", id).single();
      const { data: itemsData } = await supabase.from("order_items").select("*").eq("order_id", id);
      
      if (orderData) {
        setOrder(orderData);
        setSelectedStatus(orderData.status);

        // 2. Egyedi rendelési adatok (képek) lekérése
        const { data: customData } = await supabase
          .from("custom_orders")
          .select("*")
          .or(`order_id.eq.${id},customer_email.eq.${orderData.customer_email}`);

        // 3. URL generálás a pontos mappaszerkezettel (previews/DÁTUM/fájlnév)
        const imagesWithUrls = (customData || []).map(img => {
          // Csak a fájlnevet tartjuk meg (pl. 69b8e860..._preview.jpg)
          const fileName = (img.preview_url || img.original_image_url).split('/').pop();

          // A képernyőmentésed alapján a mappa neve a rendelés dátuma (ÉÉÉÉ-HH-NN)
          const orderDate = new Date(orderData.created_at).toISOString().split('T')[0];
          
          // A teljes útvonal összeállítása a Storage-hoz
          const storagePath = `previews/${orderDate}/${fileName}`;

          const { data: { publicUrl } } = supabase.storage
            .from('custom-canvas') 
            .getPublicUrl(storagePath);
            
          return { ...img, fullUrl: publicUrl };
        });

        setCustomImages(imagesWithUrls);
      }
      
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchOrderDetails();
  }, [id, supabase]);

  const handleStatusSave = async () => {
    setIsSavingStatus(true);
    await supabase.from("orders").update({ status: selectedStatus }).eq("id", id);
    setOrder({ ...order, status: selectedStatus });
    setIsSavingStatus(false);
    alert("Állapot frissítve!");
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

  if (loading) return <div className="p-10 text-center font-black uppercase animate-pulse text-gray-400">Betöltés...</div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-black uppercase">Rendelés nem található!</div>;

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-20 font-sans">
      
      {/* FEJLÉC */}
      <div className="bg-white border-b px-4 py-6 sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1">
          ← Vissza
        </button>
        <h1 className="text-3xl font-black tracking-tighter italic uppercase leading-none">
          Rendelés <span className="text-blue-600">#{String(order.id).slice(0, 6)}</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        
        {/* ÁLLAPOT MÓDOSÍTÁSA */}
        <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rendelés állapota</p>
          <div className="flex flex-col gap-2">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-14 bg-gray-50 rounded-2xl px-5 text-xs font-black uppercase outline-none appearance-none border-2 border-transparent focus:border-blue-500 transition-all"
            >
              <option value="waiting_for_payment">Utalásra vár</option>
              <option value="pending">Függőben / Fizetve</option>
              <option value="processing">Feldolgozás alatt</option>
              <option value="shipped">Feladva / Futárnál</option>
              <option value="delivered">Kézbesítve</option>
              <option value="cancelled">Törölve</option>
            </select>
            <button 
              onClick={handleStatusSave}
              disabled={isSavingStatus || selectedStatus === order.status}
              className="w-full h-14 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 active:scale-95 transition-all shadow-lg"
            >
              {isSavingStatus ? "Mentés..." : "Állapot mentése"}
            </button>
          </div>
        </div>

        {/* EGYEDI PREVIEW KÉPEK */}
        {customImages.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest ml-4 italic underline decoration-2 underline-offset-4">Gyártási fájlok (Preview)</h2>
            {customImages.map((img, index) => (
              <div key={index} className="bg-white p-6 rounded-[35px] border-2 border-emerald-100 shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100">🖼️</div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-none">{img.product_name || 'Vászonkép'}</p>
                      <p className="text-[10px] font-bold text-emerald-600/50 uppercase mt-1 italic">Méret: {img.size}</p>
                    </div>
                  </div>
                  <a 
                    href={img.fullUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-emerald-500 text-white text-center py-5 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200"
                  >
                    Kép megnyitása (Preview)
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VÁSÁRLÓ ADATAI */}
        <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <section>
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">Vásárló adatai</h2>
            <div className="space-y-1">
              <p className="font-black text-2xl uppercase tracking-tighter leading-none">{order.billing_name}</p>
              <p className="text-sm font-bold text-gray-500">{order.customer_email}</p>
              <p className="text-sm font-bold text-gray-500">{order.customer_phone}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50 text-sm font-bold text-gray-800">
            <div>
              <h3 className="text-[9px] font-black uppercase text-gray-300 mb-2">Számlázási cím</h3>
              <p>{order.billing_postcode} {order.billing_city}, {order.billing_address}</p>
            </div>
            <div>
              <h3 className="text-[9px] font-black uppercase text-gray-300 mb-2">Szállítási cím</h3>
              <p>{order.shipping_postcode} {order.shipping_city}, {order.shipping_address}</p>
            </div>
          </section>
        </div>

        {/* TERMÉKEK */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Kosár tartalma</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight leading-tight">{item.product_name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase italic">{item.size_name}</p>
                <p className="text-[10px] font-black text-blue-500 mt-1">{item.quantity} db × {formatPrice(item.price)}</p>
              </div>
              <p className="font-black text-lg italic tracking-tighter">{formatPrice(item.quantity * item.price)}</p>
            </div>
          ))}
        </div>

        {/* ÖSSZESÍTŐ */}
        <div className="bg-black p-10 rounded-[45px] text-white flex flex-col items-center shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-2">Összesen fizetendő</p>
          <p className="text-5xl font-black italic tracking-tighter text-[#c79a4a]">
            {formatPrice(order.total_amount)}
          </p>
          <span className="text-[9px] font-black uppercase bg-white/10 px-4 py-2 rounded-full tracking-widest mt-4">
            {order.payment_method === 'card' ? '💳 Bankkártya' : order.payment_method === 'transfer' ? '🏦 Átutalás' : '🚚 Utánvét'}
          </span>
        </div>

      </div>
    </div>
  );
}