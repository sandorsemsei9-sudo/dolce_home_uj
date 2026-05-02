"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

function TermekekContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>((["Összes"]));
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(150000);

  const currentPage = Number(searchParams.get("page")) || 1;
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

  const filteredProducts = useMemo(() => {
    let filtered = [...dbProducts];

    if (selectedCategory !== "Összes") {
      filtered = filtered.filter((p) => p.display_category === selectedCategory);
    }

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.filter((p) => p.display_price <= maxPrice);

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.display_price - b.display_price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.display_price - a.display_price);
    } else if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "hu"));
    }

    return filtered;
  }, [dbProducts, selectedCategory, search, sortBy, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;

    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, totalPages]);

  // 🔥 SZŰRÉS → PAGE = 1
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCategory, search, sortBy, maxPrice]);

  // 🔥 HA PAGE TÚL NAGY → VISSZA
  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    const el = document.getElementById("product-grid-start");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (type: string, value: any) => {
    if (type === "category") setSelectedCategory(value);
    if (type === "sort") setSortBy(value);
  };

  return (
    <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">
      <Navbar />

      <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8f3ef]/40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
            Válogatás
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2a211d] md:text-6xl italic leading-tight">
            Összes termék
          </h1>
        </div>
      </section>

      <div id="product-grid-start" />

      <section className="sticky top-[64px] z-30 border-y border-[#efebe6] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {dbCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilterChange("category", cat)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? "bg-[#2a211d] text-white"
                      : "bg-[#f8f3ef] text-[#7a665c] hover:bg-[#efebe6]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="bg-transparent text-sm font-bold text-[#2a211d] outline-none cursor-pointer"
              >
                <option value="default">Rendezés</option>
                <option value="price-asc">Ár: növekvő</option>
                <option value="price-desc">Ár: csökkenő</option>
                <option value="name-asc">Név: A-Z</option>
              </select>

              <span className="text-xs font-bold text-[#d17d58] uppercase tracking-widest border-l border-[#efebe6] pl-4">
                {filteredProducts.length} termék
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <article key={product.id} className="group relative flex flex-col">
                  <Link href={`/termekek/${product.slug}`} className="flex-grow">
                    <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[32px] border border-[#efebe6] bg-[#fdfbf9] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(42,33,29,0.08)]">
                      <div className="relative h-full w-full p-6 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-sm">
                        <Image
                          src={product.cover_image || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100 group-hover:opacity-100">
                        <Image
                          src={product.hover_image || "/images/mockup.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="px-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#d17d58]">
                        {product.display_category}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">{product.name}</h3>
                      <div className="mt-4 flex justify-between pt-4 border-t border-[#efebe6]/60">
                        <span>{formatPrice(product.display_price)}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-20 flex justify-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`h-10 w-10 rounded-full ${
                      currentPage === i + 1 ? "bg-black text-white" : ""
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Betöltés...</div>}>
      <TermekekContent />
    </Suspense>
  );
}