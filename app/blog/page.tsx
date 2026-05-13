// app/blog/page.tsx
import { createClient } from "@/lib/supabase/server"; 
import Link from "next/link";

export default async function BlogPage() {
  // 1. Megvárjuk, amíg a kliens létrejön
  const supabase = await createClient(); 
  
  // 2. Most már van .from() metódusunk
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <section className="py-12">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">
        Dolce Home Blog
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-xl">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-black text-[#e3936e] uppercase tracking-[0.2em]">
                    {new Date(post.created_at).toLocaleDateString('hu-HU')}
                  </span>
                  <h2 className="text-xl font-bold mt-2 group-hover:text-[#e3936e] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 italic">Hamarosan érkeznek az első bejegyzések...</p>
        )}
      </div>
    </section>
  );
}