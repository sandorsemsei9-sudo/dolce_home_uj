"use client";

import React, { useEffect, useRef } from "react";

// Kibővítjük a propok listáját: jöhet az iosUrl és a textureUrl is
interface CanvasViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  textureUrl?: string;
}

export default function CanvasViewer({ modelUrl, iosModelUrl, textureUrl }: CanvasViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Script betöltése ha még nincs ott
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // Ez a rész felel azért, hogy Androidon/Weben ráfeszítse a képet a modellre
  useEffect(() => {
    const applyTexture = async () => {
      const viewer = viewerRef.current;
      if (viewer && textureUrl && viewer.model) {
        // Létrehozunk egy textúrát a képből
        const texture = await viewer.createTexture(textureUrl);
        // Megkeressük a modell anyagát (általában az első)
        const material = viewer.model.materials[0];
        
        if (material && material.pbrMetallicRoughness.baseColorTexture) {
          material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
        }
      }
    };

    // Megvárjuk, amíg a modell betöltődik, mielőtt rátesszük a képet
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener("load", applyTexture);
    }

    return () => {
      if (viewer) viewer.removeEventListener("load", applyTexture);
    };
  }, [textureUrl]);

  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">
      {React.createElement(
        "model-viewer",
        {
          ref: viewerRef,
          src: modelUrl,
          // Ha küldtünk egyedi iosModelUrl-t, azt használja, ha nem, akkor a régit
          "ios-src": iosModelUrl || modelUrl.replace(".glb", ".usdz"),

          // --- AR BEÁLLÍTÁSOK ---
          ar: true,
          "ar-modes": "webxr scene-viewer quick-look",
          "ar-placement": "wall",
          "ar-scale": "auto",

          // --- KAMERA ÉS MEGJELENÍTÉS ---
          "camera-controls": true,
          "auto-rotate": true,
          "rotation-per-second": "30deg",
          "camera-orbit": "0deg 75deg 2.2m",
          "field-of-view": "30deg",
          
          // --- VIZUÁLIS FINOMÍTÁS ---
          "shadow-intensity": "1.5",
          "shadow-softness": "1",
          exposure: "1.2",
          "environment-image": "neutral",
          
          // --- INTERAKCIÓ ---
          "touch-action": "pan-y",

          style: {
            width: "100%",
            height: "100%",
          },
        },

        // --- EGYEDI AR GOMB ---
        React.createElement(
          "button",
          {
            slot: "ar-button",
            className:
              "absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 transition-transform active:scale-95",
          },
          <React.Fragment>
            <span>✨</span> Próbáld ki a faladon!
          </React.Fragment>
        )
      )}
    </div>
  );
}