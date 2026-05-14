import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server"; 
import TermekAdatlapClient from "./TermekAdatlapClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. DINAMIKUS SEO: Ez kérdezi le az adatbázisból a termék nevét a Google-nek
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, cover_image")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Termék nem található" };

  return {
    title: `${product.name} | Dolce Home`,
    description: product.description || `${product.name} prémium minőségű vászonkép, egyedi kivitelben.`,
    metadataBase: new URL("https://www.dolce-home.hu"),
    openGraph: {
      title: `${product.name} | Dolce Home`,
      description: "Prémium minőségű, vakrámázott vászonképek országos szállítással.",
      url: `https://www.dolce-home.hu/vaszonkepek/${slug}`,
      images: [
        {
          url: product.cover_image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

// 2. OLDALBETÖLTÉS: Ellenőrzi a terméket, majd betölti a te 3D-s kliens kódodat
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  // Itt hívjuk meg a te eredeti kódodat, amit átneveztél
  return <TermekAdatlapClient params={params} />;
}