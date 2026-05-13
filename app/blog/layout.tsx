// app/blog/layout.tsx
import Navbar from "../components/navbar"; // Ellenőrizd, hogy az elérési út pontos-e!
import Footer from "../components/footer"; // Ha van footer komponensed

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#fcfaf8] min-h-screen flex flex-col">
      {/* Navigációs sáv */}
      <Navbar />

      {/* 
        A tartalom. 
        A pt-24 (padding-top) azért kell, hogy ha a Navbarod 'fixed' pozíciójú, 
        akkor ne takarja el a blog elejét.
      */}
      <main className="flex-grow max-w-7xl mx-auto px-6 pt-24 pb-12 w-full">
        {children}
      </main>

      {/* Lábléc */}
      <Footer />
    </div>
  );
}