// app/penztar/siker/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Köszönjük a rendelést!",
  description: "A rendelésedet sikeresen rögzítettük.",
  // Szigorú tiltás: ne indexelje, ne kövesse a linkeket, és ne is tárolja gyorsítótárban (cache)
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SikerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}