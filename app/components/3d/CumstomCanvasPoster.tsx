"use client";

import React, { useEffect, useRef } from "react";

interface CustomCanvasViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  textureUrl?: string;
  partsCount?: number;
}

// Segédfüggvény: A feltöltött képet PONTOSAN 3 egyenlő függőleges szeletre vágja
const sliceImageIntoThree = (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const slicedUrls: string[] = [];
      const sliceWidth = img.width / 3;

      for (let i = 0; i < 3; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = sliceWidth;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            img,
            i * sliceWidth, 0, sliceWidth, img.height, // Kivágás
            0, 0, sliceWidth, img.height               // Másolás
          );
          slicedUrls.push(canvas.toDataURL("image/jpeg", 0.92));
        }
      }
      resolve(slicedUrls);
    };
    img.onerror = (err) => {
      console.error("Hiba a kép vágása során:", err);
      reject(err);
    };
    img.src = imageUrl;
  });
};

export default function CustomCanvasViewer({ 
  modelUrl, 
  iosModelUrl, 
  textureUrl,
  partsCount = 1 
}: CustomCanvasViewerProps) {
  const viewerRef = useRef<any>(null);

  // 1. Script betöltése
  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // 2. Textúrázási logika
  useEffect(() => {
    const applyTextures = async () => {
      const viewer = viewerRef.current;
      if (!viewer || !viewer.model || !textureUrl) return;

      const materials = viewer.model.materials;
      if (!materials || materials.length === 0) return;

      console.log("CustomCanvasViewer anyagok:", materials.map((m: any) => m.name));

      // AUTOMATIKUS FELISMERÉS: Ha partsCount === 3 VAGY a modellben legalább 3-4 anyag van
      const isThreePart = partsCount === 3 || materials.length >= 3;

      if (isThreePart) {
        try {
          // Kép felvágása 3 szeletre
          const [leftSlice, centerSlice, rightSlice] = await sliceImageIntoThree(textureUrl);

          // Pontos index-leképzés a GLB modelledhez:
          const mapping = [
            { index: 3, url: leftSlice },   // Bal oldali panel
            { index: 0, url: centerSlice }, // Középső panel
            { index: 2, url: rightSlice }   // Jobb oldali panel
          ];

          for (const item of mapping) {
            if (item.url && materials[item.index]?.pbrMetallicRoughness?.baseColorTexture) {
              const texture = await viewer.createTexture(item.url);
              materials[item.index].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        } catch (err) {
          console.error("3 részes textúra beállítási hiba:", err);
        }
      } else {
        // Egyrészes modell
        if (materials[0]?.pbrMetallicRoughness?.baseColorTexture) {
          const texture = await viewer.createTexture(textureUrl);
          materials[0].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
        }
      }
    };

    const viewer = viewerRef.current;
    if (viewer) {
      // Kijavított rész: Ha a modell MÁR BE VAN TÖLTVE, azonnal lefut
      if (viewer.model) {
        applyTextures();
      }
      
      // Ha még töltődik, megvárja a load eseményt
      viewer.addEventListener("load", applyTextures);
    }

    return () => {
      if (viewer) viewer.removeEventListener("load", applyTextures);
    };
  }, [textureUrl, partsCount]);

  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">
      {React.createElement(
        "model-viewer",
        {
          ref: viewerRef,
          src: modelUrl,
          "ios-src": iosModelUrl || modelUrl.replace(".glb", ".usdz"),

          ar: true,
          "ar-modes": "webxr scene-viewer quick-look",
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

          style: {
            width: "100%",
            height: "100%",
          },
        },
        React.createElement(
          "button",
          {
            slot: "ar-button",
            className:
              "absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2a211d] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 transition-transform active:scale-95",
          },
          React.createElement(
            React.Fragment,
            null,
            React.createElement("span", null, "✨"),
            " Próbáld ki a faladon!"
          )
        )
      )}
    </div>
  );
}