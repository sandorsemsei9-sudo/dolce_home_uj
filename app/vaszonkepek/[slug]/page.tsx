// app/termek/[slug]/page.tsx
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server"; 
import TermekAdatlapClient from "./TermekAdatlapClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. DINAMIKUS SEO ÉS META ADATOK (Szerver oldalon fut)
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
      description: productDescription,
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

// 2. OLDALBETÖLTÉS + JSON-LD STRUKTURÁLT ADAT + ADATÁTADÁS
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Lekérjük a termék alapadatait szerver oldalon
  // (Kiegészítve az esetleges értékelési mezőkkel, ha vannak ilyenek a tábládban - pl. rating_avg, review_count)
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, cover_image, orientation, texture_image, slug, hover_image, categories(name)")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  // Lekérjük az ÖSSZES variánst szerver oldalon (a kosárhoz, méretválasztóhoz és az árhoz)
  const { data: allVariants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  // Megkeressük a legolcsóbb árat a Google sémához
  const productPrice = allVariants && allVariants.length > 0 ? allVariants[0].price : "5990";

  // Alap séma struktúra felépítése
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.cover_image],
    "description": product.description || `${product.name} prémium minőségű vászonkép.`,
    "brand": {
      "@type": "Brand",
      "name": "Dolce Home"
    },
    // Mivel egyedi vászonképekről van szó, jelezzük a Google-nek, hogy nincs globális vonalkód (GTIN)
    "identifierExists": "false", 
    "offers": {
      "@type": "Offer",
      "price": productPrice,
      "priceCurrency": "HUF",
      "availability": "https://schema.org/InStock",
      "url": `https://www.dolce-home.hu/vaszonkepek/${slug}`,
      "priceValidUntil": "2027-12-31", // Ajánlott mező, hogy meddig érvényes az ár
      
      // KIEGÉSZÍTÉS: Szállítási információk (pl. 1990 Ft, 2-3 munkanap)
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "1990",
          "currency": "HUF"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "1",
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": "1",
            "maxValue": "2",
            "unitCode": "DAY"
          }
        }
      },

      // KIEGÉSZÍTÉS: 14 napos törvényes visszaküldési szabályzat
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "HU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
        "merchantReturnDays": "14",
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerPaying"
      }
    }
  };

  // KIEGÉSZÍTÉS: Feltételes Értékelés kezelés
  // Ha a jövőben a 'product' objektumod tartalmazni fog értékelési adatokat a Supabase-ből,
  // ez a rész automatikusan beilleszti. Ha nincs értékelés (vagy 0), teljesen kihagyja, így nincs SC hiba!
  if (product && (product as any).rating_avg && (product as any).review_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": (product as any).rating_avg,
      "reviewCount": (product as any).review_count
    };
  }

  return (
    <>
      {/* Strukturált adat injektálása a HTML-be a Google botok számára */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* A kliensoldali komponens hívása. */}
      <TermekAdatlapClient 
        initialProduct={product} 
        initialVariants={allVariants || []} 
      />
    </>
  );
}