"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { createClient } from "@/lib/supabase/client";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";

const CanvasViewer = dynamic<any>(() => import("../../components/3d/CanvasPoster"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-[#1f1f1f]">3D betöltése...</div>
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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(checkIOS);

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

  // --- DINAMIKUS MODELL VÁLASZTÁS ---
  const iosUsdzPath = `/models/${product.slug}.usdz`;
  
  // Meghatározzuk a modellt a termék tájolása alapján
  const getModelPath = () => {
    switch (product.orientation) {
      case 'portrait':
        return "/models/canvas-portrait.glb";
      case 'square':
        return "/models/canvas-square.glb";
      case 'landscape':
      default:
        return "/models/canvas-landscape.glb";
    }
  };

  const masterGlbPath = getModelPath();

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="lg:flex lg:items-start lg:gap-12">
          {/* BAL OLDAL - KÉPEK */}
          <div className="lg:w-1/2 space-y-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-[40px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#d9d5cf] shadow-sm hover:scale-105 transition-all"
              >
                <span className="text-xl">📦</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black">3D / AR Nézet</span>
              </button>
              <div className="relative w-full h-full">
                <Image src={mainImage || "/placeholder.jpg"} alt={product.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
            {/* Galéria thumb-ok */}
            <div className="flex justify-center gap-4">
              <button onClick={() => setMainImage(product.cover_image)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.cover_image ? 'border-[#e3936e]' : 'border-transparent opacity-60'}`}>
                <Image src={product.cover_image} fill className="object-cover" alt="F1" sizes="80px" />
              </button>
              {product.hover_image && (
                <button onClick={() => setMainImage(product.hover_image)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === product.hover_image ? 'border-[#e3936e]' : 'border-transparent opacity-60'}`}>
                  <Image src={product.hover_image} fill className="object-cover" alt="F2" sizes="80px" />
                </button>
              )}
            </div>
          </div>

          {/* JOBB OLDAL - INFÓK */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84]">{product.categories?.name}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f1f1f] tracking-tight">{product.name}</h1>
            <div className="mt-6 border-b border-[#d9d5cf] pb-6">
              <span className="text-3xl font-bold">{formatPrice(selectedVariant?.price)}</span>
            </div>
            
            {variants.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase mb-3 text-[#9a8f84]">Méretek</p>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${selectedVariant?.id === v.id ? 'border-black bg-white shadow-md text-black' : 'border-gray-100 text-gray-400'}`}>
                      {v.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAddToCart} className="mt-8 w-full rounded-2xl py-4 text-sm font-bold text-white shadow-lg bg-[#e3936e] active:scale-95 transition-all">
              {isAdded ? "✓ KOSÁRBAN" : "KOSÁRBA TESZEM"}
            </button>
          </div>
        </div>
      </div>

      {/* 3D MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full h-full md:h-[85vh] max-w-5xl bg-[#f8f8f6] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white z-[110]">
              <div>
                <h3 className="text-sm font-bold text-black">{product.name}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{product.orientation} nézet — 3D Előnézet</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-black text-white w-10 h-10 rounded-xl font-bold flex items-center justify-center">✕</button>
            </div>
            <div className="flex-1 w-full relative">
              <CanvasViewer 
                modelUrl={masterGlbPath} 
                iosModelUrl={isIOS ? iosUsdzPath : ""} 
                // A textúrához most már a speciális 3D alapképet használjuk, 
                // de ha az üres, akkor a biztonság kedvéért a cover_image-et
                textureUrl={product.texture_image || product.cover_image}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}