import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server"; 
import TermekAdatlapClient from "./TermekAdatlapClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. DINAMIKUS SEO MEGOLDÁS
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
    const productUrl = `https://www.dolce-home.hu/vaszonkepek/${slug}`;

    return {
      title: `${product.name} | Dolce Home`,
      description: productDescription,
      metadataBase: new URL("https://www.dolce-home.hu"),
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: `${product.name} | Dolce Home`,
        description: productDescription,
        url: productUrl,
        siteName: "Dolce Home",
        images: [{ url: product.cover_image, width: 1200, height: 630, alt: product.name }],
        locale: "hu_HU",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Dolce Home`,
        description: productDescription,
        images: [product.cover_image],
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

  // Termék adatok lekérdezése a textúrákkal és részek számával együtt
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

  // Kategória lekérdezése a kapcsolótáblából (tisztább típuskezeléssel)
  const { data: pcData } = await supabase
    .from("product_categories")
    .select("categories(name)")
    .eq("product_id", product.id);

  type CategoryRelation = { categories: { name: string } | null };
  const firstCategory = pcData?.[0] as unknown as CategoryRelation | undefined;
  const categoryName = firstCategory?.categories?.name || "Vászonkép";

  // Termék objektum összefűzése a kategóriával
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
  const shippingFee = numericPrice >= 25000 ? "0" : "1490";

  // Dinamikus érvényességi dátum a Schema.org számára
  const currentYear = new Date().getFullYear();
  const validUntilDate = `${currentYear + 1}-12-31`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.cover_image],
    "description": product.description || `${product.name} prémium minőségű vászonkép.`,
    "sku": product.slug || `DH-${product.id}`,
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
      "validFrom": `${currentYear}-01-01T00:00:00+01:00`,
      "priceValidUntil": validUntilDate,

      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": shippingFee,
          "currency": "HUF"
        },
        "shippingDestination": {
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

      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "HU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
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