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
  loading: () => <div className="flex items-center justify-center h-full italic text-gray-400">3D Modell betöltése...</div>
});

const TEMPLATE_IMAGE = "/images/mockup.jpg"; 
type Ratio = "square" | "portrait" | "landscape" | "panorama"; // Itt is panoramal a név a fájl miatt

const ratios: Record<Ratio, number> = { 
  square: 1/1, 
  portrait: 2/3, 
  landscape: 3/2, 
  panorama: 3/1 
};

const ratioLabels: Record<Ratio, string> = { 
  square: "négyzet", 
  portrait: "álló", 
  landscape: "fekvő", 
  panorama: "panoráma" 
};

const sizes: Record<Ratio, string[]> = {
  square: ["30x30", "40x40", "50x50"],
  portrait: ["30x40", "40x60","50x80"],
  landscape: ["50x30", "70x40", "90x50"],
  panorama: ["90x30", "120x40", "150x50"],
};

function calculatePrice(size: string): number {
  const prices: { [key: string]: number } = {
    // Álló / Fekvő formátumok
    "30x40": 7190,
    "40x60": 9590,
    "50x80": 11990,
    
    // Panoráma formátumok (I. csoport)
    "90x30": 14490,
    "120x40": 20490,
    "150x50": 24990,
    
    // Négyzetes formátumok
    "30x30": 5990,
    "40x40": 7890,
    "50x50": 9590,
    
    // FEKVŐ formátumok (II. csoport)
    "50x30": 9480,
    "70x40": 13890,
    "90x50": 17890
  };

  // Ha megtalálja a méretet, visszaadja az árat, 
  // különben egy alapértelmezett értéket (pl. az eredeti 11990-et)
  return prices[size] || 11990;
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

  useEffect(() => { 
    setMounted(true); 
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(checkIOS);
  }, []);

  const price = useMemo(() => calculatePrice(size), [size]);

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
      
      const originalPath = `${today}/originals/${safeOriginalName}`;
      await supabase.storage.from("custom-canvas").upload(originalPath, originalFile);

      const { data: { publicUrl } } = supabase.storage.from("custom-canvas").getPublicUrl(previewPath);

      setSavedConfig({ 
        ratio, size, price, 
        previewUrl: publicUrl, 
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
        config: { 
          zoom: zoom, 
          crop: finalCrop 
        }
      }
    });
    router.push("/kosar");
  };

  const activeRatio = savedConfig?.ratio || ratio;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" strategy="afterInteractive" />
      <Navbar />
      
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[1.45fr_0.85fr] gap-10">
          
          {/* MOCKUP */}
          <div className="order-2 lg:order-1 relative aspect-[1.1/1] overflow-hidden rounded-[40px] border border-[#d9d5cf] bg-white shadow-2xl">
            <img src={TEMPLATE_IMAGE} alt="Mockup" className="h-full w-full object-cover" />
            
            {savedConfig && (
              <button onClick={() => setIsARModalOpen(true)} className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#d9d5cf] shadow-xl text-black font-black uppercase text-[10px]">
                📦 {isIOS ? "3D Nézet" : "3D / AR Nézet"}
              </button>
            )}
            
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
              <div className={`transition-all duration-700 ${
                activeRatio === "square" ? "aspect-square w-[62%]" : 
                activeRatio === "portrait" ? "aspect-[2/3] w-[42%]" : 
                activeRatio === "landscape" ? "aspect-[3/2] w-[72%]" : "aspect-[3/1] w-[80%]"
              }`}>
                <div className="relative h-full w-full bg-white shadow-[0_35px_80px_rgba(0,0,0,0.45)] overflow-hidden">
                  {savedConfig?.previewUrl && (
                    <img src={savedConfig.previewUrl} alt="Preview" className="h-full w-full object-cover relative z-10" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* VEZÉRLŐK */}
          <div className="order-1 lg:order-2 rounded-[35px] border border-[#d9d5cf] bg-white p-6 md:p-8 shadow-xl">
            <h1 className="text-3xl font-black italic uppercase mb-8">Egyedi Vászonkép</h1>
            
            <div className="space-y-6">
              <div className={savedConfig ? "opacity-40 pointer-events-none" : ""}>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">1. Formátum</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(ratios) as Ratio[]).map(r => (
                    <button key={r} onClick={() => { setRatio(r); setSize(sizes[r][0]); }} className={`py-3 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${ratio === r ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}>{ratioLabels[r]}</button>
                  ))}
                </div>
              </div>

              <div className={savedConfig ? "opacity-40 pointer-events-none" : ""}>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">2. Méret (cm)</p>
                <div className="flex flex-wrap gap-2">
                  {sizes[ratio].map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 border-2 rounded-lg text-xs font-black transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">3. Fotó feltöltése</p>
                {!image ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[25px] cursor-pointer hover:bg-orange-50 transition-all">
                    <span className="text-[10px] font-black uppercase text-orange-600">Kép kiválasztása</span>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border">
                    <span className="text-[10px] font-bold uppercase truncate max-w-[150px]">{fileName}</span>
                    <button onClick={() => {setImage(null); setSavedConfig(null);}} className="text-red-500 text-[10px] font-black">Törlés</button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-dashed flex justify-between items-center">
              <p className="text-3xl font-black italic">{formatPrice(price)}</p>
              <button onClick={handleAddToCart} disabled={!savedConfig} className="bg-[#e3936e] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-20 transition-all">
                Kosárba
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AR MODAL - Itt használjuk a panoramal.glb fájlt */}
      {isARModalOpen && mounted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsARModalOpen(false)} />
          <div className="relative w-full h-full max-w-5xl bg-[#f8f8f6] md:rounded-[40px] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white z-10">
                <h3 className="font-black uppercase italic text-sm text-black">3D Preview</h3>
                <button onClick={() => setIsARModalOpen(false)} className="bg-black text-white w-10 h-10 rounded-xl font-bold">✕</button>
            </div>
            <div className="flex-1 relative bg-[#efebe6]">
              <CustomCanvasViewer 
                modelUrl={`/models/canvas-${activeRatio}.glb`}
                iosModelUrl={isIOS ? "" : `/models/canvas-${activeRatio}.usdz`} 
                textureUrl={savedConfig?.previewUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* CROPPER MODAL - JAVÍTVA LÁTHATÓSÁGRA */}
      {isCropModalOpen && image && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 md:p-4">
          <div className="w-full h-full md:h-auto md:max-w-2xl bg-white md:rounded-[40px] overflow-hidden flex flex-col">
            <div className="relative flex-1 min-h-[400px] bg-black">
              <Cropper 
                image={image} 
                crop={crop} 
                zoom={zoom} 
                aspect={ratios[ratio]} 
                onCropChange={setCrop} 
                onCropComplete={(_, p) => setCroppedAreaPixels(p)} 
                onZoomChange={setZoom} 
                style={{
                  containerStyle: { width: '100%', height: '100%', position: 'absolute' }
                }}
              />
            </div>
            <div className="p-8 bg-white">
              <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs">
                {isSaving ? "Feldolgozás..." : "Kép rögzítése"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}