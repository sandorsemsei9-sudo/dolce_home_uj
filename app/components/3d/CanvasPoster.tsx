"use client";

import React, { useEffect, useRef } from "react";

interface CanvasViewerProps {
  modelUrl: string;      // Az alap .glb fájl (Androidhoz)
  iosModelUrl: string;   // A kész .usdz fájl (iPhone-hoz)
  textureUrl?: string;   // A textúra, amit csak Androidon/Weben rakunk rá
}

export default function CanvasViewer({ modelUrl, iosModelUrl, textureUrl }: CanvasViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Ellenőrizzük, hogy iOS-en vagyunk-e
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const applyTexture = async () => {
      const viewer = viewerRef.current;
      // CSAK akkor futtatjuk a textúra cserét, ha NEM iOS-en vagyunk és van textúra
      if (!isIOS && viewer && textureUrl && viewer.model) {
        try {
          const texture = await viewer.createTexture(textureUrl);
          const material = viewer.model.materials[0];
          if (material && material.pbrMetallicRoughness.baseColorTexture) {
            material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          }
        } catch (error) {
          console.error("Hiba a textúra betöltésekor:", error);
        }
      }
    };

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
          "ios-src": iosModelUrl,
          ar: true,
          "ar-modes": "quick-look webxr scene-viewer",
          "ar-placement": "wall",
          "ar-scale": "auto",
          "camera-controls": true,
          "auto-rotate": true,
          "rotation-per-second": "30deg",
          "camera-orbit": "0deg 75deg 2.2m",
          "field-of-view": "30deg",
          "shadow-intensity": "1.5",
          "shadow-softness": "1",
          exposure: "1.2",
          "environment-image": "neutral",
          "touch-action": "pan-y",
          style: { width: "100%", height: "100%" },
        },
        React.createElement(
          "button",
          {
            slot: "ar-button",
            className: "absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2",
          },
          <React.Fragment>
            <span>✨</span> Próbáld ki a faladon!
          </React.Fragment>
        )
      )}
    </div>
  );
}