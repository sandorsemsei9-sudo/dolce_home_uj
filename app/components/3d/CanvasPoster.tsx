"use client";

import React from "react";

export default function CanvasViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">
      <script 
        async 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
      ></script>

      {React.createElement('model-viewer', {
        id: "canvas-viewer",
        src: modelUrl,
        ar: true,
        'ar-modes': "scene-viewer quick-look",
        'camera-controls': true,
        'touch-action': "none",
        'ar-placement': "wall",
        'ar-scale': "auto",
        'camera-orbit': "180deg 90deg 105%", // Ha háttal van, írd át 0deg-re
        'min-polar-angle': "90deg",
        'max-polar-angle': "90deg",
        'shadow-intensity': "1",
        'exposure': "1.2",
        style: { width: '100%', height: '100%', outline: 'none' }
      } as any, 
        <button 
          slot="ar-button" 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#e3936e] text-white px-10 py-4 rounded-2xl font-bold text-xs shadow-2xl z-[200] border-none active:scale-95 transition-all uppercase tracking-widest"
        >
          <span>✨</span> Kihelyezés a falra
        </button>
      )}
    </div>
  );
}