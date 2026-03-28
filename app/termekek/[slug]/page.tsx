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
  const [isChanging, setIsChanging] = useState(false); // Képváltás animációhoz

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

  // Finom képváltás logika
  const handleImageChange = (newImage: string) => {
    if (newImage === mainImage) return;
    setIsChanging(true);
    setTimeout(() => {
      setMainImage(newImage);
      setIsChanging(false);
    }, 250); // Félút az áttűnésnél váltunk képet
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
      
      <div className="mx-auto max-w-6xl px-6 py-8 lg:flex lg:items-center lg:gap-12">
        
        {/* BAL OLDAL: GALÉRIA - Kisebb méret, fekvőbarát elrendezés */}
        <div className="lg:w-1/2 space-y-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4">
            <div className={`relative w-full h-full transition-all duration-500 ease-in-out ${isChanging ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
              <Image 
                src={mainImage || "/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className="object-contain" // Ez biztosítja, hogy a fekvő/álló kép is kiférjen vágás nélkül
                priority
              />
            </div>
          </div>

          {/* Thumbnail választó */}
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

          {/* INFORMÁCIÓK */}
          <div className="mt-10 space-y-4 border-t border-[#d9d5cf] pt-6">
             <p className="text-sm text-[#4c4742] leading-relaxed">
                {product.description || "Prémium minőségű vászonkép, kézzel feszített vakrámára."}
             </p>
             
             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <div className="text-[10px] uppercase font-bold text-[#1f1f1f]">2-4 nap szállítás</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div className="text-[10px] uppercase font-bold text-[#1f1f1f]">Prémium vászon</div>
                </div>
             </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}