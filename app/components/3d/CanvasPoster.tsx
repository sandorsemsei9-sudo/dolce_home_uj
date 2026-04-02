"use client";

import React, { useEffect, useState } from "react";

export default function CanvasViewer({ modelUrl }: { modelUrl: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-[#f8f8f6]" />;

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
        
        // --- A DÖNTÉS JAVÍTÁSA ---
        // Az orbit második értéke (15deg) dönti meg a kamerát "lefelé"
        'camera-orbit': "180deg 85deg 105%", 
        
        // Megengedjük, hogy a felhasználó egy kicsit mozgassa fel-le (0 és 30 fok között)
        'min-polar-angle': "0deg",
        'max-polar-angle': "30deg",
        
        'shadow-intensity': "1.2",
        'exposure': "1.1",
        style: { width: '100%', height: '100%', outline: 'none' }
      } as any, 
        <button 
          slot="ar-button" 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#e3936e] text-white px-10 py-4 rounded-2xl font-bold text-xs shadow-2xl z-[200] border-none uppercase tracking-widest active:scale-95 transition-all"
        >
          <span className="text-lg">✨</span>
          Kihelyezés a falra
        </button>
      )}
    </div>
  );
}