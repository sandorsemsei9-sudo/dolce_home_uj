"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createClient } from "@/lib/supabase/client";

// --- SEGÉDFÜGGVÉNYEK ---
function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

export default function TermekekPage() {
  const supabase = createClient();
  
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>(["Összes"]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(150000); 

  const [showFilters, setShowFilters] = useState(false);

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
          .eq('is_active', true);
        
        if (pData) {
          const processed = pData.map(p => {
            const variantPrices = p.product_variants?.map((v: any) => v.price) || [];
            const variantSizes = p.product_variants?.map((v: any) => v.size_name) || [];
            return {
              ...p,
              display_price: variantPrices.length > 0 ? Math.min(...variantPrices) : 0,
              display_sizes: variantSizes,
              display_category: p.categories?.name || "Vászonkép"
            };
          });
          setDbProducts(processed);
        }

        const { data: cData } = await supabase.from("categories").select("name");
        if (cData) setDbCategories(["Összes", ...cData.map(c => c.name)]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    let filtered = [...dbProducts];
    if (selectedCategory !== "Összes") {
      filtered = filtered.filter(p => p.display_category === selectedCategory);
    }
    if (search.trim()) {
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    }
    filtered = filtered.filter(p => p.display_price <= maxPrice);

    if (sortBy === "price-asc") filtered.sort((a, b) => a.display_price - b.display_price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.display_price - a.display_price);
    else if (sortBy === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name, "hu"));

    return filtered;
  }, [dbProducts, selectedCategory, search, sortBy, maxPrice]);

  return (
    <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">
      <Navbar />

      {/* FEJLÉC SZAKASZ */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8f3ef]/40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
            Válogatás
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2a211d] md:text-6xl italic leading-tight">
            Összes termék
          </h1>
          <p className="mt-6 max-w-xl text-[#7a665c] leading-relaxed opacity-80">
            Fedezd fel prémium vászonképeinket, melyek modern stílust és melegséget hoznak otthonodba.
          </p>
        </div>
      </section>

      {/* INTERAKTÍV ESZKÖZÖK (SZŰRÉS & KERESÉS) */}
      <section className="sticky top-[64px] z-30 border-y border-[#efebe6] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Kategóriák - Csúsztatható "pill" gombok */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {dbCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all
                    ${selectedCategory === cat 
                      ? 'bg-[#2a211d] text-white' 
                      : 'bg-[#f8f3ef] text-[#7a665c] hover:bg-[#efebe6]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
               {/* Rendezés választó */}
               <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#2a211d] outline-none cursor-pointer"
               >
                 <option value="default">Rendezés</option>
                 <option value="price-asc">Ár: növekvő</option>
                 <option value="price-desc">Ár: csökkenő</option>
                 <option value="name-asc">Név: A-Z</option>
               </select>

               {/* Találatok száma */}
               <span className="text-xs font-bold text-[#d17d58] uppercase tracking-widest border-l border-[#efebe6] pl-4">
                 {filteredProducts.length} termék
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* TERMÉK GRID */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group relative flex flex-col">
                <Link href={`/termekek/${product.slug}`} className="flex-grow">
                  
                  {/* KÉPKONTÉNER - MOCKUP HOVERREL */}
                  <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[32px] border border-[#efebe6] bg-[#fdfbf9] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(42,33,29,0.08)]">
                    
                    {/* Eredeti kép */}
                    <div className="relative h-full w-full p-6 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-sm">
                      <Image
                        src={product.cover_image || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Mockup kép (hoverre) */}
                    <div className="absolute inset-0 h-full w-full opacity-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100 group-hover:opacity-100">
                      <Image
                        src={product.hover_image || "/images/mockup.jpg"}
                        alt={`${product.name} mockup`}
                        fill
                        className="object-cover"
                      />
                    </div>

                  </div>

                  {/* ADATOK */}
                  <div className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#d17d58]">
                      {product.display_category}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#2a211d] transition-colors group-hover:text-[#d17d58]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#8a7f76]">
                      {product.display_sizes?.slice(0, 3).join(" • ")} cm
                    </p>
                    
                    <div className="mt-4 flex items-baseline justify-between pt-4 border-t border-[#efebe6]/60">
                      <span className="text-xl font-black text-[#2a211d]">
                        {formatPrice(product.display_price)} -tól
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8f3ef] text-[#2a211d] transition-all group-hover:bg-[#d17d58] group-hover:text-white">
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                         </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Üres állapot */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#7a665c]">Nem találtunk a keresésnek megfelelő terméket.</p>
            <button 
              onClick={() => {setSelectedCategory("Összes"); setSearch(""); setMaxPrice(150000);}}
              className="mt-4 text-sm font-bold text-[#d17d58] underline uppercase tracking-widest"
            >
              Szűrők törlése
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}