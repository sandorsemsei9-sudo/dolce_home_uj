"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";

type Ratio = "square" | "portrait" | "landscape";

const MODEL_URLS: Record<Ratio, string> = {
  square: "/models/square.glb",
  portrait: "/models/portrait.glb",
  landscape: "/models/landscape.glb",
};

const formatPrice = (p: number) => new Intl.NumberFormat("hu-HU").format(p) + " Ft";

function calculatePrice(size: string) {
  if (size === "100x100" || size === "80x100") return 23490;
  if (size === "80x80" || size === "60x90" || size === "100x80") return 19990;
  if (size === "60x60" || size === "50x50" || size === "40x60") return 15990;
  if (size === "40x40" || size === "40x50" || size === "60x40") return 13990;
  return 11990;
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
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // --- AZ ABSZOLÚT FIX TEXTÚRA INJEKTÁLÁS ---
  const applyTextureToModel = async () => {
    const mv = modelViewerRef.current;
    if (!mv || !mv.model || !savedConfig?.previewUrl) return;

    try {
      // Új textúra létrehozása (időbélyeggel a cache ellen)
      const texture = await mv.createTexture(savedConfig.previewUrl + "?v=" + uuidv4());

      // Végigmegyünk az anyagon
      for (const material of mv.model.materials) {
        // Ha nem a keret, akkor rátoljuk a képet
        if (!material.name.toLowerCase().includes("keret") && !material.name.toLowerCase().includes("frame")) {
          
          if (material.pbrMetallicRoughness) {
            const pbr = material.pbrMetallicRoughness;
            
            // Kényszerített textúra beállítás
            if (pbr.baseColorTexture) {
              pbr.baseColorTexture.setTexture(texture);
            } else {
              // Ha a Blender exportnál nem volt textúrahely, itt megpróbáljuk létrehozni
              pbr.baseColorTexture.setTexture(texture);
            }
            
            pbr.setMetallicFactor(0);
            pbr.setRoughnessFactor(1);
          }
          
          // IPHONE FIX: Ha a hátulját látod, kényszerítsük a kétoldalúságot
          material.setDoubleSided(true);
          material.setAlphaMode("OPAQUE");
        }
      }
      console.log("Textúra sikeresen kényszerítve!");
    } catch (err) {
      console.error("Textúra hiba:", err);
    }
  };

  // Figyeljük a betöltést
  useEffect(() => {
    if (is3DMode && modelViewerRef.current) {
      const mv = modelViewerRef.current;
      mv.addEventListener("load", applyTextureToModel);
      // Ha már be van töltve, futtassuk le azonnal
      if (mv.loaded) applyTextureToModel();
      return () => mv.removeEventListener("load", applyTextureToModel);
    }
  }, [is3DMode, savedConfig?.previewUrl]);

  const handleSaveConfig = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsSaving(true);
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;
    await new Promise((res) => (img.onload = res));
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, canvas.width, canvas.height);
    
    setSavedConfig({ ratio, size, price, previewUrl: canvas.toDataURL("image/jpeg", 0.8) });
    setIsCropModalOpen(false);
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1f1f1f]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr]">
          
          <div className="overflow-hidden rounded-[40px] border border-[#d9d5cf] bg-white shadow-2xl relative min-h-[500px]">
            {is3DMode && savedConfig ? (
              <ModelViewerTag
                ref={modelViewerRef}
                src={MODEL_URLS[ratio]}
                ar
                ar-modes="scene-viewer quick-look webxr"
                ar-placement="wall"
                camera-controls
                auto-rotate
                // IPHONE ROTATION FIX: Megforgatjuk a modellt, ha az iPhone hátulról nézi
                rotation="0deg 180deg 0deg" 
                shadow-intensity="1"
                style={{ width: "100%", height: "500px", backgroundColor: "#efebe6" }}
              >
                <button slot="ar-button" className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl">
                  ✨ Falra helyezés (AR)
                </button>
                <button onClick={() => setIs3DMode(false)} className="absolute top-6 right-6 bg-white/90 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  Bezárás
                </button>
              </ModelViewerTag>
            ) : (
              <div className="relative aspect-[1.1/1] bg-[#efebe6]">
                <img src="/images/mockup.jpg" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`bg-white shadow-2xl overflow-hidden ${ratio === "square" ? "w-1/2 aspect-square" : ratio === "portrait" ? "w-1/3 aspect-[2/3]" : "w-2/3 aspect-[3/2]"}`}>
                    {savedConfig && <img src={savedConfig.previewUrl} className="w-full h-full object-cover" />}
                  </div>
                </div>
                {savedConfig && (
                  <button onClick={() => setIs3DMode(true)} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border border-gray-100">
                    🔄 3D NÉZET
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[35px] shadow-xl border border-[#d9d5cf]">
            <h1 className="text-3xl font-black italic uppercase mb-8 text-[#2a211d]">Egyedi Vászonkép</h1>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setImage(URL.createObjectURL(file)); setFileName(file.name); setIsCropModalOpen(true); }
            }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-[#d17d58] font-bold" />
            
            <div className="mt-10 flex justify-between items-center border-t pt-8 border-dashed">
              <p className="text-3xl font-black italic text-[#2a211d]">{formatPrice(savedConfig?.price || price)}</p>
              <button disabled={!savedConfig} onClick={() => router.push('/kosar')} className="bg-[#d17d58] text-white px-8 py-4 rounded-xl font-black uppercase text-xs shadow-lg disabled:opacity-30">Kosárba</button>
            </div>
          </div>
        </div>
      </section>

      {/* CROP MODAL */}
      {image && isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden flex flex-col h-[80vh]">
            <div className="relative flex-1 bg-black">
              <Cropper image={image} crop={crop} zoom={zoom} aspect={ratio === "square" ? 1 : ratio === "portrait" ? 2/3 : 3/2} onCropChange={setCrop} onCropComplete={(_, p) => setCroppedAreaPixels(p)} onZoomChange={setZoom} />
            </div>
            <div className="p-6 bg-white">
              <button onClick={handleSaveConfig} className="w-full bg-[#2a211d] text-white py-4 rounded-xl font-bold uppercase tracking-widest">Mentés</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}