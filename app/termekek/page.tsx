"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    cover_image: "",
    hover_image: "",
    texture_image: "",
    orientation: "portrait"
  });
  const [variants, setVariants] = useState([{ size_name: "", price: "" }]);

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from("categories").select("*");
      if (cats) setCategories(cats);
      fetchProducts();
    }
    loadData();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // --- TÖRLES FUNKCIÓ (STORAGE + DB) ---
  const handleDelete = async (id: string, name: string, coverUrl: string, hoverUrl?: string, textureUrl?: string) => {
    if (!confirm(`Biztosan törölni akarod a "${name}" terméket és az összes hozzá tartozó fájlt?`)) return;

    try {
      const getFileName = (url: string) => {
        if (!url || !url.includes('storage')) return null;
        const parts = url.split('/');
        return parts[parts.length - 1];
      };

      const filesToDelete: string[] = [];
      [coverUrl, hoverUrl, textureUrl].forEach(url => {
        if (url) {
          const name = getFileName(url);
          if (name && !filesToDelete.includes(name)) filesToDelete.push(name);
        }
      });

      // 1. Képek törlése a Storage-ból
      if (filesToDelete.length > 0) {
        await supabase.storage.from("products").remove(filesToDelete);
      }

      // 2. Termék törlése az adatbázisból
      const { error: dbError } = await supabase.from("products").delete().eq("id", id);
      if (dbError) throw dbError;

      setProducts(products.filter(p => p.id !== id));
      alert("Termék és fájlok sikeresen törölve!");
    } catch (error: any) {
      alert("Hiba a törlés során: " + error.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover' | 'texture') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${type}-${file.name.replace(/\s+/g, '-')}`;
    
    const { error } = await supabase.storage.from("products").upload(fileName, file);
    if (error) return alert("Feltöltési hiba: " + error.message);

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    const field = type === 'cover' ? 'cover_image' : type === 'hover' ? 'hover_image' : 'texture_image';
    setNewProduct(prev => ({ ...prev, [field]: data.publicUrl }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category_id || !newProduct.cover_image) {
      alert("Név, kategória és fő kép kötelező!");
      return;
    }

    setIsSaving(true);
    try {
      const slug = newProduct.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/\s+/g, "-");
      
      const finalProduct = {
        ...newProduct,
        hover_image: newProduct.hover_image || null,
        texture_image: newProduct.texture_image || newProduct.cover_image,
        slug,
        is_active: true
      };

      const { data: pData, error: pError } = await supabase.from("products").insert([finalProduct]).select().single();
      if (pError) throw pError;

      if (pData) {
        const vToInsert = variants.filter(v => v.size_name && v.price).map(v => ({
          product_id: pData.id,
          size_name: v.size_name,
          price: parseInt(v.price.toString()) || 0
        }));
        if (vToInsert.length > 0) await supabase.from("product_variants").insert(vToInsert);
      }

      alert("Sikeres mentés!");
      setNewProduct({ name: "", category_id: "", cover_image: "", hover_image: "", texture_image: "", orientation: "portrait" });
      setVariants([{ size_name: "", price: "" }]);
      setIsAdding(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto font-sans text-gray-900 bg-[#fbfbfb] min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Termék <span className="text-blue-600">Katalógus</span></h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md ${isAdding ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          {isAdding ? "Bezárás" : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Új Termék</>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="mb-12 bg-white p-8 rounded-[2rem] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-gray-400 italic tracking-widest">1. Alapadatok</p>
            <input required placeholder="Termék neve" className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <select required className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all cursor-pointer" value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}>
              <option value="">Válassz kategóriát...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all bg-gray-50" value={newProduct.orientation} onChange={e => setNewProduct({...newProduct, orientation: e.target.value})}>
              <option value="portrait">📐 Álló (Portrait)</option>
              <option value="landscape">📏 Fekvő (Landscape)</option>
              <option value="square">🔲 Négyzet (Square)</option>
            </select>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-gray-400 italic tracking-widest">2. Méretek és Árak</p>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                  <input placeholder="pl. 40x60" className="flex-1 border-2 border-gray-100 p-3 rounded-xl text-xs font-medium" value={v.size_name} onChange={e => {
                    const val = [...variants]; val[i].size_name = e.target.value; setVariants(val);
                  }} />
                  <input type="number" placeholder="Ár" className="w-28 border-2 border-gray-100 p-3 rounded-xl text-xs font-bold text-blue-600" value={v.price} onChange={e => {
                    const val = [...variants]; val[i].price = e.target.value; setVariants(val);
                  }} />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setVariants([...variants, {size_name: "", price: ""}])} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors">+ Új méret hozzáadása</button>
          </div>

          <div className="space-y-6">
             <p className="text-[10px] font-black uppercase text-gray-400 italic tracking-widest">3. Képek Feltöltése</p>
             <div className="grid grid-cols-3 gap-3">
                {/* Image uploaders... */}
                {['cover', 'hover', 'texture'].map((type) => (
                   <div key={type} className="relative aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-all">
                      {newProduct[type === 'cover' ? 'cover_image' : type === 'hover' ? 'hover_image' : 'texture_image'] ? (
                        <Image src={newProduct[type === 'cover' ? 'cover_image' : type === 'hover' ? 'hover_image' : 'texture_image']} fill className="object-cover" alt="" />
                      ) : (
                        <span className="text-[8px] font-black text-gray-400 uppercase text-center px-2">{type === 'texture' ? '3D Alap' : type}</span>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, type as any)} />
                   </div>
                ))}
             </div>
             <button disabled={isSaving} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3">
              {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"/> Mentés...</> : "Termék rögzítése"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 animate-spin rounded-full"/>
           <p className="font-black text-gray-300 uppercase tracking-widest text-xs">Adatok szinkronizálása...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-[2rem] p-3 hover:shadow-2xl hover:-translate-y-1 transition-all group relative">
              <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 shadow-inner">
                <Image src={p.cover_image || "/placeholder.jpg"} fill className="object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                
                {/* 3D Label */}
                {p.texture_image && (
                  <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-[8px] font-black shadow-lg">3D</div>
                )}

                {/* ORIENTATION Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-black px-2 py-1 rounded-lg text-[7px] font-black uppercase">
                  {p.orientation === 'portrait' ? '📐 Álló' : p.orientation === 'landscape' ? '📏 Fekvő' : '🔲 Négyzet'}
                </div>

                {/* TÖRLÉS GOMB (KUKA IKON) */}
                <button 
                  onClick={() => handleDelete(p.id, p.name, p.cover_image, p.hover_image, p.texture_image)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center transition-all scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-100 hover:bg-black"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="px-2">
                 <h3 className="text-[10px] font-black uppercase truncate text-gray-800 mb-1">{p.name}</h3>
                 <p className="text-[8px] font-bold text-blue-500 uppercase mb-4">{p.categories?.name}</p>
                 
                 <Link 
                   href={`/admin/products/edit/${p.id}`} 
                   className="block w-full py-2.5 bg-gray-50 text-[9px] font-black text-center uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all tracking-tighter"
                 >
                   Szerkesztés
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}