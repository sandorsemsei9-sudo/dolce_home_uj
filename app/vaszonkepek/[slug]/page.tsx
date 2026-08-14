import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server"; 
import TermekAdatlapClient from "./TermekAdatlapClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. DINAMIKUS SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return { title: "Termék nem található" };

    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select("name, description, cover_image")
      .eq("slug", slug)
      .maybeSingle();

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
        images: [{ url: product.cover_image, width: 1200, height: 630, alt: product.name }],
      },
    };
  } catch (error) {
    console.error("Metadata hiba:", error);
    return { title: "Dolce Home" };
  }
}

// 2. FŐ OLDAL
export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const supabase = await createClient();

  // ITT PÓTOLTUK A HIÁNYZÓ MEZŐKET (texture_image_2, texture_image_3, parts_count)
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, description, cover_image, orientation, texture_image, texture_image_2, texture_image_3, parts_count, slug, hover_image")
    .eq("slug", slug)
    .maybeSingle();

  if (productError) {
    console.error("Supabase termék lekérdezési hiba:", productError.message);
  }

  if (!product) {
    notFound();
  }

  // Kategória lekérdezése külön a kapcsolótáblából
  const { data: pcData } = await supabase
    .from("product_categories")
    .select("categories(name)")
    .eq("product_id", product.id);

  const categoryName = pcData && pcData.length > 0 && (pcData[0] as any).categories?.name 
    ? (pcData[0] as any).categories.name 
    : "Vászonkép";

  // Hozzáadjuk a termék objektumhoz a kategória nevet
  const productWithCategory = {
    ...product,
    categories: { name: categoryName }
  };

  const { data: allVariants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  const productPrice = allVariants && allVariants.length > 0 ? allVariants[0].price : "5990";

// Árak és szállítási díj kiszámítása (25.000 Ft felett ingyenes)
  const numericPrice = Number(productPrice) || 0;
  const shippingFee = numericPrice >= 25000 ? "0" : "1490"; // <- Írd át a normál szállítási díjadra, ha nem 1490

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.cover_image],
    "description": product.description || `${product.name} prémium minőségű vászonkép.`,
    "sku": product.slug || `DH-${product.id}`, // <- ORVOSOLJA A GLOBÁLIS AZONOSÍTÓ HIBÁT
    "brand": {
      "@type": "Brand",
      "name": "Dolce Home"
    },
    "offers": {
      "@type": "Offer",
      "price": productPrice,
      "priceCurrency": "HUF",
      "availability": "https://schema.org/InStock",
      "url": `https://www.dolce-home.hu/vaszonkepek/${slug}`,
      "validFrom": "2026-01-01T00:00:00+01:00", // <- ORVOSOLJA A validFrom HIBÁT
      "priceValidUntil": "2027-12-31",

      // SZÁLLÍTÁSI FELTÉTELEK (shippingDetails & shippingDestination)
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": shippingFee,
          "currency": "HUF"
        },
        "shippingDestination": { // <- ORVOSOLJA A shippingDestination HIBÁT
          "@type": "DefinedRegion",
          "addressCountry": "HU"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          }
        }
      },

      // VISSZAKÜLDÉSI SZABÁLYZAT (hasMerchantReturnPolicy & returnPolicyCategory)
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "HU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow", // <- HELYES ENUM ÉRTÉK
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnShippingFees"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TermekAdatlapClient 
        initialProduct={productWithCategory} 
        initialVariants={allVariants || []} 
      />
    </>
  );
}