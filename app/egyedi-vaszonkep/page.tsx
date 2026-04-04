"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Cropper, { Area } from "react-easy-crop";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "../store/useCartStore";
import { useRouter } from "next/navigation";

const MODEL_URLS: Record<string, string> = {
  square: "/models/square.glb",
  portrait: "/models/portrait.glb",
  landscape: "/models/landscape.glb",
};

export default function EgyediVaszonkepPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const modelViewerRef = useRef<any>(null);
  const ModelViewerTag = "model-viewer" as any;

  const [image, setImage] = useState<string | null>(null);
  const [ratio, setRatio] = useState("square");
  const [size, setSize] = useState("50x50");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Model-viewer script betöltése
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // --- DINAMIKUS TEXTÚRÁZÁS IPHONE-RA OPTIMALIZÁLVA ---
  useEffect(() => {
    if (is3DMode && savedConfig?.previewUrl && modelViewerRef.current) {
      const mv = modelViewerRef.current;
      
      const applyTexture = async () => {
        try {
          // Kép létrehozása és textúrává alakítása
          const texture = await mv.createTexture(savedConfig.previewUrl);
          
          if (!mv.model) return;

          // Végigmegyünk a modell összes anyagán
          mv.model.materials.forEach((mat: any) => {
            const name = mat.name.toLowerCase();
            
            // Csak a vászonra tesszük rá (ami nem keret/frame)
            if (!name.includes('frame') && !name.includes('keret')) {
              if (mat.pbrMetallicRoughness) {
                // Apple Quick Look kompatibilitás fixek
                mat.pbrMetallicRoughness.setMetallicFactor(0); 
                mat.pbrMetallicRoughness.setRoughnessFactor(1);
                
                if (mat.pbrMetallicRoughness.baseColorTexture) {
                  mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                }
              }
              // Kényszerítjük, hogy ne legyen átlátszó
              mat.setAlphaMode("OPAQUE");
            }
          });
          console.log("Sikeres textúra injektálás!");
        } catch (e) {
          console.error("Hiba az AR textúrázásnál:", e);
        }
      };

      if (mv.loaded) applyTexture();
      else mv.addEventListener("load", applyTexture, { once: true });
    }
  }, [is3DMode, savedConfig?.previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSaveCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsSaving(true);
    // Itt a korábban megírt canvas-alapú vágó logikád jön...
    // A lényeg, hogy a végén kapj egy dataURL-t:
    setSavedConfig({ previewUrl: image, price: 15990, size, ratio }); 
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10 grid lg:grid-cols-2 gap-10">
        
        {/* BAL OLDAL: ELŐNÉZET */}
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden min-h-[500px] relative">
          {is3DMode && savedConfig ? (
            <ModelViewerTag
              ref={modelViewerRef}
              src={MODEL_URLS[ratio]}
              ar
              ar-modes="scene-viewer quick-look webxr"
              ar-placement="wall"
              camera-controls
              touch-action="pan-y"
              style={{ width: "100%", height: "500px" }}
            >
              <button slot="ar-button" className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl">
                ✨ MEGTEKINTÉS A FALON (AR)
              </button>
              <button onClick={() => setIs3DMode(false)} className="absolute top-5 right-5 bg-white/80 p-3 rounded-full text-xs font-black uppercase">
                Bezárás
              </button>
            </ModelViewerTag>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-20 bg-[#efebe6]">
              {savedConfig ? (
                <div className="relative shadow-2xl border-4 border-white">
                  <img src={savedConfig.previewUrl} alt="Preview" className="max-h-[300px]" />
                  <button onClick={() => setIs3DMode(true)} className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl font-bold shadow-lg w-max">
                    🔄 3D & AR NÉZET
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 font-bold uppercase tracking-widest italic">Tölts fel egy képet</p>
              )}
            </div>
          )}
        </div>

        {/* JOBB OLDAL: BEÁLLÍTÁSOK */}
        <div className="bg-white p-10 rounded-[40px] shadow-lg">
          <h1 className="text-3xl font-black uppercase italic mb-8">Konfigurátor</h1>
          <input type="file" onChange={onFileChange} className="mb-6 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
          {image && !savedConfig && (
            <button onClick={handleSaveCrop} className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase">Kép rögzítése</button>
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}