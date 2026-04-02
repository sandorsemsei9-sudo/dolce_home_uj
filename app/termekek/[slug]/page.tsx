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
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10">
          <div className="relative w-full h-full max-w-5xl bg-[#f8f8f6] rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            
            {/* BEZÁRÁS GOMB */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-[110] bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all font-bold"
            >
              ✕
            </button>

            {/* 3D NÉZET */}
            <div className="w-full h-full">
              <CanvasViewer modelUrl={product.model_url || "/models/canvas_screen.glb"} />
            </div>

            {/* KIS SEGÍTSÉG ALUL */}
            <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Forgatás az ujjaddal • AR a gombbal</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}