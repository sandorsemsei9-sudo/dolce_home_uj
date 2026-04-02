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

          ar: true,
          "ar-modes": "scene-viewer quick-look webxr",
          "ar-placement": "wall",
          "ar-scale": "fixed",

          "camera-controls": true,
          "camera-orbit": "0deg 75deg 2.2m",
          "field-of-view": "30deg",
          "camera-target": "0m 0m 0m",

          "shadow-intensity": "1",
          exposure: "1",
          "environment-image": "neutral",

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
              "absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#e3936e] text-white px-6 py-3 rounded-xl font-bold text-xs",
          },
          "✨ Kihelyezés a falra"
        )
      )}
    </div>
  );
}