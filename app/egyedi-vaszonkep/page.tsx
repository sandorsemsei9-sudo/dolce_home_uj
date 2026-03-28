"use client";

import { useCallback, useMemo, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";

// --- SEGÉDFÜGGVÉNYEK ---

const sanitizeFileName = (name: string) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
    .toLowerCase();
};

type Ratio = "square" | "portrait" | "landscape";

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

function calculatePrice(size: string) {
  if (size === "100x100" || size === "80x100") return 23490;
  if (size === "80x80" || size === "60x90" || size === "100x80") return 19990;
  if (size === "60x60" || size === "50x50" || size === "40x60") return 15990;
  if (size === "40x40" || size === "40x50" || size === "60x40") return 13990;
  return 11990;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImage(imageSrc: string, pixelCrop: Area) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context nem érhető el.");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Hiba a kép vágásakor."));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

type SavedConfig = {
  ratio: Ratio;
  size: string;
  price: number;
  fileName: string;
  zoom: number;
  croppedAreaPixels: Area;
  previewUrl: string;
  originalStoragePath: string;
};

export default function EgyediVaszonkepPage() {
  const supabase = createClient();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [image, setImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [ratio, setRatio] = useState<Ratio>("square");
  const [size, setSize] = useState("50x50");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [savedConfig, setSavedConfig] = useState<SavedConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const price = useMemo(() => calculatePrice(size), [size]);
  const isLocked = !!savedConfig;

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const clearAll = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null); setRawFile(null); setFileName("");
    setRatio("square"); setSize("50x50");
    setCrop({ x: 0, y: 0 }); setZoom(1);
    setCroppedAreaPixels(null); setSavedConfig(null);
    setError(""); setIsCropModalOpen(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (image) URL.revokeObjectURL(image);
    setImage(URL.createObjectURL(file));
    setRawFile(file); setFileName(file.name);
    setSavedConfig(null); setError(""); setIsCropModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!image || !rawFile || !croppedAreaPixels) return;
    try {
      setIsSaving(true);
      const uniqueId = uuidv4();
      const safeName = sanitizeFileName(rawFile.name);
      const originalPath = `originals/${uniqueId}_${safeName}`;
      
      const { error: upErr1 } = await supabase.storage.from("custom-canvas").upload(originalPath, rawFile);
      if (upErr1) throw upErr1;

      const croppedBlob = await getCroppedImage(image, croppedAreaPixels);
      const previewPath = `previews/${uniqueId}_preview.jpg`;
      const { error: upErr2 } = await supabase.storage.from("custom-canvas").upload(previewPath, croppedBlob);
      if (upErr2) throw upErr2;

      const { data: { publicUrl } } = supabase.storage.from("custom-canvas").getPublicUrl(previewPath);

      setSavedConfig({
        ratio, size, price, fileName, zoom, croppedAreaPixels,
        previewUrl: `${publicUrl}?v=${uniqueId}`,
        originalStoragePath: originalPath
      });
      setIsCropModalOpen(false);
    } catch (err: any) {
      setError("Feltöltési hiba: " + err.message);
    } finally { setIsSaving(false); }
  };

  const handleAddToCart = async () => {
    if (!savedConfig) return;
    try {
      setIsAddingToCart(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: orderData, error: dbErr } = await supabase.from("custom_orders").insert({
        user_id: user?.id || null,
        original_image_url: savedConfig.originalStoragePath,
        preview_url: savedConfig.previewUrl,
        size: savedConfig.size, ratio: savedConfig.ratio, price: savedConfig.price,
        config: { zoom: savedConfig.zoom, crop: savedConfig.croppedAreaPixels },
        status: 'in_cart'
      }).select().single();

      if (dbErr) throw dbErr;

      addItem({
        id: orderData.id, name: "Egyedi Vászonkép", size: savedConfig.size,
        price: savedConfig.price, image: savedConfig.previewUrl, quantity: 1, isCustom: true
      });
      router.push('/kosar');
    } catch (err: any) {
      setError("Hiba: " + err.message);
    } finally { setIsAddingToCart(false); }
  };

  const activeRatio = savedConfig?.ratio || ratio;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr]">
          
          {/* 3D ELŐNÉZET MOCKUP */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[40px] border border-[#d9d5cf] bg-white shadow-2xl shadow-black/5">
              <div className="relative aspect-[1.1/1] bg-[#efebe6]">
                <img src={TEMPLATE_IMAGE} alt="Wall mockup" className="h-full w-full object-cover" />
                
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                  <div className={`transition-all duration-700 ease-in-out ${
                    activeRatio === "square" ? "aspect-square w-[62%]" : 
                    activeRatio === "portrait" ? "aspect-[2/3] w-[42%]" : "aspect-[3/2] w-[72%]"
                  }`}>
                    
                    {/* 3D HATÁS RÉTEGEZÉSE */}
                    <div className="relative h-full w-full group">
                      <div className="h-full w-full overflow-hidden bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all">
                        {savedConfig?.previewUrl ? (
                          <img src={savedConfig.previewUrl} alt="Preview" className="h-full w-full object-cover pointer-events-auto" crossOrigin="anonymous" />
                        ) : image ? (
                          <img src={image} alt="Uploaded" className="h-full w-full object-cover opacity-50" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#f2f0ed] text-[#c1bdb9] font-black uppercase text-[10px] tracking-widest italic">A Te fotód helye</div>
                        )}
                      </div>

                      {/* 3D Kontúr és mélység réteg */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 border border-white/10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/25 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-white/5 opacity-50" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VEZÉRLŐPANEL */}
          <div className="rounded-[35px] border border-[#d9d5cf] bg-white p-8 h-fit shadow-xl shadow-black/5">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Egyedi Vászonkép</h1>
            
            <div className="space-y-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">1. Formátum kiválasztása</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(ratios) as Ratio[]).map(r => (
                      <button key={r} onClick={() => { setRatio(r); setSize(sizes[r][0]); setSavedConfig(null); }} disabled={isLocked} className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ratio === r ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>{ratioLabels[r]}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">2. Méret kiválasztása</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes[ratio].map(s => (
                      <button key={s} onClick={() => { setSize(s); setSavedConfig(null); }} disabled={isLocked} className={`px-5 py-3 border-2 rounded-xl text-xs font-black tracking-tight transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>{s} cm</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">3. Fotó feltöltése</p>
                  {!image ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[25px] bg-gray-50 cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Kép kiválasztása</span>
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex justify-between items-center p-5 bg-gray-50 rounded-[20px] border border-gray-200">
                      <span className="text-[10px] font-bold truncate max-w-[150px] uppercase tracking-tight">{fileName}</span>
                      <button onClick={clearAll} className="text-red-500 text-[10px] font-black uppercase tracking-widest">Törlés</button>
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-dashed flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-gray-300 italic mb-1">Végösszeg</p>
                <p className="text-3xl font-black italic tracking-tighter">{formatPrice(savedConfig?.price || price)}</p>
              </div>
              <button disabled={!savedConfig || isAddingToCart} onClick={handleAddToCart} className="bg-[#e3936e] text-white px-10 py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-orange-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-20">
                {isAddingToCart ? "..." : "Kosárba"}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold mt-6 text-center italic">{error}</p>}
          </div>
        </div>
      </section>

      {/* CROP MODAL */}
      {image && !savedConfig && isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <h3 className="font-black uppercase italic text-sm tracking-widest">Kép szerkesztése</h3>
               <button onClick={clearAll} className="text-gray-300 hover:text-black transition-colors">✕</button>
            </div>
            <div className="relative h-[450px] bg-[#111]">
              <Cropper image={image} crop={crop} zoom={zoom} aspect={ratios[ratio]} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Zoom</span>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black" />
              </div>
              <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-black text-white py-6 rounded-[22px] font-black uppercase text-xs tracking-[0.3em] hover:bg-[#e3936e] transition-all shadow-xl shadow-gray-200">
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