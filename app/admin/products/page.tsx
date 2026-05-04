"use client";

import { useEffect, useState, useMemo } from "react";
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

  // --- ÚJ ÁLLAPOTOK A KÉPKEZELÉSHEZ ---
  const [tempFiles, setTempFiles] = useState<{
    cover: File | null;
    hover: File | null;
    texture: File | null;
  }>({ cover: null, hover: null, texture: null });

  const [previews, setPreviews] = useState({
    cover: "",
    hover: "",
    texture: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

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

  // --- LAPOZÁSI LOGIKA ---
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FÁJL KIVÁLASZTÁSA (Csak kliens oldali előnézet) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover' | 'texture') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    // Előnézet generálása a böngészőben
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Eltároljuk a fájlt a végső mentésig
    setTempFiles(prev => ({ ...prev, [type]: file }));
  };

  // --- TÖRLÉS (Storage-al együtt) ---
  const handleDelete = async (id: string, name: string, slug: string) => {
    if (!confirm(`Biztosan törölni akarod a "${name}" terméket és az összes hozzá tartozó képet?`)) return;
    
    // 1. Adatbázis törlés
    const { error } = await supabase.from("products").delete().eq("id", id);
    
    if (error) {
        alert("Hiba: " + error.message);
    } else {
      // 2. Storage mappa ürítése (ha van slug)
      if (slug) {
        const { data: files } = await supabase.storage.from("products").list(slug);
        if (files && files.length > 0) {
          const filesToRemove = files.map(f => `${slug}/${f.name}`);
          await supabase.storage.from("products").remove(filesToRemove);
        }
      }
      
      setProducts(products.filter(p => p.id !== id));
      if (currentProducts.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    }
  };

  // --- VÉGLEGES MENTÉS ÉS FELTÖLTÉS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFiles.cover && !newProduct.cover_image) return alert("A fő kép kötelező!");
    
    setIsSaving(true);
    
    // Slug generálása a mappanévhez
    const slug = newProduct.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/\s+/g, "-");
    
    try {
      let finalImages = { 
        cover: newProduct.cover_image, 
        hover: newProduct.hover_image, 
        texture: newProduct.texture_image 
      };

      // Képek feltöltése ciklussal
      for (const type of ['cover', 'hover', 'texture'] as const) {
        const file = tempFiles[type];
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${type}-${Date.now()}.${fileExt}`; // Időbélyeg a cache elkerülésére
          const filePath = `${slug}/${fileName}`; 

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("products").getPublicUrl(filePath);
          finalImages[type] = urlData.publicUrl;
        }
      }

      const finalProduct = {
        ...newProduct,
        slug,
        cover_image: finalImages.cover,
        hover_image: finalImages.hover,
        texture_image: finalImages.texture || finalImages.cover
      };

      // Mentés az adatbázisba
      const { data: pData, error: pError } = await supabase.from("products").insert([finalProduct]).select().single();

      if (pError) throw pError;

      // Variánsok mentése
      if (pData) {
        const vToInsert = variants.filter(v => v.size_name).map(v => ({
          product_id: pData.id,
          size_name: v.size_name,
          price: parseInt(v.price) || 0
        }));
        if (vToInsert.length > 0) await supabase.from("product_variants").insert(vToInsert);
      }

      // Állapotok visszaállítása
      setNewProduct({ name: "", category_id: "", cover_image: "", hover_image: "", texture_image: "", orientation: "portrait" });
      setTempFiles({ cover: null, hover: null, texture: null });
      setPreviews({ cover: "", hover: "", texture: "" });
      setVariants([{ size_name: "", price: "" }]);
      setIsAdding(false);
      fetchProducts();
      alert("Termék sikeresen létrehozva!");

    } catch (error: any) {
      alert("Hiba történt a mentés során: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto font-sans text-gray-900 bg-[#fbfbfb] min-h-screen">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Termék <span className="text-blue-600">Admin</span></h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${isAdding ? 'bg-red-500 text-white' : 'bg-black text-white'}`}
        >
          {isAdding ? "Bezárás" : "+ Új Termék"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="mb-10 bg-white p-6 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-gray-400 italic">1. Alapadatok</p>
            <input required placeholder="Név" className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-black" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <select required className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-black" value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}>
              <option value="">Kategória...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-black bg-gray-50" value={newProduct.orientation} onChange={e => setNewProduct({...newProduct, orientation: e.target.value})}>
              <option value="portrait">📐 Álló</option>
              <option value="landscape">📏 FEKVŐ</option>
              <option value="square">🔲 NÉGYZET</option>
              <option value="panorama">🎞️ PANORÁMA</option>
            </select>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-gray-400 italic">2. Méretek</p>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Méret" className="flex-1 border-2 border-gray-100 p-2 rounded-lg text-xs" value={v.size_name} onChange={e => {
                    const val = [...variants]; val[i].size_name = e.target.value; setVariants(val);
                  }} />
                  <input type="number" placeholder="Ft" className="w-24 border-2 border-gray-100 p-2 rounded-lg text-xs font-bold" value={v.price} onChange={e => {
                    const val = [...variants]; val[i].price = e.target.value; setVariants(val);
                  }} />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setVariants([...variants, {size_name: "", price: ""}])} className="text-[10px] font-black text-blue-600 uppercase">+ Sor hozzáadása</button>
          </div>

          <div className="space-y-4">
             <p className="text-[10px] font-black uppercase text-gray-400 italic">3. Média (Mappa alapú)</p>
             <div className="grid grid-cols-3 gap-2">
                <div className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors">
                    {previews.cover ? <Image src={previews.cover} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-gray-400 text-center px-1">FŐ KÉP</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'cover')} />
                </div>
                <div className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors">
                    {previews.hover ? <Image src={previews.hover} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-gray-400 text-center px-1">HOVER</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'hover')} />
                </div>
                <div className="relative aspect-square bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-100 transition-colors">
                    {previews.texture ? <Image src={previews.texture} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-blue-400 text-center px-1">3D KÉP</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'texture')} />
                </div>
             </div>
             <button disabled={isSaving} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
              {isSaving ? "Feltöltés folyamatban..." : "Termék rögzítése"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.5em] animate-pulse">Adatok betöltése...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {currentProducts.map((p) => (
              <div key={p.id} className="bg-white border-2 border-gray-50 rounded-2xl p-2 hover:border-black transition-all group flex flex-col relative">
                <div className={`relative ${p.orientation === 'panorama' ? 'aspect-square sm:aspect-video' : 'aspect-[3/4]'} rounded-xl overflow-hidden mb-2 bg-gray-100`}>
                  <Image src={p.cover_image || "/placeholder.jpg"} fill className="object-cover transition-transform group-hover:scale-105 duration-500" alt="" />
                  
                  <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[7px] font-black uppercase flex items-center gap-1">
                    {p.orientation === 'portrait' && <span>📐 ÁLLÓ</span>}
                    {p.orientation === 'landscape' && <span>📏 FEKVŐ</span>}
                    {p.orientation === 'square' && <span>🔲 NÉGYZET</span>}
                    {p.orientation === 'panorama' && <span>🎞️ PANORÁMA</span>}
                  </div>

                  <button 
                    onClick={() => handleDelete(p.id, p.name, p.slug)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="text-xs font-bold">✕</span>
                  </button>
                </div>

                <h3 className="text-[9px] font-black uppercase truncate mb-2 px-1">{p.name}</h3>
                
                <Link 
                  href={`/admin/products/edit/${p.id}`} 
                  className="mt-auto block w-full py-2 bg-gray-50 text-[8px] font-black text-center uppercase rounded-md hover:bg-blue-600 hover:text-white transition-all"
                >
                  Szerkesztés
                </Link>
              </div>
            ))}
          </div>

          {/* LAPOZÓ */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 mb-8">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-white hover:border-black disabled:opacity-20 transition-all text-xs font-bold"
              >
                ←
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border-2 ${
                      currentPage === i + 1 
                        ? "bg-black text-white border-black shadow-lg" 
                        : "bg-white border-gray-100 text-gray-400 hover:border-black hover:text-black"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-white hover:border-black disabled:opacity-20 transition-all text-xs font-bold"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}