// app/egyedi-vaszonkep/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egyedi Vászonkép Készítés Saját Fotóból",
  description: "Töltsd fel saját fotódat, vágd méretre online tervezőnkkel, és rendeld meg prémium vászonképként! Tökéletes ajándék és modern fali dekoráció.",
  keywords: [
    "egyedi vászonkép", 
    "vászonkép saját fotóból", 
    "fénykép vászonra", 
    "online vászonkép tervező", 
    "vászonkép készítés"
  ],
  openGraph: {
    title: "Egyedi Vászonkép Tervező | Dolce Home",
    description: "Tervezd meg saját vászonképedet pillanatok alatt!",
    type: "website",
  },
};

export default function EgyediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}