
"use client";

import React, { useEffect, useRef, useState } from "react";

interface CanvasViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  textureUrl?: string;
  textureUrl2?: string;
  textureUrl3?: string;
  partsCount?: number;
}

const MODEL_VIEWER_URL =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js";

export default function CanvasViewer({
  modelUrl,
  textureUrl,
  textureUrl2,
  textureUrl3,
  partsCount = 1,
}: CanvasViewerProps) {
  const viewerRef = useRef<any>(null);

  const [viewerReady, setViewerReady] = useState(false);
  const [textureReady, setTextureReady] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // 1. MODEL-VIEWER BETÖLTÉSE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        if (!customElements.get("model-viewer")) {
          const scriptId = "dolce-model-viewer";

          if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");

            script.id = scriptId;
            script.type = "module";
            script.src = MODEL_VIEWER_URL;

            script.onerror = () => {
              if (!cancelled) {
                setError(
                  "Nem sikerült betölteni a 3D megjelenítőt."
                );
              }
            };

            document.head.appendChild(script);
          }
        }

        await customElements.whenDefined("model-viewer");

        if (!cancelled) {
          setViewerReady(true);
        }
      } catch (err) {
        console.error("Model-viewer hiba:", err);

        if (!cancelled) {
          setError("A 3D megjelenítő nem érhető el.");
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // 2. TERMÉKKÉPEK RÁHELYEZÉSE A MODELLRE
  // ==========================================

  useEffect(() => {
    if (!viewerReady) return;

    const viewer = viewerRef.current;

    if (!viewer) return;

    let cancelled = false;
    let requestId = 0;

    const applyTextures = async () => {
      const currentRequest = ++requestId;

      setTextureReady(false);
      setError("");

      try {
        if (!viewer.model?.materials?.length) {
          return;
        }

        const materials = viewer.model.materials;

        console.log(
          "Dolce Home - Modell anyagok:",
          materials.map((m: any) => m.name)
        );

        // Háromrészes képeknél megtartjuk
        // az eredeti anyagindexeket.
        const mapping =
          partsCount === 3
            ? [
                {
                  index: 2,
                  url: textureUrl3,
                },
                {
                  index: 3,
                  url: textureUrl,
                },
                {
                  index: 0,
                  url: textureUrl2,
                },
              ]
            : [
                {
                  index: 0,
                  url: textureUrl,
                },
              ];

        // Ellenőrizzük a szükséges képeket
        // és a modell anyagait.
        for (const item of mapping) {
          if (!item.url) {
            throw new Error(
              `Hiányzó termékkép: ${item.index}`
            );
          }

          const material = materials[item.index];

          if (
            !material?.pbrMetallicRoughness
              ?.baseColorTexture
          ) {
            throw new Error(
              `Hiányzó modellanyag: ${item.index}`
            );
          }
        }

        // A termékképeket párhuzamosan betöltjük.
        const loadedTextures = await Promise.all(
          mapping.map(async (item) => {
            const texture = await viewer.createTexture(
              item.url
            );

            return {
              index: item.index,
              texture,
            };
          })
        );

        if (
          cancelled ||
          currentRequest !== requestId
        ) {
          return;
        }

        // A képeket ráhelyezzük a vászonra.
        for (const item of loadedTextures) {
          const material = materials[item.index];

          material.pbrMetallicRoughness
            .baseColorTexture.setTexture(
              item.texture
            );
        }

        if (
          cancelled ||
          currentRequest !== requestId
        ) {
          return;
        }

        console.log(
          "Dolce Home - Textúrák sikeresen alkalmazva."
        );

        // Várunk egy renderelési képkockát.
        requestAnimationFrame(() => {
          if (
            !cancelled &&
            currentRequest === requestId
          ) {
            setTextureReady(true);
          }
        });
      } catch (err) {
        console.error(
          "Dolce Home - Textúrahiba:",
          err
        );

        if (!cancelled) {
          setTextureReady(false);
          setError(
            "A vászonkép 3D textúrája nem tölthető be."
          );
        }
      }
    };

    const handleLoad = () => {
      void applyTextures();
    };

    const handleError = (event: Event) => {
      console.error(
        "Dolce Home - Modellhiba:",
        event
      );

      setTextureReady(false);
      setError(
        "Nem sikerült betölteni a 3D modellt."
      );
    };

    viewer.addEventListener(
      "load",
      handleLoad
    );

    viewer.addEventListener(
      "error",
      handleError
    );

    // Már betöltött modell esetén is
    // lefuttatjuk a textúrázást.
    if (
      viewer.loaded &&
      viewer.model?.materials?.length
    ) {
      void applyTextures();
    }

    return () => {
      cancelled = true;
      requestId++;

      viewer.removeEventListener(
        "load",
        handleLoad
      );

      viewer.removeEventListener(
        "error",
        handleError
      );
    };
  }, [
    viewerReady,
    modelUrl,
    textureUrl,
    textureUrl2,
    textureUrl3,
    partsCount,
  ]);

  // ==========================================
  // 3. AUTOMATIKUS iPHONE AR
  // ==========================================

  // FONTOS:
  // NINCS ios-src attribútum!
  //
  // A model-viewer a GLB modellből
  // és a ráhelyezett termékképekből
  // automatikusan állítja elő a USDZ-t.
  //
  // Androidon marad a GLB-alapú AR.

  const viewerProps: Record<string, any> = {
    ref: viewerRef,

    src: modelUrl,

    ar: true,

    "ar-modes":
      "webxr scene-viewer quick-look",

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

    "tone-mapping": "aces",

    "touch-action": "pan-y",

    style: {
      width: "100%",
      height: "100%",
    },
  };

  // ==========================================
  // 4. MEGJELENÍTÉS
  // ==========================================

  return (
    <div className="w-full h-full relative bg-[#f8f8f6]">

      {viewerReady &&
        React.createElement(
          "model-viewer",
          viewerProps,

          React.createElement(
            "button",
            {
              slot: "ar-button",

              type: "button",

              disabled: !textureReady,

              style: {
                display: textureReady
                  ? "flex"
                  : "none",
              },

              className:
                "absolute bottom-12 left-1/2 " +
                "-translate-x-1/2 " +
                "bg-[#2a211d] text-white " +
                "px-8 py-4 rounded-2xl " +
                "font-bold text-sm shadow-2xl " +
                "items-center gap-2 " +
                "transition-transform active:scale-95",
            },

            React.createElement(
              "span",
              null,
              "✨"
            ),

            " Próbáld ki a faladon!"
          )
        )
      }

      {!textureReady && !error && (
        <div
          className={
            "absolute bottom-5 left-0 right-0 " +
            "text-center text-xs text-gray-500 " +
            "pointer-events-none"
          }
        >
          3D vászonkép előkészítése...
        </div>
      )}

      {error && (
        <div
          className={
            "absolute bottom-5 left-4 right-4 " +
            "bg-red-50 text-red-700 " +
            "text-xs p-3 rounded-xl text-center"
          }
        >
          {error}
        </div>
      )}

    </div>
  );
}
