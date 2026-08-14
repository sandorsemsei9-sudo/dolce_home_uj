import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";

import ProductCollectionClient from "../../ProductCollectionClient";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};


function slugify(text: string) {
  return text
    .replace(/\s+vászonképek?$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/&/g, "-")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


async function getCategoryData(
  slug: string
) {
  const supabase =
    await createClient();


  // ÖSSZES KATEGÓRIA

  const {
    data: categories,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, name")
    .order(
      "name",
      {
        ascending: true,
      }
    );

  if (categoryError) {
    console.error(
      "Kategória hiba:",
      categoryError.message
    );

    return null;
  }


  // AKTUÁLIS KATEGÓRIA

  const category =
    (categories || []).find(
      (category: any) =>
        slugify(
          category.name
        ) === slug
    );

  if (!category) {
    return null;
  }


  // KAPCSOLATOK

  const {
    data: relations,
    error: relationError,
  } = await supabase
    .from(
      "product_categories"
    )
    .select("product_id")
    .eq(
      "category_id",
      category.id
    );

  if (relationError) {
    console.error(
      "Kapcsolat hiba:",
      relationError.message
    );
  }

  const productIds =
    (relations || []).map(
      (relation: any) =>
        relation.product_id
    );


  // HA NINCS TERMÉK

  if (
    productIds.length === 0
  ) {
    return {
      category,
      categories:
        categories || [],
      products: [],
    };
  }


  // TERMÉKEK

  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select(`
      *,
      product_variants(*)
    `)
    .in(
      "id",
      productIds
    )
    .order(
      "position",
      {
        ascending: true,
      }
    );

  if (productsError) {
    console.error(
      "Termék hiba:",
      productsError.message
    );
  }


  const processedProducts =
    (products || []).map(
      (product: any) => {

        const prices =
          product.product_variants
            ?.map(
              (variant: any) =>
                Number(
                  variant.price
                )
            )
            .filter(
              (price: number) =>
                Number.isFinite(
                  price
                )
            ) || [];

        return {
          ...product,

          display_price:
            prices.length > 0
              ? Math.min(
                  ...prices
                )
              : 0,

          display_category:
            category.name,
        };
      }
    );


  return {
    category,
    categories:
      categories || [],
    products:
      processedProducts,
  };
}


export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const data =
    await getCategoryData(
      slug
    );

  if (!data) {
    return {
      title:
        "Kategória nem található | Dolce Home",
    };
  }

  const categoryName =
    data.category.name;

  const title =
    `${categoryName} Vászonképek | Dolce Home`;

  const description =
    `Fedezd fel ${categoryName.toLowerCase()} vászonképeinket. Modern és prémium minőségű faliképek több méretben a Dolce Home kínálatából.`;

  const url =
    `https://www.dolce-home.hu/vaszonkepek/kategoria/${slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName:
        "Dolce Home",
      locale:
        "hu_HU",
      type:
        "website",
    },
  };
}


export default async function CategoryPage({
  params,
}: Props) {
  const {
    slug,
  } = await params;

  const data =
    await getCategoryData(
      slug
    );

  if (!data) {
    notFound();
  }

  const {
    category,
    categories,
    products,
  } = data;


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">

        {/* HERO */}

        <section className="border-b border-[#efebe6] bg-[#f8f3ef]/30 pb-14 pt-28 md:pb-20 md:pt-36">

          <div className="mx-auto max-w-7xl px-6">

            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#8a7f76]">

              <a
                href="/"
                className="hover:text-[#d17d58]"
              >
                Főoldal
              </a>

              <span>
                /
              </span>

              <a
                href="/vaszonkepek"
                className="hover:text-[#d17d58]"
              >
                Vászonképek
              </a>

              <span>
                /
              </span>

              <span className="font-medium text-[#2a211d]">
                {
                  category.name
                }
              </span>

            </div>


            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
              Dolce Home
              kollekció
            </p>


            <h1 className="max-w-4xl text-4xl font-bold italic leading-tight tracking-tight md:text-6xl">
              {
                category.name
              }{" "}
              Vászonképek
            </h1>


            <p className="mt-6 max-w-3xl text-sm leading-7 text-[#7a665c] md:text-base">
              Fedezd fel{" "}
              {category.name.toLowerCase()}{" "}
              vászonképeink
              válogatását.
              Prémium minőségű,
              modern faliképek
              több méretben,
              amelyek különleges
              hangulatot
              teremtenek
              otthonodban.
            </p>

          </div>

        </section>


        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">

              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d17d58] border-t-transparent" />

            </div>
          }
        >
          <ProductCollectionClient
            products={
              products
            }
            categories={
              categories
            }
            activeCategoryName={
              category.name
            }
          />
        </Suspense>


        {/* KATEGÓRIA SEO */}

        <section className="border-t border-[#efebe6] bg-[#f8f3ef]/40 py-16">

          <div className="mx-auto max-w-4xl px-6">

            <h2 className="text-2xl font-bold italic md:text-3xl">
              {
                category.name
              }{" "}
              vászonképek
              otthonod
              stílusához
            </h2>

            <p className="mt-6 leading-7 text-[#7a665c]">
              A Dolce Home{" "}
              {category.name.toLowerCase()}{" "}
              vászonképei
              modern és elegáns
              faldekorációként
              különleges
              megjelenést
              biztosítanak
              nappaliban,
              hálószobában,
              dolgozószobában
              vagy akár
              irodában is.
            </p>

            <p className="mt-5 leading-7 text-[#7a665c]">
              Vászonképeink
              prémium minőségű
              művészvászonra
              készülnek,
              stabil fa
              vakrámára
              feszítve.
              A különböző
              méreteknek és
              formátumoknak
              köszönhetően
              könnyen
              megtalálhatod
              a helyiséghez
              legjobban illő
              dekorációt.
            </p>

          </div>

        </section>
        {/* MIÉRT VÁLASSZ + TECHNIKAI RÉSZLETEK */}

<section className="border-t border-[#efebe6] bg-[#fdfbf9] py-16 md:py-20">
  <div className="mx-auto max-w-4xl px-6">

    <div className="grid gap-8 md:grid-cols-2">

      {/* MIÉRT VÁLASSZ */}

      <div className="space-y-5">
        <h3 className="text-xl font-bold text-[#2a211d]">
          Miért válassz vászonképet?
        </h3>

        <ul className="space-y-3 text-sm leading-relaxed text-[#7a665c]">
          <li className="flex items-start gap-2">
            <span>✔️</span>
            <span>
              <strong>
                Modern és időtálló faldekoráció
              </strong>
            </span>
          </li>

          <li className="flex items-start gap-2">
            <span>✔️</span>
            <span>
              <strong>
                Többféle méretben rendelhető
              </strong>
            </span>
          </li>

          <li className="flex items-start gap-2">
            <span>✔️</span>
            <span>
              <strong>
                Kész állapotban, keretezés nélkül kihelyezhető
              </strong>
            </span>
          </li>

          <li className="flex items-start gap-2">
            <span>✔️</span>
            <span>
              <strong>
                Nappaliba, hálószobába, dolgozószobába vagy irodába is ideális
              </strong>
            </span>
          </li>
        </ul>
      </div>


      {/* TECHNIKAI RÉSZLETEK */}

      <div className="rounded-3xl border border-[#efebe6] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#2a211d]">
          Technikai részletek
        </h3>

        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#7a665c]">

          <li>
            <strong>Anyag:</strong>{" "}
            360 g/m² művészvászon
          </li>

          <li>
            <strong>Keret:</strong>{" "}
            2 cm vastag fenyőfa vakráma
          </li>

          <li>
            <strong>Nyomtatás:</strong>{" "}
            tartós, részletgazdag nyomat
          </li>

          <li>
            <strong>Felszerelés:</strong>{" "}
            falra akasztható
          </li>

        </ul>
      </div>

    </div>

  </div>
</section>

      </main>

      <Footer />
    </>
  );
}