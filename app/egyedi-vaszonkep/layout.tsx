// app/egyedi-vaszonkep/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egyedi Vászonkép Készítés Saját Fotóból | Online Tervező",
  description: "Készíts prémium vászonképet saját fotódból! Online tervezőnkkel méretre vághatod a képedet. 3D előnézet, osztrák fenyő vakráma és gyors szállítás.",
  keywords: [
    "egyedi vászonkép", 
    "vászonkép saját fotóból", 
    "fénykép vászonra", 
    "online vászonkép tervező", 
    "vászonkép készítés",
    "vászonkép nyomtatás",
    "fali dekoráció"
  ],
  alternates: {
    canonical: "https://www.dolce-home.hu/egyedi-vaszonkep",
  },
  openGraph: {
    title: "Egyedi Vászonkép Tervező | Dolce Home",
    description: "Töltsd fel a fotód, és tervezd meg saját vászonképedet online!",
    url: "https://dolce-home.hu/egyedi-vaszonkep",
    siteName: "Dolce Home",
    locale: "hu_HU",
    type: "website",
    // Ha van egy jó fotód a termékről a public mappában, ide írd be a nevét:
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Dolce Home egyedi vászonkép tervező",
      },
    ],
  },
};

export default function EgyediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}