// app/penztar/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biztonságos Fizetés",
  description: "Add meg az adataidat a rendelés véglegesítéséhez.",
  // Szigorú tiltás a robotoknak
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PenztarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}