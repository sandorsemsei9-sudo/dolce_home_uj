"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminBlogPage() {
  const supabase = createClient();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Lakberendezés", // Alapértelmezett érték
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/ +/g, "-");
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "title" && !isEditing) {
      setFormData(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const folder = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from('blog').upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('blog').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image_url: finalImageUrl,
        published: true,
        author_name: "Dolce Home Admin",
      };

      if (isEditing) {
        const { error } = await supabase.from("posts").update(postData).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert([postData]);
        if (error) throw error;
      }

      alert(isEditing ? "Frissítve!" : "Létrehozva!");
      resetForm();
      fetchPosts();
    } catch (err: any) {
      alert("Hiba: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (post: any) => {
    if (!confirm(`Biztosan törlöd?`)) return;
    try {
      if (post.image_url) {
        const urlParts = post.image_url.split('/blog/');
        const filePath = urlParts[urlParts.length - 1];
        if (filePath) await supabase.storage.from('blog').remove([filePath]);
      }
      await supabase.from("posts").delete().eq("id", post.id);
      fetchPosts();
    } catch (err: any) {
      alert("Hiba törléskor");
    }
  };

  const startEdit = (post: any) => {
    setFormData(post);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ id: "", title: "", slug: "", excerpt: "", content: "", image_url: "", category: "Lakberendezés" });
    setIsEditing(false);
    setImageFile(null);
  };

  return (
    <main className="min-h-screen bg-[#fcfaf8] p-6 md:p-12 text-[#1a1a1a]">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black uppercase italic">Blog Admin</h1>
          {isEditing && (
            <button onClick={resetForm} className="bg-red-50 text-red-500 px-6 py-2 rounded-full text-xs font-black uppercase">
              Mégse / Új hozzáadása
            </button>
          )}
        </div>

        {/* SZERKESZTŐ FORM */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Bejegyzés címe</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full h-14 bg-[#fcfaf8] border rounded-2xl px-5 font-bold outline-none focus:border-[#e3936e]" />
              </div>
              
              {/* KATEGÓRIA VÁLASZTÓ - EZ AZ ÚJ RÉSZ */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Kategória</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full h-12 bg-[#fcfaf8] border rounded-2xl px-5 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#e3936e]"
                >
                  <option value="Lakberendezés">Lakberendezés</option>
                  <option value="Stílus kalauz">Stílus kalauz</option>
                  <option value="Vászonkép tippek">Vászonkép tippek</option>
                  <option value="Inspiráció">Inspiráció</option>
                  <option value="Hírek">Hírek</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">URL (Slug)</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full h-12 bg-gray-50 border rounded-2xl px-5 text-sm outline-none font-mono" />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Borítókép</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs file:bg-black file:text-white file:rounded-xl file:px-4 file:py-2 file:border-0 cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Rövid leírás</label>
              <textarea name="excerpt" rows={2} value={formData.excerpt} onChange={handleChange} className="w-full bg-[#fcfaf8] border rounded-2xl p-5 outline-none focus:border-[#e3936e] text-sm" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Tartalom (HTML)</label>
              <textarea required name="content" rows={10} value={formData.content} onChange={handleChange} className="w-full bg-[#fcfaf8] border rounded-2xl p-5 outline-none focus:border-[#e3936e] font-mono text-sm" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#1a1a1a] text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-[#e3936e] transition-all disabled:opacity-50 shadow-lg shadow-black/10">
              {isSubmitting ? "Folyamatban..." : isEditing ? "Módosítások mentése" : "Bejegyzés közzététele"}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase italic mb-8">Bejegyzések kezelése</h2>
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-[30px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                   {post.image_url && <img src={post.image_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div>
                  <h3 className="font-bold leading-tight">{post.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] bg-[#e3936e]/10 text-[#e3936e] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                      {post.category}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase font-black py-0.5">
                      {post.slug}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(post)} className="flex-1 md:flex-none bg-[#fcfaf8] px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-50 hover:text-blue-600 transition-all">Szerkesztés</button>
                <button onClick={() => handleDelete(post)} className="flex-1 md:flex-none bg-[#fcfaf8] px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all">Törlés</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}