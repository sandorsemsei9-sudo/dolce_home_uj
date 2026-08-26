import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link"; // <-- Importálva a belső linkeléshez

import { createClient } from "@/lib/supabase/server";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

import ProductCollectionClient from "./ProductCollectionClient";

export const metadata: Metadata = {
  title: "Vászonképek – Modern Faliképek Otthonodba | Dolce Home",
  description:
    "Böngéssz prémium vászonkép kínálatunkban! Absztrakt, tájkép, állatos és modern fali dekorációk többféle méretben. Találd meg az otthonodhoz illő tökéletes képet.",
  keywords: [
    "vászonképek",
    "vászonkép",
    "faliképek",
    "modern vászonkép",
    "vászonkép webáruház",
    "fali dekoráció",
    "absztrakt vászonkép",
    "nappali dekoráció",
    "prémium faliképek",
    "vászonkép rendelés",
  ],
  alternates: {
    canonical: "https://www.dolce-home.hu/vaszonkepek",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Vászonképek – Modern Faliképek Otthonodba | Dolce Home", // <-- "Egyedi" kivezetve
    description:
      "Fedezd fel a Dolce Home prémium vászonkép kínálatát! Absztrakt, tájképes, városi, virágos és gyerekszobai vászonképek több méretben, vakrámára feszítve.",
    url: "https://www.dolce-home.hu/vaszonkepek",
    siteName: "Dolce Home",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: "https://www.dolce-home.hu/images/4evszak.png",
        width: 1200,
        height: 630,
        alt: "Dolce Home Vászonkép Kollekció",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vászonképek – Modern Faliképek Otthonodba | Dolce Home", // <-- "Egyedi" kivezetve
    description:
      "Fedezd fel prémium minőségű vászonképeinket többféle méretben és stílusban.",
    images: ["https://www.dolce-home.hu/images/4evszak.png"],
  },
};

