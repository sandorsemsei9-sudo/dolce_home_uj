import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

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
        {/* LCP Optimalizálás: A háttérkép előtöltése. 
            Fontos, hogy a href pontosan egyezzen a Hero-ban használt elérési úttal!
        */}
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