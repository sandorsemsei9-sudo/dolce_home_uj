// app/kapcsolat/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kapcsolat és Segítség",
  description: "Kérdésed van a rendelésről vagy egyedi vászonképekről? Írj nekünk, hívj minket, vagy böngészd a Gyakori Kérdéseket!",
};

export default function KapcsolatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}