import { Metadata } from "next";

// Ez a keret fogja körbevenni az összes egyedi termékoldaladat
export const metadata: Metadata = {
  // Alapértelmezett cím, ha a böngésző még tölt
  title: "Vászonkép Részletek | Dolce Home",
  description: "Fedezd fel egyedi, prémium minőségű vászonképeinket. Vakrámázott kivitel, UV-álló nyomat és gyors szállítás minden termékünkre.",
  keywords: [
    "vászonkép rendelés",
    "fali dekoráció",
    "prémium vászonnyomat",
    "lakberendezés",
    "egyedi ajándék"
  ],
  openGraph: {
    title: "Prémium Vászonképek - Dolce Home",
    description: "Minőségi fali dekorációk az otthonodba.",
    type: "website",
    images: [
      {
        url: "/images/og-termek-default.jpg", // Egy általános kép a termékeidről
        width: 1200,
        height: 630,
        alt: "Dolce Home Vászonképek",
      },
    ],
  },
};

export default function TermekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Itt jelenik meg a "use client" page.tsx tartalma */}
      {children}
    </section>
  );
}