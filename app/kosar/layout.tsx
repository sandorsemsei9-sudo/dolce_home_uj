// app/kosar/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kosár",
  description: "A kosarad tartalma a Dolce Home webshopban.",
  // Megkérjük a Google-t, hogy ezt az oldalt NE tegye be a keresőbe
  robots: {
    index: false,
    follow: false,
  },
};

export default function KosarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}