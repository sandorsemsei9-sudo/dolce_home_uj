"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { createClient } from "@/lib/supabase/client";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";

const CanvasViewer = dynamic(() => import("../../components/3d/CanvasPoster"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-white">3D betöltése...</div>
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
        console.error(err);
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

  if (loading || !product) return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] italic">Betöltés...</div>;

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
                className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#d9d5cf] shadow-sm hover:scale-105 transition-all"
              >
                <span className="text-xl">📦</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">3D / AR Nézet</span>
              </button>

              <div className="relative w-full h-full">
                <Image src={mainImage || "/placeholder.jpg"} alt={product.name} fill className="object-cover" priority />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setMainImage(product.cover_image)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.cover_image ? 'border-[#e3936e]' : 'border-transparent opacity-60'}`}>
                <Image src={product.cover_image} fill className="object-cover" alt="Fotó 1" />
              </button>
              {product.hover_image && (
                <button onClick={() => setMainImage(product.hover_image)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.hover_image ? 'border-[#e3936e]' : 'border-transparent opacity-60'}`}>
                  <Image src={product.hover_image} fill className="object-cover" alt="Fotó 2" />
                </button>
              )}
            </div>
          </div>

          {/* JOBB OLDAL: INFÓK */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84]">{product.categories?.name}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f1f1f]">{product.name}</h1>
            <div className="mt-6 border-b border-[#d9d5cf] pb-6">
              <span className="text-3xl font-bold">{formatPrice(selectedVariant?.price)}</span>
            </div>
            {/* Méretválasztó és Kosár gomb ugyanaz marad... */}
            <button onClick={handleAddToCart} className={`mt-10 w-full rounded-2xl py-4 text-sm font-bold text-white shadow-lg ${isAdded ? "bg-green-600" : "bg-[#e3936e]"}`}>
              {isAdded ? "✓ KOSÁRBAN" : "KOSÁRBA TESZEM"}
            </button>
            <div className="mt-12 border-t border-[#d9d5cf] pt-8 text-sm leading-relaxed text-[#4c4742]">
              <h4 className="text-[10px] font-black uppercase mb-3 text-[#1f1f1f]">Leírás</h4>
              {product.description}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3D MODAL (TELJES KÉPERNYŐS) --- */}
{/* --- 3D MODAL --- */}
{isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
    {/* Sötétített, homályos háttér */}
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-md"
      onClick={() => setIsModalOpen(false)} 
    />
    
    <div className="relative w-full h-full md:h-[90vh] max-w-6xl bg-[#f8f8f6] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
      
      {/* MODAL FEJLÉC */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[110] pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 shadow-sm pointer-events-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Interaktív nézet</p>
          <h3 className="text-sm font-bold text-black">{product.name}</h3>
        </div>

        <button 
          onClick={() => setIsModalOpen(false)}
          className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl hover:bg-gray-800 active:scale-90 transition-all pointer-events-auto font-bold text-xl"
        >
          ✕
        </button>
      </div>

      {/* A 3D NÉZET */}
      <div className="flex-1 w-full">
        <CanvasViewer modelUrl={product.model_url || "/models/canvas_screen.glb"} />
      </div>

      {/* ALSÓ SZEGÉLY / SEGÍTSÉG */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none">
        <div className="bg-black/5 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 shadow-inner">
           <p className="text-[9px] font-bold uppercase tracking-widest text-black/60">
             Forgatás 1 ujjal • Mozgatás 2 ujjal • Nagyítás csípéssel
           </p>
        </div>
      </div>
    </div>
  </div>
)}

      <Footer />
    </main>
  );
}