"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { createClient } from "@/lib/supabase/client";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";

// Dinamikus importálás a 3D nézegetőhöz
const CanvasViewer = dynamic(() => import("../../components/3d/CanvasPoster"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full bg-[#efebe6] text-[#1f1f1f]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e3936e] mb-4"></div>
      <p className="text-xs font-bold uppercase tracking-widest">3D Modell betöltése...</p>
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function getFullProductData() {
      setLoading(true);
      try {
        const { data: pData } = await supabase.from("products").select("*, categories(name)").eq("slug", slug).single();
        if (pData) {
          setProduct(pData);
          setMainImage(pData.cover_image);
          const { data: vData } = await supabase.from("product_variants").select("*").eq("product_id", pData.id).order("price", { ascending: true });
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
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] italic font-medium text-gray-400">Adatlap betöltése...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="lg:flex lg:items-start lg:gap-12">
          
          {/* BAL OLDAL: GALÉRIA */}
          <div className="lg:w-1/2 space-y-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-[40px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4">
              
              {/* 3D / AR GOMB */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#d9d5cf] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span className="text-xl">📦</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1f1f]">3D / AR Nézet</span>
              </button>

              <div className="relative w-full h-full">
                <Image 
                  src={mainImage || "/placeholder.jpg"} 
                  alt={product.name} 
                  fill 
                  className="object-cover rounded-[20px]" 
                  priority 
                />
              </div>
            </div>

            {/* Galéria index képek */}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setMainImage(product.cover_image)} 
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.cover_image ? 'border-[#e3936e] scale-105' : 'border-transparent opacity-60'}`}
              >
                <Image src={product.cover_image} fill className="object-cover" alt="Borítókép" />
              </button>
              {product.hover_image && (
                <button 
                  onClick={() => setMainImage(product.hover_image)} 
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.hover_image ? 'border-[#e3936e] scale-105' : 'border-transparent opacity-60'}`}
                >
                  <Image src={product.hover_image} fill className="object-cover" alt="Másodlagos kép" />
                </button>
              )}
            </div>
          </div>

          {/* JOBB OLDAL: INFÓK */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84] italic">
              {product.categories?.name}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#1f1f1f] leading-tight">
              {product.name}
            </h1>
            
            <div className="mt-6 border-b border-[#d9d5cf] pb-6 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1f1f1f]">
                {formatPrice(selectedVariant?.price)}
              </span>
            </div>

            {/* Variáció választó (Méret) */}
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
              className={`mt-10 w-full rounded-[20px] py-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 ${
                isAdded ? "bg-green-600" : "bg-[#e3936e] hover:bg-[#d17d58]"
              }`}
            >
              {isAdded ? "✓ KOSÁRBAN VAN" : "KOSÁRBA TESZEM"}
            </button>

            <div className="mt-12 border-t border-[#d9d5cf] pt-8">
              <h4 className="text-[10px] font-black uppercase mb-4 text-[#1f1f1f] tracking-widest">Termékleírás</h4>
              <p className="text-sm leading-relaxed text-[#4c4742] opacity-80">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3D / AR MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full h-full md:h-[90vh] max-w-5xl bg-[#f8f8f6] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
            
            {/* MODAL FEJLÉC */}
            <div className="relative p-6 border-b border-gray-100 flex justify-between items-center bg-white z-[110]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#efebe6] rounded-xl flex items-center justify-center text-xl">🖼️</div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight">{product.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">3D & AR Mód aktív</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-[#f2f0ed] hover:bg-black hover:text-white text-black w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 font-bold"
              >
                ✕
              </button>
            </div>

            {/* 3D TARTALOM (iPhone optimalizált USDZ támogatással) */}
            <div className="flex-1 w-full relative bg-[#efebe6]">
              <CanvasViewer 
                modelUrl={product.model_url || "/models/canvas-12.glb"} 
              />
            </div>

            {/* ALSÓ INSTRUKCIÓK */}
            <div className="bg-white p-5 border-t border-gray-100">
              <div className="flex justify-center gap-8 items-center opacity-40">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs">☝️</span>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-center">Forgatás<br/>1 ujj</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs">✌️</span>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-center">Mozgatás<br/>2 ujj</p>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#e3936e]">
                  <span className="text-xs">📱</span>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-center">AR Mód<br/>iPhone oké</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}