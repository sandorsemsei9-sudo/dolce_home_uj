"use client";

import { useEffect, useRef } from "react";

interface Props {
  modelUrl: string;
  iosModelUrl?: string; // Opcionálissá tettük
  textureUrl?: string;
}

export default function CustomCanvasViewer({ modelUrl, iosModelUrl, textureUrl }: Props) {
  const modelRef = useRef<any>(null);

  useEffect(() => {
    const applyTexture = async () => {
      if (textureUrl && modelRef.current) {
        const mv = modelRef.current;
        
        // Megvárjuk, amíg a modell betöltődik
        if (!mv.model || !mv.model.materials) {
          setTimeout(applyTexture, 300);
          return;
        }

        try {
          const material = mv.model.materials[0];
          const texture = await mv.createTexture(textureUrl);
          
          if (material.pbrMetallicRoughness.baseColorTexture) {
            material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
          }
        } catch (err) {
          console.error("3D textúra hiba:", err);
        }
      }
    };
    applyTexture();
  }, [textureUrl]);

  // AR aktiválása: csak ha van megadva iosModelUrl (iPhone) 
  // vagy ha nem iOS-en vagyunk (Android alapból viszi a GLB-t)
  const isArEnabled = !!iosModelUrl || (typeof navigator !== 'undefined' && !/iPad|iPhone|iPod/.test(navigator.userAgent));

  return (
    // @ts-ignore
    <model-viewer
      ref={modelRef}
      src={modelUrl}
      // Csak akkor adjuk át az ios-src-t, ha kaptunk érvényes URL-t
      {...(iosModelUrl ? { "ios-src": iosModelUrl } : {})}
      
      // Ha nincs iosModelUrl, és iPhone-on vagyunk, az 'ar' prop-ot is levehetjük a biztonság kedvéért
      {...(isArEnabled ? { ar: true } : {})}
      
      ar-modes="quick-look webxr scene-viewer"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      exposure="1"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      {/* Az AR gomb csak akkor jelenik meg, ha az eszköz támogatja és engedélyeztük */}
      {isArEnabled && (
        // @ts-ignore
        <button 
          slot="ar-button" 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-2xl border border-gray-100 text-black active:scale-95 transition-transform"
        >
          📱 Megtekintés a szobámban
        </button>
      )}
    {/* @ts-ignore */}
    </model-viewer>
  );
}