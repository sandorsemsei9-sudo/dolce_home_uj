"use client";

import React from "react";

export default function CanvasViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full relative bg-transparent">
      <script async type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>

      {React.createElement('model-viewer', {
        src: modelUrl,
        ar: true,
        'ar-modes': "scene-viewer quick-look",
        'camera-controls': true,
        'touch-action': "none", 
        'shadow-intensity': "1",
        'camera-orbit': "0deg 90deg 105%", 
        'min-polar-angle': "90deg",
        'max-polar-angle': "90deg",
        style: { width: '100%', height: '100%', outline: 'none' }
      } as any, 
        <button slot="ar-button" className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full font-bold text-sm shadow-2xl z-[120] flex items-center gap-2">
          <span>📱</span> PRÓBÁLD KI A FALADON
        </button>
      )}
    </div>
  );
}