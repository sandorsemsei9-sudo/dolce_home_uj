import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server"; 
import TermekAdatlapClient from "./TermekAdatlapClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. DINAMIKUS SEO ÉS META ADATOK
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, cover_image")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Termék nem található" };

  const productDescription = product.description || `${product.name} prémium minőségű vászonkép, egyedi kivitelben.`;

  return {
    title: `${product.name} | Dolce Home`,
    description: productDescription,
    metadataBase: new URL("https://www.dolce-home.hu"),
    openGraph: {
      title: `${product.name} | Dolce Home`,
      description: productDescription, // Dinamikus leírás az OG-nak is
      url: `https://www.dolce-home.hu/vaszonkepek/${slug}`,
      images: [
        {
          url: product.cover_image, // Ez a Supabase-ből jövő közvetlen termékkép URL-je
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

// 2. OLDALBETÖLTÉS + JSON-LD STRUKTURÁLT ADAT BEINJEKTÁLÁSA
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Lekérjük a sémához szükséges adatokat is szerver oldalon
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, cover_image")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  // Lekérjük a legolcsóbb variáns árát a sémához (opcionális, de a Google szereti ha van ár)
  const { data: variant } = await supabase
    .from("product_variants")
    .select("price")
    .eq("product_id", product.id)
    .order("price", { ascending: true })
    .limit(1)
    .single();

  const productPrice = variant?.price || "5990"; // Fallback ár, ha valamiért üres lenne

  // Összerakjuk a Google-nek a hivatalos termék sémát
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.cover_image], // A Google ebből a tömbből veszi az első képet a találati listához!
    "description": product.description || `${product.name} prémium minőségű vászonkép.`,
    "offers": {
      "@type": "Offer",
      "price": productPrice,
      "priceCurrency": "HUF",
      "availability": "https://schema.org/InStock",
      "url": `https://www.dolce-home.hu/vaszonkepek/${slug}`
    }
  };

  return (
    <>
      {/* Strukturált adat injektálása a HTML-be a Google botok számára */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* A meglévő kliensoldali komponens hívása */}
      <TermekAdatlapClient params={params} />
    </>
  );
}