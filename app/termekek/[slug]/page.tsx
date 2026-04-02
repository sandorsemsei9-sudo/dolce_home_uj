"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";

function formatPrice(price: any) {
  const num = Number(price);
  if (isNaN(num) || num <= 0) return "Ár hamarosan";
  return new Intl.NumberFormat("hu-HU").format(num) + ",- Ft";
}

export default function TermekAdatlap({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const supabase = createClient();
  
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");
  const [isChanging, setIsChanging] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function getFullProductData() {
      setLoading(true);
      try {
        const { data: pData, error: pError } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("slug", slug)
          .single();

        if (pError) throw pError;

        if (pData) {
          setProduct(pData);
          setMainImage(pData.cover_image);
          
          const { data: vData, error: vError } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", pData.id)
            .order("price", { ascending: true });

          if (vError) throw vError;

          if (vData && vData.length > 0) {
            setVariants(vData);
            setSelectedVariant(vData[0]);
          }
        }
      } catch (err) {
        console.error("Hiba az adatok betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    }
    getFullProductData();
  }, [slug, supabase]);

  const handleImageChange = (newImage: string) => {
    if (newImage === mainImage) return;
    setIsChanging(true);
    setTimeout(() => {
      setMainImage(newImage);
      setIsChanging(false);
    }, 250);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      id: `${product.id}-${selectedVariant.id}`, 
      name: product.name,
      size: selectedVariant.size_name,
      price: selectedVariant.price,
      image: product.cover_image,
      quantity: 1,
      isCustom: false
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-[#9a8f84] animate-pulse font-medium italic">Termék betöltése...</div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 py-8 lg:flex lg:items-start lg:gap-12">
        
        {/* BAL OLDAL: GALÉRIA */}
        <div className="lg:w-1/2 space-y-6 lg:sticky lg:top-24">
          <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4">
            <div className={`relative w-full h-full transition-all duration-500 ease-in-out ${isChanging ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
              <Image 
                src={mainImage || "/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button 
              onClick={() => handleImageChange(product.cover_image)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${mainImage === product.cover_image ? 'border-[#e3936e] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image src={product.cover_image} fill className="object-cover" alt="Nézet 1" />
            </button>

            {product.hover_image && (
              <button 
                onClick={() => handleImageChange(product.hover_image)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${mainImage === product.hover_image ? 'border-[#e3936e] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <Image src={product.hover_image} fill className="object-cover" alt="Nézet 2" />
              </button>
            )}
          </div>
        </div>

        {/* JOBB OLDAL: TERMÉKINFÓ */}
        <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84]">
            {product.categories?.name || "Kategória"}
          </p>
          
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-[#1f1f1f]">
            {product.name}
          </h1>
          
          <div className="mt-6 border-b border-[#d9d5cf] pb-6">
            <span className="text-3xl font-bold text-[#1f1f1f]">
              {formatPrice(selectedVariant?.price)}
            </span>
            <p className="mt-1 text-[11px] text-[#7a746d]">ÁFA-val együtt • Ingyenes házhozszállítás</p>
          </div>

          {/* MÉRET VÁLASZTÓ */}
          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4c4742]">
              Választható méret (cm)
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex h-12 min-w-[90px] items-center justify-center rounded-xl border-2 px-3 text-xs font-bold transition-all ${
                    selectedVariant?.id === v.id 
                      ? "border-black bg-black text-white" 
                      : "border-[#d9d5cf] bg-white text-[#1f1f1f] hover:border-black"
                  }`}
                >
                  {v.size_name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={!selectedVariant || isAdded}
            className={`mt-8 w-full rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg ${
              isAdded ? "bg-green-600" : "bg-[#e3936e] hover:bg-[#d07f5b]"
            }`}
          >
            {isAdded ? "✓ KOSÁRBA KERÜLT" : `KOSÁRBA TESZEM`}
          </button>

          {/* INFORMÁCIÓS SZEKCIÓ */}
          <div className="mt-10 space-y-8 border-t border-[#d9d5cf] pt-8">
            
            {/* Leírás */}
            <div className="prose prose-sm text-[#4c4742]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1f1f1f] mb-3">Termékleírás</h4>
              <p className="leading-relaxed text-sm">
                {product.description || "Prémium minőségű vászonkép, kézzel feszített vakrámára. Minden darab egyedileg készül, hogy tökéletes dísze legyen otthonodnak."}
              </p>
            </div>

            {/* Szállítás & Biztonság Grid */}
            <div className="grid grid-cols-1 gap-y-6 border-y border-[#d9d5cf] py-8">
              
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-[#d9d5cf] text-lg">
                  🚚
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wide text-[#1f1f1f]">Gyors Házhozszállítás</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#7a746d]">
                    Rendelésed <strong>2-4 munkanapon</strong> belül házhoz szállítjuk. A feladásról e-mailben értesítünk.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-[#d9d5cf] text-lg">
                  🔒
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wide text-[#1f1f1f]">Biztonságos Fizetés</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#7a746d]">
                    Fizess biztonságosan <strong>bankkártyával</strong> vagy válassz <strong>utánvétet</strong> a futárnál.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-[#d9d5cf] text-lg">
                  📦
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wide text-[#1f1f1f]">Gondos Csomagolás</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#7a746d]">
                    Minden képet többrétegű védőfóliába és erős kartondobozba zárunk a sérülésmentes érkezés érdekében.
                  </p>
                </div>
              </div>

            </div>

            {/* Garancia doboz */}
            <div className="rounded-2xl bg-white p-5 border border-[#d9d5cf] shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-green-600 text-lg">✨</span>
                <span className="text-xs font-bold text-[#1f1f1f] uppercase tracking-wider">Pénzvisszafizetési garancia</span>
              </div>
              <p className="text-[11px] text-[#7a746d] leading-relaxed">
                Ha nem vagy 100%-ig elégedett, 14 napon belül visszaküldheted a terméket, és mi kérdés nélkül visszafizetjük az árát.
              </p>
            </div>
          </div>
        </div>

      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}