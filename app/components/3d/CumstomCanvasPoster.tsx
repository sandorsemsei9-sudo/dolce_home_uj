"use client";

import { useEffect, useRef } from "react";

interface Props {
  modelUrl: string;
  textureUrl?: string;
}

export default function CustomCanvasViewer({ modelUrl, textureUrl }: Props) {
  const modelRef = useRef<any>(null);

  useEffect(() => {
    const applyTexture = async () => {
      if (textureUrl && modelRef.current) {
        const mv = modelRef.current;
        // Várunk, amíg a modell betölt
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

  return (
    // @ts-ignore
    <model-viewer
      ref={modelRef}
      src={modelUrl}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      exposure="1"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      {/* @ts-ignore */}
      <button slot="ar-button" className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-2xl border border-gray-100 text-black">
        📱 Megtekintés a szobámban
      </button>
    {/* @ts-ignore */}
    </model-viewer>
  );
}