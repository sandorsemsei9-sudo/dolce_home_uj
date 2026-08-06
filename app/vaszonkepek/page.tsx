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

// Kedvezményes / eredeti ár párkereső a megadott szabályok alapján
function getOriginalPrice(currentPrice: number): number | null {
  switch (currentPrice) {
    case 4990: return 5990;
    case 5990: return 7490;
    case 7490: return 8990;
    case 7890: return 9990;
    case 9990: return 11990;
    case 11990: return 14990;
    default: return null;
  }
}

function TermekekContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>(["Összes"]);
  const [loading, setLoading] = useState(true);

  // FAQ lenyitás kezelése
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const selectedCategory = searchParams.get("category") || "Összes";
  const selectedOrientation = searchParams.get("orientation") || "all";
  const sortBy = searchParams.get("sort") || "default";
  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Termékek lekérdezése tisztán, a közvetlen kategória-join nélkül
        const { data: pData, error: pError } = await supabase
          .from("products")
          .select(`
            *,
            product_variants(*)
          `)
          .order("created_at", { ascending: false });

        if (pError) {
          console.error("Hiba a termékek lekérdezésekor:", pError.message);
        }

        // 2. Kategória kapcsolatok lekérdezése a product_categories táblából
        const { data: pcData } = await supabase
          .from("product_categories")
          .select("product_id, category_id, categories(name)");

        if (pData) {
          const processed = pData.map((p) => {
            const variantPrices = p.product_variants?.map((v: any) => v.price) || [];
            const variantSizes = p.product_variants?.map((v: any) => v.size_name) || [];

            // Megkeressük a termékhez tartozó kategóriákat a kapcsolótáblából
            const productCats = pcData
              ?.filter((pc: any) => pc.product_id === p.id)
              .map((pc: any) => pc.categories?.name)
              .filter(Boolean) || [];

            const primaryCategory = productCats.length > 0 ? productCats[0] : "Vászonkép";

            return {
              ...p,
              display_price: variantPrices.length > 0 ? Math.min(...variantPrices) : 0,
              display_sizes: variantSizes,
              display_category: primaryCategory,
              all_categories: productCats,
            };
          });

          setDbProducts(processed);
        }

        // 3. Kategória lista betöltése a szűrőhöz
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

  const cleanedSelectedCategory = useMemo(() => {
    return decodeURIComponent(selectedCategory.replace(/\+/g, " ")).toLowerCase().trim();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = [...dbProducts];

    // 1. Kategória szűrés
    if (cleanedSelectedCategory !== "összes") {
      filtered = filtered.filter((p) => {
        const displayCat = p.display_category ? p.display_category.toLowerCase().trim() : "";
        const allCats = p.all_categories ? p.all_categories.map((c: string) => c.toLowerCase().trim()) : [];

        return displayCat === cleanedSelectedCategory || allCats.includes(cleanedSelectedCategory);
      });
    }

    // 2. Irány / Formátum szűrés
    if (selectedOrientation !== "all") {
      filtered = filtered.filter((p) => {
        return p.orientation === selectedOrientation;
      });
    }

    // 3. Rendezés
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.display_price - b.display_price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.display_price - a.display_price);
    } else if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "hu"));
    }

    return filtered;
  }, [dbProducts, cleanedSelectedCategory, selectedOrientation, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, totalPages]);

  const updateParams = (newParams: Record<string, string | number>, shouldScrollToGrid: boolean = false) => {
    const params = new URLSearchParams();
    
    searchParams.forEach((value, key) => {
      if (key === "category" && newParams.category) return;
      if (key === "orientation" && newParams.orientation) return;
      if (key === "sort" && newParams.sort) return;
      if (key === "page" && (newParams.category || newParams.orientation || newParams.sort || newParams.page)) return;
      params.set(key, value);
    });
    
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    if (newParams.category || newParams.orientation || newParams.sort) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    if (shouldScrollToGrid) {
      const el = document.getElementById("product-grid-start");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const faqItems = [
    {
      question: "Mennyi a szállítási idő?",
      answer: "A legtöbb vászonképet 2–4 munkanapon belül elkészítjük és kiszállítjuk, így a rendelés rövid időn belül megérkezik hozzád. Egyedi gyártású vászonképek esetén az elkészítési és szállítási idő általában 3–5 munkanap",
    },
    {
      question: "Egyedi képeknél milyen felbontású kép szükséges a feltöltéshez?",
      answer: "A tökéletes végeredmény érdekében legalább 2-3 MB méretű, nagy felbontású JPEG vagy PNG fájlt javasolunk. Rendszerünk jelzi, ha a kép minősége túl alacsony lenne.",
    },
    {
      question: "Van lehetőség utánvétes fizetésre?",
      answer: "Természetesen! A futárnál készpénzzel és bankkártyával is fizethetsz a csomag átvételekor. Emellett biztonságos online bankkártyás fizetést is biztosítunk.",
    },
  {
    question: "Hogyan tudom megnézni a képet a saját falamon?",
    answer: "Mobil eszközön (telefonon vagy tableten) a 3D nézeten belül a kiterjesztett valóság (AR) funkció segítségével közvetlenül a saját szobád falára vetítheted a kiválasztott méretet."
  }
  ];

  return (
    <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">
      <style jsx global>{`
        .glass-3d-badge {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <Navbar />

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8f3ef]/30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
            Válogatás
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2a211d] md:text-6xl italic leading-tight">
            Vászonképek – Modern és Egyedi Fali Dekorációk
          </h1>
        </div>
      </section>

      <div id="product-grid-start" className="scroll-mt-32" />

      {/* --- SZŰRŐK ÉS RENDEZÉS SÁV --- */}
      <section className="sticky top-[64px] z-30 border-y border-[#efebe6] bg-[#fdfbf9]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4">
            
            {/* 1. Sor: Kategóriák */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {dbCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParams({ category: cat }, true)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    cleanedSelectedCategory === cat.toLowerCase().trim()
                        ? "bg-[#d17d58] text-white shadow-sm"
                        : "bg-white border border-[#efebe6] text-[#7a665c] hover:border-[#d17d58]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 2. Sor: Irány/Formátum szűrők + Rendezés + Találatok száma */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-[#efebe6]/60">
              
              {/* Formátum / Irány gombok */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a7f76] mr-1">Formátum:</span>
                {[
                  { label: "Összes", value: "all" },
                  { label: "Négyzet", value: "square" },
                  { label: "Álló", value: "portrait" },
                  { label: "Fekvő", value: "landscape" },
                  { label: "Panoráma", value: "panorama" },
                  { label: "Többrészes", value: "tobbrészes" },
                ].map((orient) => (
                  <button
                    key={orient.value}
                    onClick={() => updateParams({ orientation: orient.value }, true)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedOrientation === orient.value
                        ? "bg-[#d17d58] text-white shadow-sm"
                        : "bg-white border border-[#efebe6] text-[#7a665c] hover:border-[#d17d58]"
                    }`}
                  >
                    {orient.label}
                  </button>
                ))}
              </div>

              {/* Rendezés */}
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
              </div>

            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-[#7a665c]">Nincs találat a megadott szűrési feltételekkel.</p>
                <button 
                  onClick={() => updateParams({ category: "Összes", orientation: "all", sort: "default" }, true)}
                  className="mt-4 px-6 py-2.5 bg-[#2a211d] text-white text-xs font-bold uppercase rounded-full"
                >
                  Szűrők törlése
                </button>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => {
                  const originalPrice = getOriginalPrice(product.display_price);

                  return (
                    <article key={product.id} className="group flex flex-col relative">
                      
                      <Link 
                        href={`/vaszonkepek/${product.slug}`} 
                        className="relative mb-8 block aspect-[4/5] overflow-hidden rounded-[48px] border border-[#efebe6] bg-white transition-all duration-500 hover:shadow-[0_30px_60px_rgba(42,33,29,0.08)]"
                      >

                        <div className="absolute right-7 top-7 z-20 flex flex-col items-center gap-2 pointer-events-none">
                          <div className="glass-3d-badge relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110">
                            <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100">
                              <path 
                                d="M25 35 C 35 20, 65 20, 75 35 M 75 35 L 75 22 M 75 35 L 62 35" 
                                stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" 
                              />
                              <path 
                                d="M75 65 C 65 80, 35 80, 25 65 M 25 65 L 25 78 M 25 65 L 38 65" 
                                stroke="#2a211d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" 
                              />
                            </svg>
                            <span className="text-sm font-black tracking-tighter text-[#2a211d]">3D</span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2a211d] opacity-0 transition-opacity duration-300 group-hover:opacity-40">
                            Interaktív
                          </span>
                        </div>

                        <div className="relative h-full w-full p-8 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-md">
                          <Image
                            src={product.cover_image || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                            className="object-cover drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]"
                          />
                        </div>

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

                      <div className="px-2 flex-grow">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d17d58]">
                          {product.display_category}
                        </p>
                        <Link href={`/vaszonkepek/${product.slug}`}>
                          <h3 className="mt-3 text-xl font-bold text-[#2a211d] transition-colors hover:text-[#d17d58]">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="mt-1 text-[11px] font-medium text-[#8a7f76]">
                           Több méretben elérhető
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-[#efebe6] pt-6">
                          <div className="flex flex-col">
                            {originalPrice && (
                              <span className="text-xs font-bold text-[#d17d58] line-through">
                                {formatPrice(originalPrice)} Ft
                              </span>
                            )}
                            <p className="text-lg font-black text-[#2a211d]">
                              {formatPrice(product.display_price)} Ft <span className="text-[10px] font-bold text-[#8a7f76] uppercase tracking-tighter">-tól</span>
                            </p>
                          </div>
                          
                          <Link 
                            href={`/vaszonkepek/${product.slug}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#efebe6] text-[#2a211d] transition-all duration-300 hover:bg-[#2a211d] hover:text-white hover:border-[#2a211d] hover:scale-110"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

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

      {/* --- SEO & INFO SZEKCIÓ --- */}
      <section className="border-t border-[#efebe6] bg-[#f8f3ef]/40 py-20">
        <div className="mx-auto max-w-5xl px-6 space-y-16">
          
          <div className="space-y-6 text-[#7a665c] leading-relaxed text-sm md:text-base">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a211d] italic">
              Modern vászonképek otthonod stílusához
            </h2>
            <p>
              A <strong>Dolce Home vászonképei</strong> ideális választást jelentenek,
              ha gyorsan és egyszerűen szeretnéd feldobni otthonod vagy munkahelyed
              hangulatát egy elegáns fali dekorációval. Webáruházunkban gondosan
              válogatott, előregyártott vászonképek közül választhatsz, amelyek
              modern megjelenésükkel tökéletesen illeszkednek különböző enteriőrökbe.            </p>
            <p>
              Válogatott vászonkép kollekcióink között megtalálhatók a modern,
              elegáns és időtálló faldekorációk. Kínálatunkban absztrakt minták,
              természetes hangulatú képek, virágos dekorációk, állatos motívumok és
              minimalista dizájnok egyaránt elérhetők. Minden vászonkép célja, hogy
              stílusos kiegészítője legyen otthonodnak, és harmonikusan illeszkedjen
              a választott tér hangulatához.          </p>
            <p className="font-medium text-[#2a211d]">
              Vászonképeink kiváló minőségű művészvászonra készülnek, amelyet stabil
              fa vakrámára feszítünk. A részletgazdag nyomtatásnak köszönhetően a
              képek élénk színekkel és tartós megjelenéssel díszítik a falakat.
              A kész vászonkép azonnal kihelyezhető, így nincs szükség külön
              keretezésre vagy további előkészítésre.            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start pt-6 border-t border-[#efebe6]">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#2a211d]">Miért népszerű választás a vászonkép dekoráció?</h3>
              <ul className="space-y-3 text-sm text-[#7a665c]">
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Gyorsan és egyszerűen megváltoztatja egy helyiség hangulatát</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Egyedi stílust és karaktert ad az üres falfelületeknek</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Modern és klasszikus lakberendezési stílusokhoz is passzol</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Tartós dekoráció, amely hosszú éveken át díszíti az otthont</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Festményekhez képest kedvezőbb árú alternatíva</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✔️</span> <span><strong>Keretezés nélkül, kész állapotban használható</strong></span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#efebe6] shadow-sm">
              <h3 className="text-xl font-bold text-[#2a211d]">Technikai részletek</h3>
              <ul className="space-y-2 text-xs md:text-sm text-[#7a665c]">
                <li><strong>Anyag:</strong> 360g/m² súlyú, művészi texturált vászon alapanyag</li>
                <li><strong>Nyomtatás:</strong> UV-álló pigment alapú nyomtatás, fakulásmentes színek</li>
                <li><strong>Keret:</strong> 2 cm vastag, szárított fenyőfa vakráma keret</li>
                <li><strong>Felszerelés:</strong> Falra akasztható, beépített akasztóval érkezik</li>
                <li><strong>Tartósság:</strong> Hosszú élettartamú nyomat, amely megőrzi élénk színeit</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#efebe6]">
            <h3 className="text-2xl font-bold text-[#2a211d] mb-8 text-center md:text-left">
              Gyakran ismételt kérdések
            </h3>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index} 
                    className="bg-white border border-[#efebe6] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left font-bold text-[#2a211d] hover:text-[#d17d58] transition-colors"
                    >
                      <span>{item.question}</span>
                      <span className={`transform transition-transform duration-300 text-xl font-normal text-[#d17d58] ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-[#7a665c] leading-relaxed border-t border-[#f8f3ef] pt-4">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
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