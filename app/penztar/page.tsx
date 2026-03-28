"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCartStore } from "../store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PenztarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { items, getTotalPrice, appliedCoupon, setCoupon, clearCart } = useCartStore();

  const [differentShipping, setDifferentShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", tax_number: "",
    zip: "", city: "", address: "",
    ship_zip: "", ship_city: "", ship_address: "",
    note: ""
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !isSuccess) {
      router.push("/");
    }
  }, [isHydrated, items, router, isSuccess]);

  if (!isHydrated) return null;

  const subtotal = getTotalPrice();
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountValue) / 100 : 0;
  const finalTotal = subtotal - discountAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) return;
    
    setIsSubmitting(true);

    try {
      const finalShippingZip = differentShipping ? formData.ship_zip : formData.zip;
      const finalShippingCity = differentShipping ? formData.ship_city : formData.city;
      const finalShippingAddr = differentShipping ? formData.ship_address : formData.address;

      // 1. Rendelés mentése a Supabase-be
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          billing_name: formData.name,
          billing_postcode: formData.zip,
          billing_city: formData.city,
          billing_address: formData.address,
          billing_tax_number: formData.tax_number || null,
          shipping_postcode: finalShippingZip,
          shipping_city: finalShippingCity,
          shipping_address: finalShippingAddr,
          total_amount: Math.round(finalTotal),
          payment_method: paymentMethod,
          // Státusz: átutalásnál 'waiting_for_payment', kártyánál/utánvétnél 'pending'
          status: paymentMethod === "transfer" ? "waiting_for_payment" : "pending",
          note: formData.note
        }])
        .select().single();

      if (orderError) throw orderError;

      // 2. Tételek mentése
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        size_name: item.size,
        price: Math.round(item.price),
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Fizetési irányítás
      if (paymentMethod === "card") {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: items, orderId: orderData.id }),
        });

        const session = await response.json();
        if (session.url) {
            window.location.href = session.url;
            return;
        }
      } else {
        // ÁTUTALÁS ÉS UTÁNVÉT IS IDE FUT BE
        setIsSuccess(true); 
        clearCart();
        setCoupon(null);
        window.location.href = "/penztar/siker";
      }

    } catch (err: any) {
      console.error("Pénztár hiba:", err);
      alert("Hiba történt a rendelés során.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#1f1f1f]">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-24">
        <form onSubmit={handleSubmit} className="grid gap-16 lg:grid-cols-5">
          
          <div className="lg:col-span-3 space-y-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Pénztár</h1>
            
            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e3936e] border-b pb-2">Számlázási adatok</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required name="name" placeholder="Név / Cégnév *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
                <input name="tax_number" placeholder="Adószám (opcionális)" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required name="email" type="email" placeholder="E-mail cím *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
                <input required name="phone" placeholder="Telefonszám *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input required name="zip" placeholder="Irsz. *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
                <input required name="city" placeholder="Város *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium sm:col-span-2 focus:border-[#e3936e] transition-colors" />
              </div>
              <input required name="address" placeholder="Utca, házszám *" onChange={handleChange} className="w-full h-14 bg-white border rounded-2xl px-5 outline-none font-medium focus:border-[#e3936e] transition-colors" />
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e3936e] border-b pb-2">Fizetési mód</h2>
              <div className="grid gap-4">
                
                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-[#e3936e] bg-orange-50/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} className="w-5 h-5 accent-[#e3936e]" />
                    <span className="font-black text-xs uppercase tracking-widest">Utánvétel</span>
                  </div>
                  <span className="text-2xl">🚚</span>
                </label>

                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'transfer' ? 'border-[#e3936e] bg-orange-50/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="w-5 h-5 accent-[#e3936e]" />
                    <span className="font-black text-xs uppercase tracking-widest">Banki átutalás</span>
                  </div>
                  <span className="text-2xl">🏦</span>
                </label>

                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-[#e3936e] bg-orange-50/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 accent-[#e3936e]" />
                    <span className="font-black text-xs uppercase tracking-widest">Bankkártya</span>
                  </div>
                  <span className="text-2xl">💳</span>
                </label>
              </div>
            </div>

            <div className="space-y-6">
                <div className="p-2 bg-white rounded-[30px] border border-gray-100 shadow-sm">
                  <label className="flex items-start gap-4 p-5 cursor-pointer">
                    <input required type="checkbox" className="mt-1 w-6 h-6 accent-[#e3936e] rounded-lg" checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-tight">
                      Elolvastam és elfogadom az ÁSZF-et és az Adatkezelési tájékoztatót. *
                    </span>
                  </label>
                </div>
                <button type="submit" disabled={isSubmitting || !acceptTerms} className="w-full bg-[#1a1a1a] text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] hover:bg-[#e3936e] transition-all disabled:opacity-20 shadow-2xl">
                  {isSubmitting ? "Feldolgozás..." : "Rendelés Véglegesítése"}
                </button>
            </div>
          </div>

          <div className="lg:col-span-2">
              <div className="bg-white p-10 rounded-[50px] border border-gray-50 h-fit sticky top-10 shadow-xl shadow-orange-100/10 space-y-8">
                <h2 className="text-xl font-black uppercase italic">Kosár tartalma</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm font-bold uppercase tracking-tight">
                      <span className="text-gray-500">{item.quantity}x <span className="text-[#1f1f1f]">{item.name}</span></span>
                      <span>{new Intl.NumberFormat("hu-HU").format(item.price * item.quantity)} Ft</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-dashed">
                  <div className="flex justify-between text-2xl font-black italic">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 self-center">Végösszeg</span>
                    <span>{new Intl.NumberFormat("hu-HU").format(finalTotal)} Ft</span>
                  </div>
                </div>
              </div>
          </div>
        </form>
      </section>
      <Footer />
    </main>
  );
}