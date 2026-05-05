import type { Metadata } from "next";
import "./globals.css";

// SEO Metaadatok definiálása
export const metadata: Metadata = {
  title: {
    default: "Vászonképek és Egyedi Faldekorációk | Dolce Home",
    template: "%s | Dolce Home",
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
  metadataBase: new URL("https://dolce-home.hu"),
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
        {/* Adatbázis kapcsolat felgyorsítása */}
        <link rel="preconnect" href="https://gbaduiirlnkaycrcdbpd.supabase.co" />
        <link rel="dns-prefetch" href="https://gbaduiirlnkaycrcdbpd.supabase.co" />
        
        {/* 
            A Főoldali Hero kép előtöltése. 
            FONTOS: A href-nél pontosan azt az utat add meg, ahol a WebP képed van!
            Ez segít eltüntetni az 5.8 mp-es piros LCP értéket.
        */}
        <link 
          rel="preload" 
          as="image" 
          href="/hero-image.webp" 
          type="image/webp"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}