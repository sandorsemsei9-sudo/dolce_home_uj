import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://dolce-home.hu";

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants(*)
    `)
    .order("position", { ascending: true });

  if (error) {
    console.error("Google Merchant feed hiba:", error);

    return new Response("Feed generation error", {
      status: 500,
    });
  }

  const items = (products ?? [])
    .flatMap((product: any) => {
      const variants = product.product_variants ?? [];

      if (variants.length === 0) {
        return [];
      }

      return variants.map((variant: any) => {
        const id = `${product.id}-${variant.id}`;

        const size = variant.size_name ?? "";

        const title = size
          ? `${product.name} – ${size}`
          : product.name;

        const description =
          product.description ||
          `${product.name} prémium minőségű vászonkép.`;

        const link = `${SITE_URL}/vaszonkepek/${product.slug}`;

        const imageLink =
          product.cover_image || "";

        const price = Number(variant.price);

        return `
          <item>
            <g:id>${escapeXml(id)}</g:id>

            <g:title>${escapeXml(title)}</g:title>

            <g:description>${escapeXml(description)}</g:description>

            <g:link>${escapeXml(link)}</g:link>

            <g:image_link>${escapeXml(imageLink)}</g:image_link>

            <g:availability>in_stock</g:availability>

            <g:condition>new</g:condition>

            <g:price>${price} HUF</g:price>

            ${
              size
                ? `<g:size>${escapeXml(size)}</g:size>`
                : ""
            }

            <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>

            <g:identifier_exists>no</g:identifier_exists>
          </item>
        `;
      });
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss
  xmlns:g="http://base.google.com/ns/1.0"
  version="2.0"
>
  <channel>

    <title>Dolce Home</title>

    <link>${SITE_URL}</link>

    <description>Dolce Home vászonképek</description>

    ${items}

  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}