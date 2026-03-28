// app/termekek/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vászonkép Galéria | Modern és Klasszikus Fali Dekorációk",
  description: "Böngéssz prémium vászonkép kínálatunkban! Absztrakt, tájkép, és modern fali dekorációk többféle méretben. Találd meg az otthonodhoz illő tökéletes képet.",
  keywords: [
    "vászonkép galéria", 
    "modern falikép", 
    "absztrakt vászonkép", 
    "nappali dekoráció", 
    "prémium faliképek",
    "lakberendezési kiegészítők"
  ],
  openGraph: {
    title: "Vászonkép Katalógus - Dolce Home",
    description: "Fedezd fel faldekorációs kollekciónkat!",
    type: "website",
    images: ["/images/og-katalogus.jpg"], // Ideális esetben egy kép a kínálatról
  },
};

export default function TermekekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}