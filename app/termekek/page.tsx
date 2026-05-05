"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price);
}

function TermekekContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>(["Összes"]);
  const [loading, setLoading] = useState(true);

  // Állapotok kiolvasása URL-ből (visszalépés-barát megoldás)
  const currentPage = Number(searchParams.get("page")) || 1;
  const selectedCategory = searchParams.get("category") || "Összes";
  const sortBy = searchParams.get("sort") || "default";
  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: pData } = await supabase
          .from("products")
          .select(`
            *,
            categories(name),
            product_variants(*)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (pData) {
          const processed = pData.map((p) => {
            const variantPrices = p.product_variants?.map((v: any) => v.price) || [];
            const variantSizes = p.product_variants?.map((v: any) => v.size_name) || [];

            return {
              ...p,
              display_price: variantPrices.length > 0 ? Math.min(...variantPrices) : 0,
              display_sizes: variantSizes,
              display_category: p.categories?.name || "Vászonkép",
            };
          });

          setDbProducts(processed);
        }

        const { data: cData } = await supabase.from("categories").select("name");
        if (cData) {
          setDbCategories(["Összes", ...cData.map((c) => c.name)]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  // Szűrés és rendezés
  const filteredProducts = useMemo(() => {
    let filtered = [...dbProducts];

    if (selectedCategory !== "Összes") {
      filtered = filtered.filter((p) => p.display_category === selectedCategory);
    }

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.display_price - b.display_price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.display_price - a.display_price);
    } else if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "hu"));
    }

    return filtered;
  }, [dbProducts, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, totalPages]);

  // URL frissítő függvény - EZ JAVÍTJA A GÖRGETÉST
  const updateParams = (newParams: Record<string, string | number>, shouldScrollToGrid: boolean = false) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    if (newParams.category || newParams.sort) {
      params.set("page", "1");
    }

    // A scroll: false meggátolja, hogy a Next.js rángassa az ablakot
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Csak ha lapozunk, akkor vigye a szemeket a grid elejére
    if (shouldScrollToGrid) {
      const el = document.getElementById("product-grid-start");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">
      <Navbar />

      {/* ELEGÁNS HEADER - Eredeti stílus */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8f3ef]/30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
            Válogatás
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2a211d] md:text-6xl italic leading-tight">
            Összes termék
          </h1>
        </div>
      </section>

      {/* HORGONY A GÖRGETÉSHEZ */}
      <div id="product-grid-start" className="scroll-mt-32" />

      {/* STICKY SZŰRŐK - Eredeti stílus */}
      <section className="sticky top-[64px] z-30 border-y border-[#efebe6] bg-[#fdfbf9]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {dbCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParams({ category: cat }, true)}
                  className={`whitespace-nowrap rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#2a211d] text-white shadow-lg shadow-[#2a211d]/10"
                      : "bg-white border border-[#efebe6] text-[#7a665c] hover:border-[#d17d58] hover:text-[#d17d58]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a7f76]">Rendezés:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value }, true)}
                  className="bg-transparent text-xs font-bold text-[#2a211d] outline-none cursor-pointer hover:text-[#d17d58]"
                >
                  <option value="default">Legújabbak</option>
                  <option value="price-asc">Ár: növekvő</option>
                  <option value="price-desc">Ár: csökkenő</option>
                  <option value="name-asc">Név: A-Z</option>
                </select>
              </div>

              <span className="text-[10px] font-bold text-[#d17d58] uppercase tracking-[0.2em] border-l border-[#efebe6] pl-6">
                {filteredProducts.length} darab
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TERMÉK GRID - Eredeti komplex kártya design */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <article key={product.id} className="group flex flex-col">
                  {/* KÉP KONTÉNER - rounded-[48px] + hover effektek */}
                  <Link 
                    href={`/termekek/${product.slug}`} 
                    className="relative mb-8 block aspect-[4/5] overflow-hidden rounded-[48px] border border-[#efebe6] bg-white transition-all duration-500 hover:shadow-[0_30px_60px_rgba(42,33,29,0.08)]"
                  >
                    {/* Alap kép */}
                    <div className="relative h-full w-full p-8 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-md">
                      <Image
                        src={product.cover_image || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                        className="object-cover drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]"
                      />
                    </div>

                    {/* Hover kép / Mockup */}
                    <div className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 ease-in-out scale-105 group-hover:opacity-100 group-hover:scale-100">
                      <Image
                        src={product.hover_image || "/images/mockup.jpg"}
                        alt={`${product.name} mockup`}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* TERMÉK ADATOK */}
                  <div className="px-2 flex-grow">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d17d58]">
                      {product.display_category}
                    </p>
                    <Link href={`/termekek/${product.slug}`}>
                      <h3 className="mt-3 text-xl font-bold text-[#2a211d] transition-colors hover:text-[#d17d58]">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-[11px] font-medium text-[#8a7f76]">
                       Több méretben elérhető
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-[#efebe6] pt-6">
                      <p className="text-lg font-black text-[#2a211d]">
                        {formatPrice(product.display_price)} Ft <span className="text-[10px] font-bold text-[#8a7f76] uppercase tracking-tighter">-tól</span>
                      </p>
                      
                      <Link 
                        href={`/termekek/${product.slug}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#efebe6] text-[#2a211d] transition-all duration-300 hover:bg-[#2a211d] hover:text-white hover:border-[#2a211d] hover:scale-110"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* MODERNEBB LAPOZÓ - Eredeti design */}
            {totalPages > 1 && (
              <div className="mt-24 flex justify-center items-center gap-3">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParams({ page: i + 1 }, true)}
                    className={`h-12 w-12 rounded-full text-xs font-bold transition-all duration-300 ${
                      currentPage === i + 1 
                        ? "bg-[#2a211d] text-white shadow-xl shadow-[#2a211d]/20 scale-110" 
                        : "bg-white border border-[#efebe6] text-[#7a665c] hover:border-[#d17d58]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function TermekekPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
      </div>
    }>
      <TermekekContent />
    </Suspense>
  );
}