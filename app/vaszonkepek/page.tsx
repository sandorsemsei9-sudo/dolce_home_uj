import type { Metadata } from "next";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

import ProductCollectionClient from "./ProductCollectionClient";


export const metadata: Metadata = {
  title:
    "Vászonképek – Modern és Egyedi Faliképek | Dolce Home",

  description:
    "Fedezd fel a Dolce Home modern vászonképeit. Absztrakt, természet, állatvilág, gyerekszoba és egyéb faliképek több méretben, prémium minőségben.",

  alternates: {
    canonical:
      "https://www.dolce-home.hu/vaszonkepek",
  },
};


export default async function VaszonkepekPage() {
  const supabase =
    await createClient();


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
    .order(
      "position",
      {
        ascending: true,
      }
    );

  if (productsError) {
    console.error(
      "Termék lekérdezési hiba:",
      productsError.message
    );
  }


  // KATEGÓRIA KAPCSOLATOK

  const {
    data: relations,
    error: relationsError,
  } = await supabase
    .from(
      "product_categories"
    )
    .select(
      "product_id, category_id, categories(name)"
    );

  if (relationsError) {
    console.error(
      "Kategória kapcsolat hiba:",
      relationsError.message
    );
  }


  // KATEGÓRIÁK

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name")
    .order(
      "name",
      {
        ascending: true,
      }
    );

  if (categoriesError) {
    console.error(
      "Kategória lekérdezési hiba:",
      categoriesError.message
    );
  }


  // TERMÉKEK FELDOLGOZÁSA

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

        const productCategories =
          (relations || [])
            .filter(
              (relation: any) =>
                relation.product_id ===
                product.id
            )
            .map(
              (relation: any) =>
                relation.categories
                  ?.name
            )
            .filter(Boolean);

        return {
          ...product,

          display_price:
            prices.length > 0
              ? Math.min(
                  ...prices
                )
              : 0,

          display_category:
            productCategories[
              0
            ] ||
            "Vászonkép",

          all_categories:
            productCategories,
        };
      }
    );


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fdfbf9] text-[#2a211d]">

        {/* HERO */}

        <section className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">

          <div className="pointer-events-none absolute inset-0 bg-[#f8f3ef]/30" />

          <div className="relative mx-auto max-w-7xl px-6">

            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#d17d58]">
              Válogatás
            </p>

            <h1 className="max-w-5xl text-4xl font-bold italic leading-tight tracking-tight text-[#2a211d] md:text-6xl">
              Vászonképek – Modern és Egyedi Fali Dekorációk
            </h1>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-[#7a665c] md:text-base">
              Fedezd fel modern
              vászonképeinket többféle
              stílusban és méretben.
              Válogass absztrakt,
              természetközeli,
              állatvilág,
              gyerekszobai és egyéb
              különleges
              falidekorációink közül.
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
              processedProducts
            }
            categories={
              categories || []
            }
          />
        </Suspense>


        {/* SEO SZEKCIÓ */}

        <section className="border-t border-[#efebe6] bg-[#f8f3ef]/40 py-20">

          <div className="mx-auto max-w-5xl space-y-10 px-6">

            <div className="space-y-6 text-sm leading-relaxed text-[#7a665c] md:text-base">

              <h2 className="text-2xl font-bold italic tracking-tight text-[#2a211d] md:text-3xl">
                Modern vászonképek otthonod stílusához
              </h2>

              <p>
                A{" "}
                <strong>
                  Dolce Home vászonképei
                </strong>{" "}
                ideális választást
                jelentenek, ha gyorsan és
                egyszerűen szeretnéd
                feldobni otthonod vagy
                munkahelyed hangulatát
                egy elegáns
                faldekorációval.
              </p>

              <p>
                Kollekcióink között
                absztrakt minták,
                természetes hangulatú
                tájképek, virágos
                dekorációk, állatos
                motívumok,
                minimalista és modern
                vászonképek egyaránt
                megtalálhatók.
              </p>

              <p className="font-medium text-[#2a211d]">
                Vászonképeink
                kiváló minőségű
                művészvászonra
                készülnek, amelyet
                stabil fa vakrámára
                feszítünk.
              </p>

            </div>


            <div className="grid gap-8 border-t border-[#efebe6] pt-8 md:grid-cols-2">

              <div>

                <h3 className="mb-5 text-xl font-bold">
                  Miért válassz vászonképet?
                </h3>

                <ul className="space-y-3 text-sm text-[#7a665c]">

                  <li>
                    ✔️ Modern és
                    időtálló
                    faldekoráció
                  </li>

                  <li>
                    ✔️ Többféle
                    méretben
                    rendelhető
                  </li>

                  <li>
                    ✔️ Kész
                    állapotban,
                    keretezés nélkül
                    kihelyezhető
                  </li>

                  <li>
                    ✔️ Nappaliba,
                    hálószobába,
                    dolgozószobába
                    vagy irodába is
                    ideális
                  </li>

                </ul>

              </div>


              <div className="rounded-3xl border border-[#efebe6] bg-white p-6 shadow-sm">

                <h3 className="mb-4 text-xl font-bold">
                  Technikai részletek
                </h3>

                <ul className="space-y-2 text-sm text-[#7a665c]">

                  <li>
                    <strong>
                      Anyag:
                    </strong>{" "}
                    360 g/m²
                    művészvászon
                  </li>

                  <li>
                    <strong>
                      Keret:
                    </strong>{" "}
                    2 cm vastag
                    fenyőfa vakráma
                  </li>

                  <li>
                    <strong>
                      Nyomtatás:
                    </strong>{" "}
                    tartós,
                    részletgazdag
                    nyomat
                  </li>

                  <li>
                    <strong>
                      Felszerelés:
                    </strong>{" "}
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