export default async function VaszonkepekPage() {
  const supabase = await createClient();

  // TERMÉKEK LEKÉRDEZÉSE
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      product_variants(*)
    `)
    .order("position", { ascending: true });

  if (productsError) {
    console.error("Termék lekérdezési hiba:", productsError.message);
  }

  // KATEGÓRIA KAPCSOLATOK LEKÉRDEZÉSE
  const { data: relations, error: relationsError } = await supabase
    .from("product_categories")
    .select("product_id, category_id, categories(name)");

  if (relationsError) {
    console.error("Kategória kapcsolat hiba:", relationsError.message);
  }

  // KATEGÓRIÁK LEKÉRDEZÉSE
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("Kategória lekérdezési hiba:", categoriesError.message);
  }

  // TERMÉKEK FELDOLGOZÁSA
  const processedProducts = (products || []).map((product: any) => {
    const prices =
      product.product_variants
        ?.map((variant: any) => Number(variant.price))
        .filter((price: number) => Number.isFinite(price)) || [];

    const productCategories = (relations || [])
      .filter((relation: any) => relation.product_id === product.id)
      .map((relation: any) => relation.categories?.name)
      .filter(Boolean);

    return {
      ...product,
      display_price: prices.length > 0 ? Math.min(...prices) : 0,
      display_category: productCategories[0] || "Vászonkép",
      all_categories: productCategories,
    };
  });

  // SCHEMA.ORG JSON-LD STRUKTURÁLT ADATOK
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Vászonképek – Modern Faliképek Otthonodba", // <-- "Egyedi" kivezetve
    "description":
      "Böngéssz prémium vászonkép kínálatunkban! Absztrakt, tájkép, állatos és modern fali dekorációk többféle méretben.",
    "url": "https://www.dolce-home.hu/vaszonkepek",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": processedProducts.length,
      "itemListElement": processedProducts
        .slice(0, 24)
        .map((product: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": product.title,
          "url": `https://www.dolce-home.hu/termek/${product.slug || product.id}`,
          "image": product.image_url || undefined,
        })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Főoldal",
        "item": "https://www.dolce-home.hu",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Vászonképek",
        "item": "https://www.dolce-home.hu/vaszonkepek",
      },
    ],
  };

  return (
    <>
      {/* JSON-LD BEÉPÍTÉS A KERESŐROBOTOKNAK */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">
        {/* HERO */}
        <section className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
          <div className="pointer-events-none absolute inset-0 bg-[#f8f3ef]/30" />

          <div className="relative mx-auto max-w-7xl px-6">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
              Dolce Home Kollekció
            </p>

            <h1 className="max-w-5xl text-4xl font-bold italic leading-tight tracking-tight text-[#2a211d] md:text-6xl">
              Vászonképek – Modern Faliképek Otthonodba
            </h1>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-[#7a665c] md:text-base">
              Fedezd fel a Dolce Home prémium <strong>vászonkép</strong> kínálatát! Válogass modern absztrakt minták, természetközeli tájképek, hangulatos városi vászonképek, elegáns virágos dekorációk és gyerekszobai vászonképek közül. Minden vászonképünk vakrámára feszítve, azonnal felakasztható állapotban érkezik.
            </p>
          </div>
        </section>

        {/* KLIENS OLDALI LISTÁZÁS */}
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
            </div>
          }
        >
          <ProductCollectionClient
            products={processedProducts}
            categories={categories || []}
          />
        </Suspense>

        {/* SEO SZEKCIÓ */}
        <section className="border-t border-[#efebe6] bg-[#f8f3ef]/40 py-20">
          <div className="mx-auto max-w-5xl space-y-10 px-6">
            <div className="space-y-6 text-sm leading-relaxed text-[#7a665c] md:text-base">
              <h2 className="text-2xl font-bold italic tracking-tight text-[#2a211d] md:text-3xl">
                Prémium Vászonképek és Modern Fali Dekorációk
              </h2>

              <p>
                A{" "}
                <Link href="/">
                  <strong>Dolce Home vászonképek</strong>
                </Link>{" "}
                tökéletes megoldást nyújtanak, ha stílusos és tartós faldekorációval szeretnéd szebbé tenni otthonodat. Legyen szó a nappali központi faláról, a hálószoba megnyugtató hangulatáról vagy az iroda modern megjelenéséről, kollekciónkban megtalálod a hozzád illő műalkotást.
              </p>

              <p>
                Kínálatunkban megtalálhatók az{" "}
                <Link href="/kategoria/absztrakt">
                  <strong>absztrakt vászonképek</strong>
                </Link>
                , a{" "}
                <Link href="/kategoria/termeszet">
                  <strong>természeti és tájképes vászonképek</strong>
                </Link>
                , a{" "}
                <Link href="/kategoria/varosok">
                  <strong>városi vászonképek</strong>
                </Link>
                , az elegáns{" "}
                <Link href="/kategoria/allatvilag">
                  <strong>állatos faliképek</strong>
                </Link>
                , valamint a{" "}
                <Link href="/kategoria/gyerekszoba">
                  <strong>gyerekszobai vászonképek</strong>
                </Link>{" "}
                és a több részes triptichon összeállítások. Minden termékünk prémium művészvászonra készül, így otthonod különböző helyiségeihez könnyedén megtalálhatod a megfelelő stílust.
              </p>

              <p className="font-medium text-[#2a211d]">
                Vászonképeink kiváló minőségű pamut művészvászonra készülnek, amelyet stabil fenyőfa vakrámára feszítünk.
              </p>
            </div>

            <div className="grid gap-8 border-t border-[#efebe6] pt-8 md:grid-cols-2">
              <div>
                <h3 className="mb-5 text-xl font-bold text-[#2a211d]">
                  Miért válaszd a Dolce Home vászonképeket?
                </h3>

                <ul className="space-y-3 text-sm text-[#7a665c]">
                  <li>✔️ <strong>Prémium anyaghasználat:</strong> 360 g/m² pamut művészvászon</li>
                  <li>✔️ <strong>Vakrámára feszítve:</strong> Stabil fenyőfa keret, azonnal felakasztható</li>
                  <li>✔️ <strong>Többféle méretben:</strong> A kisebb méretektől a nagy méretű faliképekig</li>
                  <li>✔️ <strong>Magyar termék:</strong> Hazai gyártás és gyors szállítás</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-[#efebe6] bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold text-[#2a211d]">
                  Vászonkép rendelés egyszerűen
                </h3>

                <p className="text-sm text-[#7a665c] leading-relaxed">
                  Böngéssz a kategóriák között, válaszd ki a számodra megfelelő méretet, és rendeld meg kedvenc faliképedet pár kattintással. A képeket gondosan csomagolva szállítjuk, hogy sértetlenül érkezzenek meg hozzád.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}