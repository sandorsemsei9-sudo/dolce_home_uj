"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
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

function getOriginalPrice(currentPrice: number): number | null {
  switch (currentPrice) {
    case 4990: return 5990;
    case 5990: return 7490;
    case 6990: return 7990;
    case 7490: return 8990;
    case 7890: return 9990;
    case 7990: return 8990;
    case 8990: return 9990;
    case 9990: return 11990;
    case 11490: return 13990;
    case 11990: return 14990;
    case 12990: return 14990;
    case 14990: return 16990;
    case 16990: return 19990;
    case 21990: return 24990;
    case 26990: return 29990;
    default: return null;
  }
}

interface TermekAdatlapClientProps {
  initialProduct: any;
  initialVariants: any[];
}

export default function TermekAdatlapClient({ initialProduct, initialVariants }: TermekAdatlapClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [product] = useState<any>(initialProduct);
  const [variants] = useState<any[]>(initialVariants);
  const [selectedVariant, setSelectedVariant] = useState<any>(initialVariants[0] || null);
  const [mainImage, setMainImage] = useState<string>(initialProduct.cover_image);
  
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(checkIOS);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    setRotation({ x: (y - centerY) / 6, y: (centerX - x) / 6 });
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

  if (!product) return null;

  // iOS-re a terméknév alapján generált USDZ útvonal
  const iosUsdzPath = `/models/${product.slug}.usdz`;
  
  const getModelPath = () => {
    switch (product.orientation) {
      case 'three-piece': return "/models/canvas-three-piece.glb";
      case 'portrait': return "/models/canvas-portrait.glb";
      case 'square': return "/models/canvas-square.glb";
      case 'panorama': return "/models/canvas-panorama.glb";
      case 'landscape':
      default: return "/models/canvas-landscape.glb";
    }
  };

  const masterGlbPath = getModelPath();
  const originalPrice = selectedVariant ? getOriginalPrice(selectedVariant.price) : null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />

      <style jsx global>{`
        .glass-btn-3d {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 75px;
          height: 75px;
          border-radius: 22px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .glass-btn-3d:hover {
          background: rgba(255, 255, 255, 0.55);
          transform: scale(1.05) !important;
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="lg:flex lg:items-start lg:gap-12">
          
          {/* BAL OLDAL - KÉPEK ÉS FIGYELMEZTETÉS */}
          <div className="lg:w-1/2 flex flex-col gap-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-[40px] bg-white shadow-sm border border-[#d9d5cf] flex items-center justify-center p-4 group">
              
              {/* INTERAKTÍV 3D GOMB + SEGÉDSZÖVEG */}
              <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3" style={{ perspective: '1000px' }}>
                <div
                  onClick={() => setIsModalOpen(true)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                  className="glass-btn-3d"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div style={{ transform: 'translateZ(20px)' }}>
                    <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
                      <path d="M25 35 C 35 20, 65 20, 75 35" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" />
                      <path d="M75 35 L 75 22 M 75 35 L 62 35" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M75 65 C 65 80, 35 80, 25 65" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" />
                      <path d="M25 65 L 25 78 M 25 65 L 38 65" stroke="#2a211d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="50" y="58" fontFamily="Arial" fontSize="24" fontWeight="900" fill="#2a211d" textAnchor="middle">3D</text>
                    </svg>
                  </div>
                </div>

                <div className="text-right pointer-events-none drop-shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-black leading-tight">
                    3D Előnézet
                  </p>
                </div>
              </div>

              <div className="relative w-full h-full">
                <Image src={mainImage || "/placeholder.jpg"} alt={product.name} fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>

            {/* MINIATŰRÖK */}
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

            {/* JOGI FIGYELMEZTETÉS */}
            <div className="px-4 mt-2">
              <p className="text-[10px] leading-relaxed text-[#8a7f76] font-medium italic opacity-70">
                * A megjelenített kép csak illusztráció. A kész termék színei és arányai minimálisan eltérhetnek a kijelzőn látottaktól a monitor egyedi beállításai és a gyártási folyamat sajátosságai miatt.
              </p>
            </div>
          </div>

          {/* JOBB OLDAL - INFÓK */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 max-w-md mx-auto lg:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a8f84]">{product.categories?.name}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f1f1f] tracking-tight">{product.name}</h1>
            
            <div className="mt-6 border-b border-[#d9d5cf] pb-6 flex flex-col">
              {originalPrice && (
                <span className="text-sm font-bold text-[#e3936e] line-through mb-1">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-3xl font-bold">{formatPrice(selectedVariant?.price)}</span>
            </div>

            {/* USP MEZŐK */}
            <div className="mt-6 grid grid-cols-2 gap-4 py-4 border-b border-[#d9d5cf]">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm text-xs">🚀</span>
                <div>
                  <p className="text-[10px] font-bold uppercase leading-none">Gyors szállítás</p>
                  <p className="text-[10px] text-gray-400 mt-1">2-4 munkanap</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm text-xs">💎</span>
                <div>
                  <p className="text-[10px] font-bold uppercase leading-none">Prémium minőség</p>
                  <p className="text-[10px] text-gray-400 mt-1">Vászon & Fakeret</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm text-xs">🛡️</span>
                <div>
                  <p className="text-[10px] font-bold uppercase leading-none">Garancia</p>
                  <p className="text-[10px] text-gray-400 mt-1">100% elégedettség</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm text-xs">🇭🇺</span>
                <div>
                  <p className="text-[10px] font-bold uppercase leading-none">Hazai termék</p>
                  <p className="text-[10px] text-gray-400 mt-1">Saját gyártás</p>
                </div>
              </div>
            </div>
            
            {/* VARIÁNSOK */}
            {variants.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase mb-3 text-[#9a8f84]">Választható méret</p>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <button 
                      key={v.id} 
                      onClick={() => setSelectedVariant(v)} 
                      className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${selectedVariant?.id === v.id ? 'border-black bg-white shadow-md text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                      {v.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAddToCart} className="mt-8 w-full rounded-2xl py-4 text-sm font-bold text-white shadow-lg bg-[#e3936e] active:scale-95 transition-all hover:bg-[#d17d5a]">
              {isAdded ? "✓ KOSÁRBAN" : "KOSÁRBA TESZEM"}
            </button>

            {/* INGYENES SZÁLLÍTÁS KIEMELÉS */}
            <div className="mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-50/60 border border-orange-100 rounded-xl text-center">
              <span className="text-sm">📦</span>
              <p className="text-[11px] font-bold text-[#8a5d43] uppercase tracking-wide">
                Ingyenes szállítás <span className="font-black">25 000 Ft</span> felett!
              </p>
            </div>

            {/* LEÍRÁS ÉS SPECIFIKÁCIÓ */}
            <div className="mt-12 space-y-8">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1f1f1f] mb-4 border-l-2 border-[#e3936e] pl-3">
                  A termékről
                </h3>
                <p className="text-[14px] leading-relaxed text-gray-600 whitespace-pre-line">
                  {product.description && product.description.trim() !== "" 
                    ? product.description 
                    : `Dobja fel otthona hangulatát ezzel a prémium minőségű ${product.name}-el. Minden darabunkat nagy odafigyeléssel, vakráma technológiával készítjük.`
                  }
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-5 border border-[#d9d5cf]">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">
                  Technikai adatok
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-[13px] text-gray-700">
                    <span className="text-[#e3936e] mt-1 text-[10px]">●</span>
                    <span>360g/m² súlyú, művészi texturált vászon alapanyag</span>
                  </li>
                  <li className="flex items-start gap-3 text-[13px] text-gray-700">
                    <span className="text-[#e3936e] mt-1 text-[10px]">●</span>
                    <span>2 cm vastag, szárított fenyőfa vakráma keret</span>
                  </li>
                  <li className="flex items-start gap-3 text-[13px] text-gray-700">
                    <span className="text-[#e3936e] mt-1 text-[10px]">●</span>
                    <span>UV-álló pigment alapú nyomtatás, fakulásmentes színek</span>
                  </li>
                </ul>
              </div>
            </div>

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
                textureUrl={product.texture_image || product.cover_image}
                textureUrl2={product.texture_image_2}
                textureUrl3={product.texture_image_3}
                partsCount={product.parts_count || 1}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}