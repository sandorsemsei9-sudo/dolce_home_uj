"use client";

import React, { useEffect } from "react";

interface CanvasViewerProps {
  modelUrl: string;
}

export default function CanvasViewer({ modelUrl }: CanvasViewerProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  const iosUrl = modelUrl.replace(".glb", ".usdz");

  // A React.createElement-et használjuk, hogy a TS ne panaszkodjon az ismeretlen tag-re
  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">
      {React.createElement(
        "model-viewer",
        {
          src: modelUrl,
          "ios-src": iosUrl,
          ar: "true",
          "ar-modes": "quick-look scene-viewer webxr",
          "ar-placement": "wall",
          "ar-scale": "auto",
          "camera-controls": "true",
          "auto-rotate": "true",
          "rotation-per-second": "30deg",
          "camera-orbit": "0deg 75deg 2.5m",
          "field-of-view": "30deg",
          "touch-action": "pan-y",
          "shadow-intensity": "1.5",
          "shadow-softness": "1",
          exposure: "1.2",
          "environment-image": "neutral",
          style: {
            width: "100%",
            height: "100%",
            display: "block",
          },
        } as any, // Az 'as any' kikapcsolja a TS hibaellenőrzést erre az objektumra
        
        // EGYEDI AR GOMB (Gyermek elemként adjuk át)
        <button
          key="ar-button"
          slot="ar-button"
          className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 transition-transform active:scale-95"
          style={{ zIndex: 9999 }}
        >
          <span className="text-lg">✨</span> 
          <span>PRÓBÁLD KI A FALADON!</span>
        </button>
      )}
    </div>
  );
}