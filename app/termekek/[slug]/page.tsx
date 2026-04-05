"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { createClient } from "@/lib/supabase/client";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";

// Dinamikus importálás a 3D nézegetőhöz, hogy ne lassítsa az oldal betöltését
const CanvasViewer = dynamic(() => import("../../components/3d/CanvasPoster"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full bg-[#f8f8f6]">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-400">
        3D Modell betöltése...
      </div>
    </div>
  )
});

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
  const [isAdded, setIsAdded] = useState(false);
  
  // MODAL ÁLLAPOT
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function getFullProductData() {
      setLoading(true);
      try {
        const { data: pData } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("slug", slug)
          .single();

        if (pData) {
          setProduct(pData);
          setMainImage(pData.cover_image);
          
          const { data: vData } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", pData.id)
            .order("price", { ascending: true });

          if (vData) {
            setVariants(vData);
            setSelectedVariant(vData[0]);
          }
        }
      } catch (err) {
        console.error("Hiba az adatok lekérésekor:", err);
      } finally {
        setLoading(false);
      }
    }
    getFullProductData();
  }, [slug, supabase]);

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

  if (loading || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] italic text-gray-400">
        Adatlap betöltése...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="lg:flex lg:items-start lg:gap-12">
          
          {/* BAL OLDAL: GALÉRIA */}
          <div className="lg:w-1/2 space-y-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-[40px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4">
              
              {/* 3D GOMB - EZ NYITJA A MODALT */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#d9d5cf] shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <span className="text-xl">📦</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1f1f]">3D / AR Nézet</span>
              </button>

              <div className="relative w-full h-full">
                <Image 
                  src={mainImage || "/placeholder.jpg"} 
                  alt={product.name} 
                  fill 
                  className="object-cover rounded-[25px]" 
                  priority 
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setMainImage(product.cover_image)} 
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.cover_image ? 'border-[#e3936e] scale-105' : 'border-transparent opacity-60'}`}
              >
                <Image src={product.cover_image} fill className="object-cover" alt="Fotó 1" />
              </button>
              {product.hover_image && (
                <button 
                  onClick={() => setMainImage(product.hover_image)} 
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.hover_image ? 'border-[#e3936e] scale-105' : 'border-transparent opacity-60'}`}
                >
                  <Image src={product.hover_image} fill className="object-cover" alt="Fotó 2" />
                </button>
              )}
            </div>
          </div>

          {/* JOBB OLDAL: INFÓK */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84] italic">
              {product.categories?.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f1f1f] leading-tight">
              {product.name}
            </h1>
            
            <div className="mt-6 border-b border-[#d9d5cf] pb-6">
              <span className="text-3xl font-bold text-[#1f1f1f]">
                {formatPrice(selectedVariant?.price)}
              </span>
            </div>

            {/* Méretválasztó */}
            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Válassz méretet</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedVariant?.id === v.id 
                      ? "border-[#2a211d] bg-[#2a211d] text-white shadow-md" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {v.size_name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAddToCart} 
              className={`mt-10 w-full rounded-2xl py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
                isAdded ? "bg-green-600" : "bg-[#e3936e] hover:bg-[#d17d58]"
              }`}
            >
              {isAdded ? "✓ KOSÁRBAN" : "KOSÁRBA TESZEM"}
            </button>

            <div className="mt-12 border-t border-[#d9d5cf] pt-8 text-sm leading-relaxed text-[#4c4742]">
              <h4 className="text-[10px] font-black uppercase mb-3 text-[#1f1f1f] tracking-widest">Leírás</h4>
              <p className="opacity-80">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3D MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full h-full md:h-[85vh] max-w-5xl bg-[#f8f8f6] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
            
            {/* FEJLÉC */}
            <div className="relative p-5 border-b border-gray-200 flex justify-between items-center bg-white z-[110]">
              <div>
                <h3 className="text-sm font-bold text-black uppercase">{product.name}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter italic">3D Előnézet & AR</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            {/* A 3D NÉZET TARTALMA */}
            <div className="flex-1 w-full relative">
              <CanvasViewer modelUrl={product.model_url || "/models/canvas-12.glb"} />
            </div>

            {/* ALSÓ SEGÍTSÉG */}
            <div className="bg-white p-4 border-t border-gray-100 flex justify-center items-center gap-6">
              <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-[0.2em]">
                Forgatás egy ujjal • Mozgatás két ujjal
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}