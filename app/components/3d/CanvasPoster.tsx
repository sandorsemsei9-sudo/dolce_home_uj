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
        src: modelUrl,
        ar: true,
        'ar-modes': "scene-viewer quick-look",
        'camera-controls': true,
        
        // --- MOBIL OPTIMALIZÁLÁS ---
        'touch-action': "none",
        'ar-placement': "wall",
        
        // MÉRETEZÉS: Most engedélyezzük (auto), hogy ne legyen túl kicsi a falon
        'ar-scale': "auto", 
        
        // Finomabb mozgás, nem fog ugrálni az ujjad alatt
        'interpolation-decay': "200", 
        'orbit-sensitivity': "1",
        
        // --- NÉZET ---
        // Ha Blenderben fixáltad és tükrözted, próbáld a 0deg-et vagy 180deg-et
        'camera-orbit': "0deg 90deg 105%", 
        'min-polar-angle': "90deg",
        'max-polar-angle': "90deg",
        
        // Árnyék és fények
        'shadow-intensity': "1.5",
        'shadow-softness': "1",
        'exposure': "1.2",

        style: { width: '100%', height: '100%', outline: 'none' }
      } as any, 
        /* Modernizált AR Gomb */
        <button 
          slot="ar-button" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 active:scale-95 transition-all z-[120]"
        >
          <span className="text-xl">✨</span>
          NÉZD MEG A FALADON
        </button>
      )}
    </div>
  );
}