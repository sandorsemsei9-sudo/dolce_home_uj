"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type Category = {
  id: string | number;
  name: string;
};

type Props = {
  products: any[];
  categories: Category[];
  activeCategoryName?: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU").format(price);
}

function getOriginalPrice(currentPrice: number): number | null {
  switch (currentPrice) {
    case 4990: return 5990;
    case 5990: return 7490;
    case 6990: return 7990;
    case 7490: return 8990;
    case 7890: return 9990;
    case 7990: return 8990;
    case 8990: return 9990;
    case 9990: return 11990;
    case 11490: return 13990;
    case 11990: return 14990;
    case 12990: return 14990;
    case 14990: return 16990;
    case 16990: return 19990;
    case 21990: return 24990;
    case 26990: return 29990;
    default: return null;
  }
}

function slugify(text: string) {
  return text
    .replace(/\s+vászonképek?$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductCollectionClient({
  products,
  categories,
  activeCategoryName,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPage = Number(searchParams.get("page"));

  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0
      ? Math.floor(rawPage)
      : 1;

  const selectedOrientation =
    searchParams.get("orientation") || "all";

  const sortBy =
    searchParams.get("sort") || "default";

  const itemsPerPage = 12;

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // TÁJOLÁS
    if (selectedOrientation !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.orientation === selectedOrientation
      );
    }

    // RENDEZÉS
    if (sortBy === "price-asc") {
      filtered.sort(
        (a, b) =>
          Number(a.display_price) -
          Number(b.display_price)
      );
    } else if (sortBy === "price-desc") {
      filtered.sort(
        (a, b) =>
          Number(b.display_price) -
          Number(a.display_price)
      );
    } else if (sortBy === "name-asc") {
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name, "hu")
      );
    } else {
      filtered.sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0)
      );
    }

    return filtered;
  }, [
    products,
    selectedOrientation,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedProducts = useMemo(() => {
    const startIndex =
      (safePage - 1) * itemsPerPage;

    return filteredProducts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [
    filteredProducts,
    safePage,
  ]);

  function updateParams(
    newParams: Record<string, string | number>,
    scrollToProducts = true
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    Object.entries(newParams).forEach(
      ([key, value]) => {
        const stringValue =
          String(value);

        // Alapértékeknél töröljük a queryt
        if (
          (key === "orientation" &&
            stringValue === "all") ||
          (key === "sort" &&
            stringValue === "default") ||
          (key === "page" &&
            stringValue === "1")
        ) {
          params.delete(key);
        } else {
          params.set(
            key,
            stringValue
          );
        }
      }
    );

    // Szűrés/rendezés váltásakor 1. oldal
    if (
      "orientation" in newParams ||
      "sort" in newParams
    ) {
      params.delete("page");
    }

    const query =
      params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );

    if (scrollToProducts) {
      setTimeout(() => {
        document
          .getElementById(
            "product-grid-start"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    }
  }

  function resetFilters() {
    router.push(
      pathname,
      {
        scroll: false,
      }
    );
  }

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .glass-3d-badge {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div
        id="product-grid-start"
        className="scroll-mt-32"
      />

      {/* SZŰRŐSÁV */}

      <section className="sticky top-[64px] z-30 border-y border-[#efebe6] bg-[#fdfbf9]/90 backdrop-blur-md">

        <div className="mx-auto max-w-7xl px-6 py-4">

          <div className="flex flex-col gap-4">

            {/* KATEGÓRIÁK */}

            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">

              <Link
                href="/vaszonkepek"
                className={`whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                  !activeCategoryName
                    ? "bg-[#d17d58] text-white shadow-sm"
                    : "border border-[#efebe6] bg-white text-[#7a665c] hover:border-[#d17d58]"
                }`}
              >
                Összes
              </Link>

              {categories.map(
                (category) => {
                  const categorySlug =
                    slugify(
                      category.name
                    );

                  const active =
                    activeCategoryName ===
                    category.name;

                  return (
                    <Link
                      key={
                        category.id
                      }
                      href={`/vaszonkepek/kategoria/${categorySlug}`}
                      className={`whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                        active
                          ? "bg-[#d17d58] text-white shadow-sm"
                          : "border border-[#efebe6] bg-white text-[#7a665c] hover:border-[#d17d58]"
                      }`}
                    >
                      {
                        category.name
                      }
                    </Link>
                  );
                }
              )}

            </div>


            {/* TÁJOLÁS + RENDEZÉS */}

            <div className="flex flex-col gap-4 border-t border-[#efebe6]/60 pt-2 md:flex-row md:items-center md:justify-between">

              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">

                <span className="mr-1 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#8a7f76]">
                  Formátum:
                </span>

                {[
                  {
                    label: "Összes",
                    value: "all",
                  },
                  {
                    label: "Álló",
                    value: "portrait",
                  },
                  {
                    label: "Fekvő",
                    value: "landscape",
                  },
                  {
                    label: "Panoráma",
                    value: "panorama",
                  },
                  {
                    label: "Többrészes",
                    value: "three-piece",
                  },
                ].map(
                  (orientation) => (
                    <button
                      key={
                        orientation.value
                      }
                      onClick={() =>
                        updateParams(
                          {
                            orientation:
                              orientation.value,
                          }
                        )
                      }
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        selectedOrientation ===
                        orientation.value
                          ? "bg-[#d17d58] text-white shadow-sm"
                          : "border border-[#efebe6] bg-white text-[#7a665c] hover:border-[#d17d58]"
                      }`}
                    >
                      {
                        orientation.label
                      }
                    </button>
                  )
                )}

              </div>


              {/* RENDEZÉS */}

              <div className="flex items-center justify-between gap-5">

                <span className="text-xs font-medium text-[#8a7f76]">
                  {
                    filteredProducts.length
                  }{" "}
                  termék
                </span>

                <div className="flex items-center gap-2">

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a7f76]">
                    Rendezés:
                  </span>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      updateParams(
                        {
                          sort: e
                            .target
                            .value,
                        }
                      )
                    }
                    className="cursor-pointer bg-transparent text-xs font-bold text-[#2a211d] outline-none hover:text-[#d17d58]"
                  >
                    <option value="default">
                      Alapértelmezett
                    </option>

                    <option value="price-asc">
                      Ár: növekvő
                    </option>

                    <option value="price-desc">
                      Ár: csökkenő
                    </option>

                    <option value="name-asc">
                      Név: A-Z
                    </option>
                  </select>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* TERMÉKLISTA */}

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">

        {filteredProducts.length ===
        0 ? (

          <div className="py-20 text-center">

            <p className="text-lg font-medium text-[#7a665c]">
              Nincs találat a megadott szűrési feltételekkel.
            </p>

            <button
              onClick={
                resetFilters
              }
              className="mt-5 rounded-full bg-[#2a211d] px-6 py-2.5 text-xs font-bold uppercase text-white"
            >
              Szűrők törlése
            </button>

          </div>

        ) : (

          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {paginatedProducts.map(
              (product) => {
                const price =
                  Number(
                    product.display_price
                  ) || 0;

                const originalPrice =
                  getOriginalPrice(
                    price
                  );

                return (
                  <article
                    key={
                      product.id
                    }
                    className="group relative flex flex-col"
                  >

                    <Link
                      href={`/vaszonkepek/${product.slug}`}
                      className="relative mb-8 block aspect-[4/5] overflow-hidden rounded-[15px] border border-[#efebe6] bg-white transition-all duration-500 hover:shadow-[0_30px_60px_rgba(42,33,29,0.08)]"
                    >

                      {/* 3D BADGE */}

                      <div className="pointer-events-none absolute right-7 top-7 z-20 flex flex-col items-center gap-2">

                        <div className="glass-3d-badge relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110">

                          <svg
                            className="absolute inset-0 h-full w-full opacity-60"
                            viewBox="0 0 100 100"
                          >
                            <path
                              d="M25 35 C 35 20, 65 20, 75 35 M 75 35 L 75 22 M 75 35 L 62 35"
                              stroke="#2a211d"
                              strokeWidth="4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M75 65 C 65 80, 35 80, 25 65 M 25 65 L 25 78 M 25 65 L 38 65"
                              stroke="#2a211d"
                              strokeWidth="4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span className="text-sm font-black tracking-tighter text-[#2a211d]">
                            3D
                          </span>

                        </div>

                      </div>


                      {/* ALAPKÉP */}

                      <div className="relative h-full w-full p-8 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0 group-hover:blur-md">

                        <Image
                          src={
                            product.cover_image ||
                            "/placeholder.jpg"
                          }
                          alt={
                            product.name
                          }
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                          className="object-cover drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]"
                        />

                      </div>


                      {/* HOVER */}

                      <div className="absolute inset-0 h-full w-full scale-105 opacity-0 transition-all duration-700 ease-in-out group-hover:scale-100 group-hover:opacity-100">

                        <Image
                          src={
                            product.hover_image ||
                            product.cover_image ||
                            "/placeholder.jpg"
                          }
                          alt={`${product.name} enteriőrben`}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                          className="object-cover"
                        />

                      </div>

                    </Link>


                    <div className="flex-grow px-2">

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d17d58]">
                        {activeCategoryName ||
                          product.display_category ||
                          "Vászonkép"}
                      </p>

                      <Link
                        href={`/vaszonkepek/${product.slug}`}
                      >
                        <h3 className="mt-3 text-xl font-bold text-[#2a211d] transition-colors hover:text-[#d17d58]">
                          {
                            product.name
                          }
                        </h3>
                      </Link>

                      <p className="mt-1 text-[11px] font-medium text-[#8a7f76]">
                        Több méretben
                        elérhető
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-[#efebe6] pt-6">

                        <div className="flex flex-col">

                          {originalPrice && (
                            <span className="text-xs font-bold text-[#d17d58] line-through">
                              {formatPrice(
                                originalPrice
                              )}{" "}
                              Ft
                            </span>
                          )}

                          <p className="text-lg font-black text-[#2a211d]">
                            {formatPrice(
                              price
                            )}{" "}
                            Ft{" "}
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-[#8a7f76]">
                              -tól
                            </span>
                          </p>

                        </div>

                        <Link
                          href={`/vaszonkepek/${product.slug}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#efebe6] bg-white text-[#2a211d] transition-all duration-300 hover:scale-110 hover:border-[#2a211d] hover:bg-[#2a211d] hover:text-white"
                        >
                          →
                        </Link>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}


        {/* LAPOZÁS */}

        {totalPages > 1 && (
          <div className="mt-24 flex flex-wrap items-center justify-center gap-3">

            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) => {
                const page =
                  index + 1;

                return (
                  <button
                    key={
                      page
                    }
                    onClick={() =>
                      updateParams(
                        {
                          page,
                        }
                      )
                    }
                    className={`h-12 w-12 rounded-full text-xs font-bold transition-all duration-300 ${
                      safePage ===
                      page
                        ? "scale-110 bg-[#2a211d] text-white shadow-xl shadow-[#2a211d]/20"
                        : "border border-[#efebe6] bg-white text-[#7a665c] hover:border-[#d17d58]"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
            )}

          </div>
        )}

      </section>
    </>
  );
}