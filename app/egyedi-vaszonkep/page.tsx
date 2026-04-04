"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";

// --- TÍPUSOK ÉS KONFIG ---
type Ratio = "square" | "portrait" | "landscape";

// GLB az Androidnak/Webnek, USDZ az iPhone-nak
const MODEL_URLS: Record<Ratio, string> = {
  square: "/models/square.glb",
  portrait: "/models/portrait.glb",
  landscape: "/models/landscape.glb",
};

const USDZ_URLS: Record<Ratio, string> = {
  square: "/models/square.usdz",
  portrait: "/models/portrait.usdz",
  landscape: "/models/landscape.usdz",
};

const TEMPLATE_IMAGE = "/images/mockup.jpg"; 

const ratios: Record<Ratio, number> = {
  square: 1 / 1,
  portrait: 2 / 3,
  landscape: 3 / 2,
};

const ratioLabels: Record<Ratio, string> = {
  square: "négyzet",
  portrait: "álló",
  landscape: "fekvő",
};

const sizes: Record<Ratio, string[]> = {
  square: ["20x20", "30x30", "40x40", "50x50", "60x60", "80x80", "100x100"],
  portrait: ["30x40", "40x50", "40x60", "60x90", "80x100"],
  landscape: ["40x30", "50x40", "60x40", "90x60", "100x80"],
};

// --- SEGÉDFÜGGVÉNYEK (iPhone-ra optimalizálva) ---
function calculatePrice(size: string) {
  if (size === "100x100" || size === "80x100") return 23490;
  if (size === "80x80" || size === "60x90" || size === "100x80") return 19990;
  if (size === "60x60" || size === "50x50" || size === "40x60") return 15990;
  if (size === "40x40" || size === "40x50" || size === "60x40") return 13990;
  return 11990;
}

