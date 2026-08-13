"use client";

import { useMemo, useState, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";
import Script from "next/script";
import dynamic from 'next/dynamic';

const CustomCanvasViewer = dynamic<any>(() => import("../components/3d/CumstomCanvasPoster"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full italic text-[#8a7f76]">3D Modell betöltése...</div>
});

const TEMPLATE_IMAGE = "/images/mockup.webp"; 
type Ratio = "square" | "portrait" | "landscape" | "panorama" | "triptych"; 

const ratios: Record<Ratio, number> = { 
  square: 1/1, 
  portrait: 2/3, 
  landscape: 3/2, 
  panorama: 3/1,
  triptych: 3/2
};

const ratioLabels: Record<Ratio, string> = { 
  square: "Négyzet", 
  portrait: "Álló", 
  landscape: "Fekvő", 
  panorama: "Panoráma",
  triptych: "3 részes"
};

const sizes: Record<Ratio, string[]> = {
  square: ["30x30", "40x40", "50x50"],
  portrait: ["30x40", "40x60", "30x60", "40x80", "50x80", "50x100"],
  landscape: ["50x30", "70x40", "90x50", "60x30", "80x40", "100x50"],
  panorama: ["90x30", "120x40", "150x50"],
  triptych: ["3*30x40", "3*40x60", "3*50x80", "3*30x60", "3*40x80", "3*50x100"],
};

const faqItems = [
  {
    question: "Milyen felbontású képet érdemes feltölteni?",
    answer: "A tökéletes minőség érdekében érdemes legalább 1-2 MB méretű, éles és jó felbontású fotót választani. Rendszerünk figyelmeztet, ha a kép minősége esetleg alacsonyabb a kívánt mérethez."
  },
  {
    question: "Mennyi idő alatt készül el az egyedi vászonkép?",
    answer: "A rendelést követően a gyártás és a kiszállítás általában 3–5 munkanapot vesz igénybe. Saját magyarországi műhelyünkben nagy gondossággal készítjük el minden darabot."
  },
  {
    question: "Milyen anyagokat használtok a készítés során?",
    answer: "380g/m² súlyú, prémium minőségű, finom textúrájú művészvászonra nyomtatunk UV-álló festékekkel, amit kézzel feszítünk rá a masszív, szárított fenyőfa vakrámára."
  },
  {
    question: "Hogyan tudom megnézni a képet a saját falamon?",
    answer: "Mobil eszközön (telefonon vagy tableten) a 3D nézeten belül a kiterjesztett valóság (AR) funkció segítségével közvetlenül a saját szobád falára vetítheted a kiválasztott méretet."
  }
];

function getDimensions(sizeStr: string): [number, number] {
  if (!sizeStr) return [30, 40];
  if (sizeStr.startsWith("3*")) {
    const clean = sizeStr.replace("3*", "");
    const parts = clean.split("x").map((n) => parseInt(n, 10));
    const singleWidth = parts[0] || 30;
    const height = parts[1] || 60;
    return [singleWidth * 3, height];
  }
  const parts = sizeStr.split("x").map((n) => parseInt(n, 10));
  return [parts[0] || 30, parts[1] || 40];
}

function calculatePrice(size: string): number {
  const prices: { [key: string]: number } = {
    "30x30": 5990, "40x40": 7890, "50x50": 9590,
    "30x40": 7490, "40x60": 9490, "50x80": 12490,
    "30x60": 8990, "40x80": 11990, "50x100": 17990,
    "50x30": 9480, "70x40": 11990, "90x50": 16990,
    "60x30": 9990, "80x40": 12490, "100x50": 17990,
    "90x30": 14490, "120x40": 20490, "150x50": 24990,
    "3*30x40": 17990,
    "3*40x60": 23990,
    "3*50x80": 29990,
    "3*30x60": 22490,
    "3*40x80": 29990,
    "3*50x100": 42990
  };
  return prices[size] || 22990;
}

function formatPrice(price: number) { return new Intl.NumberFormat("hu-HU").format(price) + " Ft"; }

export default function EgyediVaszonkepPage() {
  const supabase = createClient();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [mounted, setMounted] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const [image, setImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [ratio, setRatio] = useState<Ratio>("portrait");
  const [size, setSize] = useState("30x40");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => { 
    setMounted(true); 
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(checkIOS);
  }, []);

  const price = useMemo(() => calculatePrice(size), [size]);
  const [sizeWidth, sizeHeight] = useMemo(() => getDimensions(size), [size]);

  const currentCropAspect = useMemo(() => {
    return sizeWidth / sizeHeight;
  }, [sizeWidth, sizeHeight]);

  const previewWidthPercent = useMemo(() => {
    return sizeWidth * 0.8;
  }, [sizeWidth]);

  // Változás kezelése ha a felhasználó megváltoztatja a formátumot
  const handleRatioChange = (newRatio: Ratio) => {
    setRatio(newRatio);
    const defaultSize = sizes[newRatio][0];
    setSize(defaultSize);
    setSavedConfig(null);
    if (image) {
      setIsCropModalOpen(true);
    }
  };

  // Változás kezelése ha a felhasználó megváltoztatja a méretet
  const handleSizeChange = (newSize: string) => {
    setSize(newSize);
    setSavedConfig(null);
    if (image) {
      setIsCropModalOpen(true);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (image) URL.revokeObjectURL(image);
    setOriginalFile(file);
    setImage(URL.createObjectURL(file));
    setFileName(file.name);
    setIsCropModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!image || !croppedAreaPixels || !originalFile) return;
    try {
      setIsSaving(true);
      const uniqueId = uuidv4();
      const today = new Date().toISOString().split('T')[0];
      const fileExtension = originalFile.name.split('.').pop();
      const safeOriginalName = `${uniqueId}-original.${fileExtension}`;
      
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = image;
      img.crossOrigin = "anonymous";
      await new Promise(r => img.onload = r);
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      
      const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), "image/jpeg", 0.95));
      
      const previewPath = `${today}/previews/${uniqueId}.jpg`;
      await supabase.storage.from("custom-canvas").upload(previewPath, blob);
      const { data: { publicUrl } } = supabase.storage.from("custom-canvas").getPublicUrl(previewPath);

      let triptychUrls: string[] = [];
      if (ratio === "triptych") {
        const panelWidth = Math.floor(croppedAreaPixels.width / 3);
        const panelHeight = croppedAreaPixels.height;

        for (let i = 0; i < 3; i++) {
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = panelWidth;
          sliceCanvas.height = panelHeight;
          const sliceCtx = sliceCanvas.getContext("2d");

          sliceCtx?.drawImage(
            canvas,
            i * panelWidth, 0, panelWidth, panelHeight,
            0, 0, panelWidth, panelHeight
          );

          const sliceBlob = await new Promise<Blob>(r => sliceCanvas.toBlob(b => r(b!), "image/jpeg", 0.95));
          const slicePath = `${today}/previews/${uniqueId}-part${i + 1}.jpg`;
          await supabase.storage.from("custom-canvas").upload(slicePath, sliceBlob);

          const { data: { publicUrl: sliceUrl } } = supabase.storage.from("custom-canvas").getPublicUrl(slicePath);
          triptychUrls.push(sliceUrl);
        }
      }
      
      const originalPath = `${today}/originals/${safeOriginalName}`;
      await supabase.storage.from("custom-canvas").upload(originalPath, originalFile);

      setSavedConfig({ 
        ratio, size, price, 
        previewUrl: publicUrl, 
        triptychUrls: triptychUrls,
        originalPath: originalPath 
      });
      setIsCropModalOpen(false);
    } catch (err) { 
      alert("Hiba történt a mentéskor.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleAddToCart = () => {
    if (!savedConfig) return;
    const finalCrop = croppedAreaPixels || { x: 0, y: 0, width: 0, height: 0 };

    addItem({
      id: uuidv4(),
      name: `Egyedi Vászonkép (${ratioLabels[savedConfig.ratio as Ratio]})`,
      size: savedConfig.size,
      price: savedConfig.price,
      image: savedConfig.previewUrl,
      quantity: 1,
      isCustom: true,
      customData: {
        original_image_url: savedConfig.originalPath,
        ratio: savedConfig.ratio,
        config: { zoom: zoom, crop: finalCrop }
      }
    });
    router.push("/kosar");
  };

  const activeRatio = savedConfig?.ratio || ratio;

  return (
    <main className="min-h-screen bg-[#f8f3ef] text-[#2a211d]">
      <style jsx global>{`
        .glass-3d-button {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px 0 rgba(42, 33, 29, 0.08);
        }
      `}</style>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" strategy="afterInteractive" />
      <Navbar />
      
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[1.45fr_0.85fr] gap-10 items-start">
          
          {/* MOCKUP SZEKCIÓ */}
          <div className="flex flex-col gap-6 order-2 lg:order-1 w-full">
            <div className="group relative aspect-[1.1/1] overflow-hidden rounded-[40px] border border-[#dccfc5] bg-white shadow-xl">
              <img 
                src={TEMPLATE_IMAGE} 
                alt="Egyedi vászonkép tervező előnézet nappali környezetben" 
                className="h-full w-full object-cover" 
              />
              
              {savedConfig && (
                <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex flex-col items-end gap-2">
                  <button 
                    onClick={() => setIsARModalOpen(true)} 
                    className="flex flex-col items-center gap-2 outline-none group/btn"
                    aria-label="3D és AR nézet megnyitása"
                  >
                    <div className="glass-3d-button relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover/btn:scale-105 active:scale-95">
                      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100">
                        <path d="M25 35 C 35 20, 65 20, 75 35 M 75 35 L 75 22 M 75 35 L 62 35" stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M75 65 C 65 80, 35 80, 25 65 M 25 65 L 25 78 M 25 65 L 38 65" stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-base font-black tracking-tighter text-[#2a211d]">3D</span>
                    </div>
                  </button>
                  
                  <div className="text-right pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a211d] leading-tight">
                      Kattints a 3D nézethez!
                    </p>
                    <p className="hidden md:block text-[8px] font-medium text-[#7a675d] uppercase mt-0.5">
                      Mobilon helyezd el a faladon (AR)
                    </p>
                  </div>
                </div>
              )}
              
              {/* DINAMIKUS, VALÓS MÉRETARÁNYOS FAL-ELŐNÉZET */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                <div 
                  className="transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    aspectRatio: `${sizeWidth} / ${sizeHeight}`,
                    width: `${previewWidthPercent}%`,
                  }}
                >
                  {activeRatio === "triptych" ? (
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2 h-full w-full">
                      {[0, 1, 2].map((panelIndex) => (
                        <div 
                          key={panelIndex} 
                          className="relative h-full w-full bg-white shadow-[0_15px_35px_rgba(42,33,29,0.35)] overflow-hidden rounded-sm"
                        >
                          {savedConfig?.previewUrl && (
                            <img 
                              src={savedConfig.previewUrl} 
                              alt={`Triptichon panel ${panelIndex + 1}`} 
                              className="h-full max-w-none relative z-10"
                              style={{
                                width: '300%',
                                marginLeft: `-${panelIndex * 100}%`,
                                objectFit: 'cover'
                              }} 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative h-full w-full bg-white shadow-[0_25px_60px_rgba(42,33,29,0.3)] overflow-hidden rounded-sm">
                      {savedConfig?.previewUrl && (
                        <img 
                          src={savedConfig.previewUrl} 
                          alt="Saját fotó előnézete vásznon" 
                          className="h-full w-full object-cover relative z-10" 
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* SEO & TÁJÉKOZTATÓ SÁV */}
            <div className="px-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 p-5 rounded-3xl border border-[#dccfc5]/60">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#d17d58] mb-2">Prémium Minőség</h2>
                <p className="text-xs leading-relaxed text-[#5e4d45]">
                  380g-os finom szövésű művészvászonra nyomtatjuk, melyet kézzel feszítünk tartós, szárított fenyőfa vakrámára.
                </p>
              </div>
              <div className="bg-white/60 p-5 rounded-3xl border border-[#dccfc5]/60">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#d17d58] mb-2">3D Tervezés & AR</h2>
                <p className="text-xs leading-relaxed text-[#5e4d45]">
                  Töltsd fel a fotód, vágd tökéletes méretre, és nézd meg 3D-ben vagy kiterjesztett valóságban (AR) a saját faladon.
                </p>
              </div>
            </div>

            <div className="px-2">
              <p className="text-[10px] leading-relaxed text-[#8a7f76] font-medium italic">
                * A megjelenített kép csak illusztráció. A kész termék színei és arányai minimálisan eltérhetnek a kijelzőn látottaktól a monitor egyedi beállításai és a gyártási folyamat sajátosságai miatt.
              </p>
            </div>
          </div>

          {/* VEZÉRLŐK */}
          <div className="order-1 lg:order-2 rounded-[35px] border border-[#dccfc5] bg-white p-6 md:p-8 shadow-xl w-full">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#2a211d] mb-8 leading-tight">
              Készíts egyedi vászonképet <span className="text-[#d17d58] italic font-normal">saját fotódból</span>
            </h1>
            
            <div className="space-y-7">
              {/* 1. FORMÁTUM (Mindig aktív) */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#7a675d] mb-3">1. Formátum kiválasztása</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ratios) as Ratio[]).map(r => (
                    <button 
                      key={r} 
                      onClick={() => handleRatioChange(r)} 
                      className={`py-3 px-2 border rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                        ratio === r 
                          ? 'border-[#d17d58] bg-[#d17d58] text-white shadow-md' 
                          : 'border-[#dccfc5]/60 bg-[#fdfbf9] text-[#5e4d45] hover:border-[#d17d58]'
                      } ${r === 'triptych' ? 'col-span-2' : ''}`}
                    >
                      {ratioLabels[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. MÉRET (Mindig aktív) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#7a675d]">2. Méret kiválasztása</h3>
                  {ratio === 'triptych' && (
                    <span className="text-[10px] text-[#d17d58] font-bold uppercase">3 db azonos elem</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sizes[ratio].map(s => (
                    <button 
                      key={s} 
                      onClick={() => handleSizeChange(s)} 
                      className={`py-2.5 px-2 border rounded-xl text-xs font-bold transition-all ${
                        size === s 
                          ? 'border-[#d17d58] bg-[#d17d58] text-white shadow-md' 
                          : 'border-[#dccfc5]/60 bg-[#fdfbf9] text-[#5e4d45] hover:border-[#d17d58]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. FOTÓ FELTÖLTÉSE ÉS MODOSÍTÁSA */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#7a675d] mb-3">3. Saját fotó feltöltése</h3>
                {!image ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#dccfc5] rounded-[24px] cursor-pointer bg-[#fdfbf9] hover:bg-[#faedec]/30 hover:border-[#d17d58] transition-all group">
                    <span className="text-xl mb-1">📷</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d17d58] group-hover:scale-105 transition-transform">Kép kiválasztása a gépedről</span>
                    <span className="text-[10px] text-[#7a675d] mt-1">JPG, PNG (max. jó minőség)</span>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-[#fdfbf9] rounded-2xl border border-[#dccfc5]">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm">🖼️</span>
                      <span className="text-xs font-semibold uppercase truncate text-[#2a211d] max-w-[120px] sm:max-w-[180px]">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setIsCropModalOpen(true)} 
                        className="text-[#d17d58] hover:text-[#b06a4a] text-xs font-bold tracking-wide uppercase px-2 py-1 transition-colors"
                      >
                        Vágás
                      </button>
                      <button 
                        onClick={() => {setImage(null); setSavedConfig(null);}} 
                        className="text-red-500 hover:text-red-700 text-xs font-bold tracking-wide uppercase px-2 py-1"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ÁR ÉS KOSÁRBA GOMB */}
            <div className="mt-10 pt-6 border-t border-[#dccfc5]/60 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a675d]">Várható ár</p>
                <p className="text-2xl md:text-3xl font-extrabold text-[#2a211d]">{formatPrice(price)}</p>
              </div>
              <button 
                onClick={handleAddToCart} 
                disabled={!savedConfig} 
                className="bg-[#d17d58] text-white px-6 md:px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all hover:bg-[#b06a4a] active:scale-95"
              >
                Kosárba teszem
              </button>
            </div>

            {/* BIZALMI ELEMEK */}
            <div className="mt-6 rounded-2xl border border-[#dccfc5]/60 bg-[#fdfbf9] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-xs">🚀</div>
                <div>
                  <p className="text-xs font-bold text-[#2a211d]">Gyors szállítás</p>
                  <p className="text-[11px] text-[#7a675d]">3–5 munkanapon belül</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-xs">💎</div>
                <div>
                  <p className="text-xs font-bold text-[#2a211d]">Prémium minőség</p>
                  <p className="text-[11px] text-[#7a675d]">380 g-os művészvászon</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-xs">🛡️</div>
                <div>
                  <p className="text-xs font-bold text-[#2a211d]">100% elégedettség</p>
                  <p className="text-[11px] text-[#7a675d]">Minőségi garancia</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-xs">🇭🇺</div>
                <div>
                  <p className="text-xs font-bold text-[#2a211d]">Hazai termék</p>
                  <p className="text-[11px] text-[#7a675d]">Saját magyar gyártás</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* GYAKRAN ISMÉTELT KÉRDÉSEK SZEKCIÓ */}
        <div className="mt-20 pt-12 border-t border-[#dccfc5]/60 max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#2a211d] mb-8 text-center md:text-left tracking-tight">
            Gyakran ismételt kérdések
          </h3>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-[#dccfc5] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-[#2a211d] hover:text-[#d17d58] transition-colors"
                  >
                    <span>{item.question}</span>
                    <span className={`transform transition-transform duration-300 text-xl font-normal text-[#d17d58] ${isOpen ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-[#7a665c] leading-relaxed border-t border-[#f8f3ef] pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* AR/3D MODAL */}
      {isARModalOpen && mounted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsARModalOpen(false)} />
          <div className="relative w-full h-[85vh] max-w-5xl bg-[#f8f3ef] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#dccfc5] flex justify-between items-center bg-white z-10">
                <h3 className="font-bold text-sm text-[#2a211d] uppercase tracking-wide">3D Modell Előnézet</h3>
                <button onClick={() => setIsARModalOpen(false)} className="bg-[#2a211d] text-white w-9 h-9 rounded-xl font-bold transition-transform active:scale-90">✕</button>
            </div>
            <div className="flex-1 relative bg-[#efebe6]">
              <CustomCanvasViewer 
                modelUrl={activeRatio === "triptych" ? "/models/canvas-three-piece.glb" : `/models/canvas-${activeRatio}.glb`}
                iosModelUrl={isIOS ? "" : (activeRatio === "triptych" ? "/models/canvas-three-piece.usdz" : `/models/canvas-${activeRatio}.usdz`)} 
                textureUrl={savedConfig?.previewUrl}
                triptychTextures={savedConfig?.triptychUrls}
              />
            </div>
          </div>
        </div>
      )}

      {/* CROPPER MODAL */}
      {isCropModalOpen && image && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 md:p-4">
          <div className="w-full h-full md:h-auto md:max-w-2xl bg-white md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
            <div className="relative flex-1 min-h-[400px] bg-black">
              <Cropper 
                image={image} 
                crop={crop} 
                zoom={zoom} 
                aspect={currentCropAspect} 
                onCropChange={setCrop} 
                onCropComplete={(_, p) => setCroppedAreaPixels(p)} 
                onZoomChange={setZoom} 
                style={{ containerStyle: { width: '100%', height: '100%', position: 'absolute' } }}
              />
            </div>
            <div className="p-6 bg-white border-t border-gray-100">
              <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-[#d17d58] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-wider transition-all hover:bg-[#b06a4a] active:scale-95 disabled:opacity-50 shadow-md">
                {isSaving ? "Feldolgozás..." : "Kép rögzítése és mentése"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}