"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";
import Script from "next/script";

const TEMPLATE_IMAGE = "/images/mockup.jpg"; 
type Ratio = "square" | "portrait" | "landscape";

const ratios: Record<Ratio, number> = { square: 1/1, portrait: 2/3, landscape: 3/2 };
const ratioLabels: Record<Ratio, string> = { square: "négyzet", portrait: "álló", landscape: "fekvő" };

const sizes: Record<Ratio, string[]> = {
  square: ["20x20", "30x30", "40x40", "50x50", "60x60", "80x80", "100x100"],
  portrait: ["30x40", "40x50", "40x60", "60x90", "80x100"],
  landscape: ["40x30", "50x40", "60x40", "90x60", "100x80"],
};

function calculatePrice(size: string) {
  if (size === "100x100" || size === "80x100") return 23490;
  if (size === "80x80" || size === "60x90" || size === "100x80") return 19990;
  if (size === "60x60" || size === "50x50" || size === "40x60") return 15990;
  if (size === "40x40" || size === "40x50" || size === "60x40") return 13990;
  return 11990;
}

function formatPrice(price: number) { return new Intl.NumberFormat("hu-HU").format(price) + " Ft"; }

export default function EgyediVaszonkepPage() {
  const supabase = createClient();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const modelRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [ratio, setRatio] = useState<Ratio>("square");
  const [size, setSize] = useState("50x50");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const price = useMemo(() => calculatePrice(size), [size]);

  // --- 3D TEXTÚRA FRISSÍTÉS (Nálad működő logika) ---
  useEffect(() => {
    const applyTexture = async () => {
      if (savedConfig?.previewUrl && modelRef.current && isARModalOpen) {
        const mv = modelRef.current;
        if (!mv.model || !mv.model.materials) {
            setTimeout(applyTexture, 300);
            return;
        }
        try {
            const material = mv.model.materials[0]; 
            const texture = await mv.createTexture(savedConfig.previewUrl);
            if (material.pbrMetallicRoughness.baseColorTexture) {
                material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
                console.log("3D Siker!");
            }
        } catch (err) { console.error("3D Error:", err); }
      }
    };
    applyTexture();
  }, [savedConfig?.previewUrl, isARModalOpen, ratio]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setFileName(file.name);
    setIsCropModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      setIsSaving(true);
      const uniqueId = uuidv4();
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
      const path = `previews/${uniqueId}.jpg`;
      await supabase.storage.from("custom-canvas").upload(path, blob);
      const { data: { publicUrl } } = supabase.storage.from("custom-canvas").getPublicUrl(path);

      setSavedConfig({ ratio, size, price, previewUrl: publicUrl, storagePath: path });
      setIsCropModalOpen(false);
    } catch (err) { console.error(err); } 
    finally { setIsSaving(false); }
  };

  const handleAddToCart = () => {
    if (!savedConfig) return;
    addItem({
      id: uuidv4(),
      name: `Egyedi Vászonkép (${ratioLabels[savedConfig.ratio]})`,
      size: savedConfig.size,
      price: savedConfig.price,
      image: savedConfig.previewUrl,
      quantity: 1,
      isCustom: true,
      customData: { storagePath: savedConfig.storagePath }
    });
    router.push("/kosar");
  };

  const activeRatio = savedConfig?.ratio || ratio;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" strategy="afterInteractive" />
      <Navbar />
      
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr]">
          
          <div className="relative aspect-[1.1/1] overflow-hidden rounded-[40px] border border-[#d9d5cf] bg-white shadow-2xl">
            <img src={TEMPLATE_IMAGE} alt="Mockup" className="h-full w-full object-cover" />
            {savedConfig && (
              <button onClick={() => setIsARModalOpen(true)} className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#d9d5cf] shadow-xl font-black uppercase text-[10px] hover:scale-105 transition-all">
                📦 3D / AR Nézet
              </button>
            )}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
              <div className={`transition-all duration-700 ${activeRatio === "square" ? "aspect-square w-[62%]" : activeRatio === "portrait" ? "aspect-[2/3] w-[42%]" : "aspect-[3/2] w-[72%]"}`}>
                <div className="relative h-full w-full bg-white shadow-2xl rounded-sm border-[4px] border-white overflow-hidden">
                  {savedConfig?.previewUrl && <img src={savedConfig.previewUrl} alt="Vágott" className="h-full w-full object-cover" />}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[35px] border border-[#d9d5cf] bg-white p-8 shadow-xl">
            <h1 className="text-3xl font-black italic uppercase mb-8 tracking-tighter">Egyedi Vászonkép</h1>
            
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">1. Válasz formátumot</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(ratios) as Ratio[]).map(r => (
                    <button key={r} onClick={() => { setRatio(r); setSize(sizes[r][0]); setSavedConfig(null); }} className={`py-3 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${ratio === r ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}>{ratioLabels[r]}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">2. Válasz méretet (cm)</p>
                <div className="flex flex-wrap gap-2">
                  {sizes[ratio].map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 border-2 rounded-lg text-xs font-black transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">3. Töltsd fel a fotód</p>
                {!image ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[25px] cursor-pointer hover:bg-orange-50 transition-all">
                    <span className="text-[10px] font-black uppercase text-orange-600">Fénykép kiválasztása</span>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-[10px] font-bold uppercase truncate max-w-[150px]">{fileName}</span>
                    <button onClick={() => {setImage(null); setSavedConfig(null);}} className="text-red-500 text-[10px] font-black">Törlés</button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-dashed flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-300 mb-1">Ár</p>
                <p className="text-3xl font-black italic">{formatPrice(price)}</p>
              </div>
              <button onClick={handleAddToCart} disabled={!savedConfig} className="bg-[#e3936e] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-20 hover:scale-105 active:scale-95 transition-all">Kosárba</button>
            </div>
          </div>
        </div>
      </section>

      {/* 3D MODAL */}
      {isARModalOpen && mounted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsARModalOpen(false)} />
          <div className="relative w-full h-full max-w-5xl bg-[#f8f8f6] md:rounded-[40px] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white z-10">
               <h3 className="font-black uppercase italic text-sm">3D Preview & AR</h3>
               <button onClick={() => setIsARModalOpen(false)} className="bg-black text-white w-10 h-10 rounded-xl font-bold">✕</button>
            </div>
            <div className="flex-1 relative bg-[#efebe6]">
              {/* @ts-ignore */}
              <model-viewer
                ref={modelRef}
                src={`/models/canvas-${activeRatio}.glb`}
                ios-src={`/models/canvas-${activeRatio}.usdz`}
                alt="3D Vászonkép"
                auto-rotate camera-controls ar
                ar-modes="webxr scene-viewer quick-look"
                shadow-intensity="1" exposure="1"
                style={{ width: '100%', height: '100%', outline: 'none' }}
              >
                {/* @ts-ignore */}
                <button slot="ar-button" className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-2xl border border-gray-100 text-black">
                  📱 Megtekintés a szobámban
                </button>
              </model-viewer>
            </div>
          </div>
        </div>
      )}

      {/* CROP MODAL */}
      {isCropModalOpen && image && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4">
          <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
               <h3 className="font-black uppercase italic text-sm text-black">Kép vágása</h3>
               <button onClick={() => setIsCropModalOpen(false)} className="text-gray-300">✕</button>
            </div>
            <div className="relative h-[400px] bg-black">
              <Cropper image={image} crop={crop} zoom={zoom} aspect={ratios[ratio]} onCropChange={setCrop} onCropComplete={(_, p) => setCroppedAreaPixels(p)} onZoomChange={setZoom} />
            </div>
            <div className="p-8">
              <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                {isSaving ? "Mentés..." : "Kép rögzítése"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}