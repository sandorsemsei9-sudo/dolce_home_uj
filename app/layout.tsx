import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    // SEO FÓKUSZ: Márkanév + Kulcsszavak az elején a Google rangsoroláshoz
    default: "Vászonképek és Egyedi Vászonkép Készítés | Dolce Home", 
    template: "%s | Dolce Home",
  },
  description:
  "Prémium vászonképek és egyedi vászonkép készítés saját fotóból. Modern faldekoráció, több méretben, gyors gyártással és országos szállítással.",
  keywords: [
    "vászonkép", 
    "vászonképek",
    "egyedi vászonkép", 
    "vászonkép saját fotóból", 
    "vászonkép rendelés",
    "faldekoráció", 
    "lakberendezés", 
    "Dolce Home"
  ],
  authors: [{ name: "Dolce Home" }],
  creator: "Dolce Home",
  // KRITIKUS: A metadataBase és az URL-ek már a www-s verzióra mutatnak a 301-es hiba elkerülése végett
  metadataBase: new URL("https://www.dolce-home.hu"), 
  openGraph: {
    title: "Dolce Home Vászonképek | Egyedi Faldekoráció",
    description: "Készíttess prémium vászonképet saját fotóidból! Gyors gyártás, országos szállítás.",
    url: "https://www.dolce-home.hu", 
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
        {/* LCP Optimalizálás: A hős (hero) háttérkép előtöltése a gyorsabb betöltésért */}
        <link 
          rel="preload" 
          as="image" 
          href="/hero-bg.webp" 
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}