import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kapcsolat és Segítség",
  description:
    "Kérdésed van a rendelésről vagy egyedi vászonképekről? Írj nekünk, hívj minket, vagy böngészd a Gyakori Kérdéseket!",

  alternates: {
    canonical: "https://www.dolce-home.hu/kapcsolat",
  },
};

export default function KapcsolatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}