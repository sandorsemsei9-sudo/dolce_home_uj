import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

// --- 1. DINAMIKUS SEO METAADATOK ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, image_url")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Bejegyzés nem található" };

  const fullImageUrl = post.image_url ? [post.image_url] : [];

  return {
    title: `${post.title} | Dolce Home Blog`,
    description: post.excerpt,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: fullImageUrl,
      type: "article",
      url: `https://www.dolce-home.hu/blog/${slug}`,
    },
    alternates: {
      canonical: `https://www.dolce-home.hu/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // --- 2. SEO STRUKTURÁLT ADATOK ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image_url,
    "datePublished": post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author_name || "Dolce Home Team",
    },
    "description": post.excerpt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.dolce-home.hu/blog/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="mx-auto max-w-4xl pt-4 pb-12 md:pt-8">
        
        {/* Vissza gomb */}
        <Link 
          href="/blog" 
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e3936e] transition-colors flex items-center gap-2 mb-4"
        >
          ← Vissza a blogra
        </Link>

        {/* Fejléc */}
        <header className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#e3936e] uppercase tracking-[0.3em]">
              {post.category || "Lakberendezés"}
            </span>
            <span className="text-gray-300">•</span>
            <time 
              dateTime={post.created_at}
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]"
            >
              {new Date(post.created_at).toLocaleDateString('hu-HU')}
            </time>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-[1.1] text-[#1a1a1a]">
            {post.title}
          </h1>
          
          <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-[#e3936e] pl-6 py-1">
            {post.excerpt}
          </p>
        </header>

        {/* Borítókép */}
        {post.image_url && (
          <div className="rounded-[40px] overflow-hidden shadow-2xl mb-10 aspect-[16/9] bg-gray-100">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Tartalom */}
        <div className="prose prose-orange max-w-none">
          <div 
            className="text-lg leading-relaxed space-y-6 text-gray-800 font-medium blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>

        {/* Szerző és CTA */}
        <div className="mt-16 pt-10 border-t border-dashed border-gray-200">
          <div className="bg-white p-8 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-gray-50">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Szerző</p>
              <p className="font-bold text-xl text-[#1a1a1a]">{post.author_name || "Dolce Home Team"}</p>
            </div>
            <Link 
              href="/" 
              className="w-full md:w-auto bg-[#1a1a1a] text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#e3936e] hover:scale-105 transition-all duration-300 text-center"
            >
              Irány a webshop
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}