const formatPrice = (price: number) => new Intl.NumberFormat("hu-HU").format(price) + " Ft";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function EgyediVaszonkepPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const modelViewerRef = useRef<any>(null);
  const ModelViewerTag = "model-viewer" as any;

  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [ratio, setRatio] = useState<Ratio>("square");
  const [size, setSize] = useState("50x50");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const price = useMemo(() => calculatePrice(size), [size]);

  useEffect(() => {
    if (is3DMode && typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, [is3DMode]);

  useEffect(() => {
    if (is3DMode && savedConfig?.previewUrl && modelViewerRef.current) {
      const mv = modelViewerRef.current;
      const apply = async () => {
        try {
            const texture = await mv.createTexture(savedConfig.previewUrl);
            const material = mv.model.materials.find((m: any) => m.name === "Canvas") || mv.model.materials[0];
            if (material?.pbrMetallicRoughness?.baseColorTexture) {
              material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
        } catch (e) { console.error(e); }
      };
      if (mv.loaded) apply();
      else mv.addEventListener("load", apply, { once: true });
    }
  }, [is3DMode, savedConfig?.previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (image) URL.revokeObjectURL(image);
    setImage(URL.createObjectURL(file));
    setFileName(file.name);
    setSavedConfig(null);
    setIs3DMode(false);
    setIsCropModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const croppedDataUrl = await getCroppedImage(image, croppedAreaPixels);
      setSavedConfig({ ratio, size, price, previewUrl: croppedDataUrl });
      setIsCropModalOpen(false);
    } catch (err) { alert("Hiba a kép feldolgozásakor."); }
    finally { setIsSaving(false); }
  };

  const handleAddToCart = () => {
    if (!savedConfig) return;
    addItem({
      id: uuidv4(),
      name: "Egyedi Vászonkép",
      size: savedConfig.size,
      price: savedConfig.price,
      image: savedConfig.previewUrl,
      quantity: 1,
      isCustom: true
    });
    router.push('/kosar');
  };

  const activeRatio = (savedConfig?.ratio || ratio) as Ratio;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr]">
          
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[40px] border border-[#d9d5cf] bg-white shadow-2xl relative">
              <div className="relative aspect-[1.1/1] bg-[#efebe6]">
                {is3DMode && savedConfig ? (
                  <ModelViewerTag
                    ref={modelViewerRef}
                    src={MODEL_URLS[activeRatio]}
                    ios-src={USDZ_URLS[activeRatio]} // iPhone specifikus fájl
                    ar 
                    ar-modes="webxr scene-viewer quick-look" 
                    ar-placement="wall"
                    camera-controls 
                    touch-action="none"
                    shadow-intensity="1.5" 
                    exposure="1.1"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <button slot="ar-button" className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-xs shadow-2xl">
                      ✨ Kihelyezés a falra
                    </button>
                    <button onClick={() => setIs3DMode(false)} className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Bezárás
                    </button>
                  </ModelViewerTag>
                ) : (
                  <>
                    <img src={TEMPLATE_IMAGE} alt="Wall mockup" className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                      <div className={`transition-all duration-700 ease-in-out ${
                        activeRatio === "square" ? "aspect-square w-[62%]" : 
                        activeRatio === "portrait" ? "aspect-[2/3] w-[42%]" : "aspect-[3/2] w-[72%]"
                      }`}>
                        <div className="relative h-full w-full overflow-hidden bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                          {savedConfig ? (
                            <img src={savedConfig.previewUrl} className="h-full w-full object-cover" />
                          ) : image ? (
                            <img src={image} className="h-full w-full object-cover opacity-50" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#f2f0ed] text-[#c1bdb9] font-black uppercase text-[9px] tracking-widest italic text-center px-4">A Te fotód helye</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {savedConfig && (
                      <button onClick={() => setIs3DMode(true)} className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-xs shadow-2xl">
                        ✨ Megnézem 3D-ben / AR
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[35px] border border-[#d9d5cf] bg-white p-8 h-fit shadow-xl">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-[#2a211d]">Egyedi Vászonkép</h1>
            
            <div className="space-y-10 text-black">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">1. Formátum</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(ratios) as Ratio[]).map(r => (
                      <button key={r} onClick={() => { setRatio(r); setSize(sizes[r][0]); setSavedConfig(null); setIs3DMode(false); }} className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ratio === r ? 'border-[#2a211d] bg-[#2a211d] text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>{ratioLabels[r]}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">2. Méret</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes[ratio].map(s => (
                      <button key={s} onClick={() => { setSize(s); setSavedConfig(null); setIs3DMode(false); }} className={`px-5 py-3 border-2 rounded-xl text-xs font-black tracking-tight transition-all ${size === s ? 'border-[#2a211d] bg-[#2a211d] text-white' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>{s} cm</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">3. Fotó feltöltése</p>
                  {!image ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[25px] bg-gray-50 cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#d17d58]">Kép kiválasztása</span>
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex justify-between items-center p-5 bg-gray-50 rounded-[20px] border border-gray-200">
                      <span className="text-[10px] font-bold truncate max-w-[120px] uppercase tracking-tight">{fileName}</span>
                      <button onClick={() => { setImage(null); setSavedConfig(null); setIs3DMode(false); }} className="text-red-500 text-[10px] font-black uppercase tracking-widest">Törlés</button>
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-dashed flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-gray-300 italic mb-1">Végösszeg</p>
                <p className="text-3xl font-black italic tracking-tighter text-[#2a211d]">{formatPrice(savedConfig?.price || price)}</p>
              </div>
              <button disabled={!savedConfig} onClick={handleAddToCart} className="bg-[#d17d58] text-white px-10 py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-orange-200/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-20">
                Kosárba
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CROP MODAL - iOS FIXES */}
      {image && !savedConfig && isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md overflow-hidden">
          <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
               <h3 className="font-black uppercase italic text-sm tracking-widest text-[#2a211d]">Kép szerkesztése</h3>
               <button onClick={() => setIsCropModalOpen(false)} className="text-gray-400 p-2 text-xl hover:text-black">✕</button>
            </div>
            <div className="relative flex-1 bg-[#111] min-h-[300px]">
              <Cropper 
                image={image} 
                crop={crop} 
                zoom={zoom} 
                aspect={ratios[ratio]} 
                onCropChange={setCrop} 
                onCropComplete={(_, p) => setCroppedAreaPixels(p)} 
                onZoomChange={setZoom}
                zoomWithScroll={true}
              />
            </div>
            <div className="p-8 space-y-6 bg-white">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Zoom</span>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none accent-[#d17d58] cursor-pointer" />
              </div>
              <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-[#2a211d] text-white py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#d17d58] transition-all shadow-xl shadow-black/10">
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