import type { Metadata } from "next";
import "./globals.css";

// SEO Metaadatok definiálása
export const metadata: Metadata = {
  title: {
    default: "Vászonképek és Egyedi Faldekorációk | Dolce Home",
    template: "%s | Dolce Home", // Így ha a Kapcsolat oldalon vagy, a cím "Kapcsolat | Dolce Home" lesz
  },
  description: "Varázsold otthonod emlékeid színhelyévé! Egyedi vászonkép készítés saját fotóból, prémium minőségben és gyors szállítással a Dolce Home-tól.",
  keywords: [
    "vászonkép", 
    "egyedi vászonkép", 
    "vászonkép saját fotóból", 
    "faldekoráció", 
    "lakberendezés", 
    "prémium ajándék", 
    "Dolce Home"
  ],
  authors: [{ name: "Dolce Home" }],
  creator: "Dolce Home",
  metadataBase: new URL("https://dolce-home.hu"), // Cseréld le a saját domainre, ha meglesz
  openGraph: {
    title: "Dolce Home | Egyedi Vászonképek",
    description: "Készíttess prémium vászonképet saját fotóidból! Gyors gyártás, országos szállítás.",
    url: "https://dolce-home.hu",
    siteName: "Dolce Home",
    locale: "hu_HU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <head>
        {/* Ide jöhet majd a Google Analytics kód, ha szükséged lesz rá */}
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}