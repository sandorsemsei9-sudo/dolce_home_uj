// app/egyedi-vaszonkep/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dolce-home.hu"),

  title:
    "Egyedi Vászonkép Saját Fotóból | Online Tervező | Dolce Home",

  description:
    "Készíts egyedi vászonképet saját fotódból online! Töltsd fel a képed, válassz méretet és formátumot, vágd méretre, majd nézd meg 3D-ben. Prémium művészvászon és gyors szállítás.",

  alternates: {
    canonical:
      "https://www.dolce-home.hu/egyedi-vaszonkep",
  },

  openGraph: {
    title:
      "Egyedi Vászonkép Saját Fotóból | Dolce Home",

    description:
      "Töltsd fel a fotód, válassz méretet, és tervezd meg saját vászonképedet online.",

    url:
      "https://www.dolce-home.hu/egyedi-vaszonkep",

    siteName: "Dolce Home",

    locale: "hu_HU",

    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt:
          "Dolce Home egyedi vászonkép saját fotóból",
      },
    ],
  },
};


const jsonLd = {
  "@context": "https://schema.org",

  "@type": "Product",

  "@id":
    "https://www.dolce-home.hu/egyedi-vaszonkep#product",

  name:
    "Egyedi Vászonkép Saját Fotóból",

  description:
    "Egyedi vászonkép készítés saját fotóból online tervezővel. Töltsd fel a fényképed, válassz méretet és formátumot, vágd méretre, majd tekintsd meg a vászonképet 3D előnézetben.",

  image: [
    "https://www.dolce-home.hu/images/mockup.webp",
  ],

  url:
    "https://www.dolce-home.hu/egyedi-vaszonkep",

  sku:
    "DH-EGYEDI-VASZONKEP-30X40",

  brand: {
    "@type": "Brand",
    name: "Dolce Home",
  },

  material:
    "Prémium művészvászon és fenyőfa vakráma",

  size:
    "30x40 cm",

  offers: {
    "@type": "Offer",

    url:
      "https://www.dolce-home.hu/egyedi-vaszonkep",

    price:
      7490,

    priceCurrency:
      "HUF",

    availability:
      "https://schema.org/InStock",

    itemCondition:
      "https://schema.org/NewCondition",

    shippingDetails: {
      "@type":
        "OfferShippingDetails",

      shippingRate: {
        "@type":
          "MonetaryAmount",

        value:
          1990,

        currency:
          "HUF",
      },

      shippingDestination: {
        "@type":
          "DefinedRegion",

        addressCountry:
          "HU",
      },

      deliveryTime: {
        "@type":
          "ShippingDeliveryTime",

        handlingTime: {
          "@type":
            "QuantitativeValue",

          minValue:
            1,

          maxValue:
            2,

          unitCode:
            "DAY",
        },

        transitTime: {
          "@type":
            "QuantitativeValue",

          minValue:
            1,

          maxValue:
            3,

          unitCode:
            "DAY",
        },
      },
    },

    hasMerchantReturnPolicy: {
      "@type":
        "MerchantReturnPolicy",

      applicableCountry:
        "HU",

      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",

      merchantReturnDays:
        14,

      returnMethod:
        "https://schema.org/ReturnByMail",

      returnFees:
        "https://schema.org/ReturnShippingFees",
    },
  },
};


export default function EgyediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {children}
    </>
  );
}