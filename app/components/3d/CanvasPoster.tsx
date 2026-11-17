"use client";

import React, { useEffect, useRef } from "react";

interface CanvasViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  textureUrl?: string;
  textureUrl2?: string;
  textureUrl3?: string;
  partsCount?: number;
}

export default function CanvasViewer({ 
  modelUrl, 
  iosModelUrl, 
  textureUrl, 
  textureUrl2, 
  textureUrl3,
  partsCount = 1 
}: CanvasViewerProps) {
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
    const applyTextures = async () => {
      const viewer = viewerRef.current;
      if (viewer && viewer.model) {
        const materials = viewer.model.materials;

        console.log("Modell anyagok:", materials.map((m: any) => m.name));

        if (materials && materials.length > 0) {
          if (partsCount === 3) {
            const mapping = [
              { index: 2, url: textureUrl3 }, // Bal oldali kép (felcserélve)
              { index: 3, url: textureUrl },  // Középső kép
              { index: 0, url: textureUrl2 }  // Jobb oldali kép (felcserélve)
            ];

            for (const item of mapping) {
              if (item.url && materials[item.index]?.pbrMetallicRoughness?.baseColorTexture) {
                const texture = await viewer.createTexture(item.url);
                materials[item.index].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
              }
            }
          } else {
            // Egyrészes modell
            if (textureUrl && materials[0]?.pbrMetallicRoughness?.baseColorTexture) {
              const texture = await viewer.createTexture(textureUrl);
              materials[0].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        }
      }
    };

    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener("load", applyTextures);
    }

    return () => {
      if (viewer) viewer.removeEventListener("load", applyTextures);
    };
  }, [textureUrl, textureUrl2, textureUrl3, partsCount]);

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