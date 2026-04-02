"use client";

import React from "react";

export default function CanvasViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full bg-[#f8f8f6] relative flex items-center justify-center">
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
        'touch-action': "pan-y",
        'shadow-intensity': "1",
        'ar-placement': "wall",
        
        // --- 1. A TE MODELL-SPECIFIKUS BEÁLLÍTÁSAID ---
        // Mivel a kódodban Object_5 a fotó, kényszerítsük a kamerát, hogy azt nézze középen
        'camera-target': "0m 0m 0m",
        
        // Itt a titok: a 'rotation' helyett a 'camera-orbit'-al fordítjuk szembé.
        // Próbáljuk ki a 0 0 105% kombinációt, ami "felülről" néz le a fekvő képre
        'camera-orbit': "0deg 0deg 100%", 
        
        // --- 2. KIEGYENESÍTÉS ÉS FORGATÁS ---
        // Engedjük a forgatást, de szemből indítunk
        'min-polar-angle': "0deg",
        'max-polar-angle': "180deg",
        
        // Ez megakadályozza, hogy a modell "elugorjon" a képből
        'bounds': "tight", 
        'interaction-prompt': "none",

        style: { width: '100%', height: '100%', outline: 'none', cursor: 'grab' }
      } as any, 
        <button 
          slot="ar-button" 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl z-50 flex items-center gap-2"
        >
          <span>📱</span> MEGNÉZEM A FALAMON
        </button>
      )}
    </div>
  );
}