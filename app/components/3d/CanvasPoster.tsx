"use client";

import React, { useEffect } from "react";

export default function CanvasViewer({ modelUrl }: { modelUrl: string }) {
  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">
      {React.createElement(
        "model-viewer",
        {
          src: modelUrl,
          "ios-src": modelUrl.replace(".glb", ".usdz"),

          // --- AR BEÁLLÍTÁSOK ---
          ar: true,
          "ar-modes": "webxr scene-viewer quick-look", // A WebXR-t tettem előre, ez a legstabilabb
          "ar-placement": "wall",
          // "ar-scale": "fixed", // <--- EZT TÖRÖLTÜK VAGY KOMMENTELTÜK
          "ar-scale": "auto",    // Ez engedi az átméretezést

          // --- KAMERA ÉS MEGJELENÍTÉS ---
          "camera-controls": true,
          "auto-rotate": true,        // Egy kis mozgás vonzóbbá teszi
          "rotation-per-second": "30deg",
          "camera-orbit": "0deg 75deg 2.2m",
          "field-of-view": "30deg",
          
          // --- VIZUÁLIS FINOMÍTÁS ---
          "shadow-intensity": "1.5",  // Erősebb árnyék a mélységérzethez
          "shadow-softness": "1",
          exposure: "1.2",            // Kicsit világosabb, élettelibb színek
          "environment-image": "neutral",
          
          // --- INTERAKCIÓ ---
          "touch-action": "pan-y",    // Jobb görgetési élmény mobilon

          style: {
            width: "100%",
            height: "100%",
          },
        },

        // --- EGYEDI AR GOMB (Látványosabb design) ---
        React.createElement(
          "button",
          {
            slot: "ar-button",
            className:
              "absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 transition-transform active:scale-95",
          },
          <>
            <span>✨</span> Próbáld ki a faladon!
          </>
        )
      )}
    </div>
  );
}