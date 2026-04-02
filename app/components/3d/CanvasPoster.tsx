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
        
        // --- MOBIL & AR FIXEK ---
        'touch-action': "none",      
        'ar-placement': "wall",      
        'ar-scale': "auto", // Most már engedjük a nagyítást a falon
        
        // --- A KRITIKUS SOR: 180 FOKOS FORDÍTÁS ---
        // Ez megmondja a kamerának, hogy a hátuljáról induljon (ami nálad az eleje)
        'camera-orbit': "180deg 90deg 105%", 
        
        // Letiltjuk a függőleges dőlést, hogy ne lássunk a kép alá/fölé
        'min-polar-angle': "90deg",
        'max-polar-angle': "90deg",
        
        // Fények és árnyékok
        'shadow-intensity': "1.2",
        'environment-image': "neutral",
        'exposure': "1.1",

        style: { width: '100%', height: '100%', outline: 'none' }
      } as any, 
        <button 
          slot="ar-button" 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs shadow-2xl z-[120] uppercase tracking-widest active:scale-95 transition-all"
        >
          <span>📱</span> Próbáld ki a faladon
        </button>
      )}
    </div>
  );
}