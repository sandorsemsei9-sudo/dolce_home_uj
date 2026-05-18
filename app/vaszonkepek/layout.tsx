import { Metadata } from "next";

export const metadata: Metadata = {
  // SEO FÓKUSZ: A kulcsszó az URL-ben és a címben is egyezik
  title: "Vászonképek | Modern és Klasszikus Fali Dekorációk",
  description: "Böngéssz prémium vászonkép kínálatunkban! Absztrakt, tájkép és modern fali dekorációk többféle méretben. Találd meg az otthonodhoz illő tökéletes képet.",
  keywords: [
    "vászonképek", 
    "képek", 
    "modern falikép", 
    "absztrakt vászonkép", 
    "nappali dekoráció", 
    "prémium faliképek",
    "vászonkép rendelés"
  ],
  
  // JAVÍTÁS: Kifejezett canonical URL beállítása a duplikációk elkerülésére
  alternates: {
    canonical: "https://www.dolce-home.hu/vaszonkepek",
  },

  // JAVÍTÁS: Keresőrobotok explicit utasítása
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
    title: "Vászonkép Katalógus | Dolce Home",
    description: "Fedezd felel prémium faldekorációs kollekciónkat és válaszd ki a kedvencedet!",
    url: "https://www.dolce-home.hu/vaszonkepek", 
    siteName: "Dolce Home",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        // JAVÍTÁS: Az OG képeknél a robotok a teljes (https://...) URL-t preferálják
        url: "https://www.dolce-home.hu/images/4evszak.png", 
        width: 1200,
        height: 630,
        alt: "Dolce Home Vászonkép Kínálat",
      },
    ],
  },
};

export default function VaszonkepekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}