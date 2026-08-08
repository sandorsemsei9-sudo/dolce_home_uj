"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function AdminProductsPage() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- ÉRTÉKEK KIOLVASÁSA AZ URL-BŐL ---
  const currentPage = Number(searchParams.get("page")) || 1;
  const selectedCategoryFilter = searchParams.get("category") || "all";
  const selectedOrientationFilter = searchParams.get("orientation") || "all";

  const itemsPerPage = 18;

  // --- MÉDIA ÁLLAPOTOK ---
  const [tempFiles, setTempFiles] = useState<{
    cover: File | null;
    hover: File | null;
    texture: File | null;
    texture2: File | null;
    texture3: File | null;
  }>({ cover: null, hover: null, texture: null, texture2: null, texture3: null });

  const [previews, setPreviews] = useState({
    cover: "",
    hover: "",
    texture: "",
    texture2: "",
    texture3: ""
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    category_ids: [] as number[],
    cover_image: "",
    hover_image: "",
    texture_image: "",
    texture_image_2: "",
    texture_image_3: "",
    orientation: "portrait"
  });
  const [variants, setVariants] = useState([{ size_name: "", price: "" }]);

  // --- SEGÉDFÜGGVÉNY AZ URL PARAMÉTEREK FRISSÍTÉSÉHEZ ---
  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Ha szűrőt váltunk, visszaugrunk az 1. oldalra
    if (key !== "page") {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from("categories").select("*");
      if (cats) setCategories(cats);
      await fetchProducts();
    }
    loadData();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products")
      .select("*, product_categories(category_id)")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Hiba a termékek betöltésekor:", error.message);
    }
    
    if (data) setProducts(data);
    setLoading(false);
  }

  // --- SZŰRÉSI LOGIKA ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesOrientation = selectedOrientationFilter === "all" || p.orientation === selectedOrientationFilter;
      
      let matchesCategory = true;
      if (selectedCategoryFilter !== "all") {
        const catIdNum = Number(selectedCategoryFilter);
        const hasCategory = p.product_categories?.some((pc: any) => Number(pc.category_id) === catIdNum);
        matchesCategory = hasCategory;
      }

      return matchesOrientation && matchesCategory;
    });
  }, [products, selectedOrientationFilter, selectedCategoryFilter]);

  // --- LAPOZÁSI LOGIKA ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const paginate = (pageNumber: number) => {
    updateQueryParam("page", pageNumber.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FÁJL KIVÁLASZTÁSA ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover' | 'texture' | 'texture2' | 'texture3') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setTempFiles(prev => ({ ...prev, [type]: file }));
  };

  // --- TÖRLÉS ---
  const handleDelete = async (id: string, name: string, slug: string) => {
    if (!confirm(`Biztosan törölni akarod a "${name}" terméket és az összes hozzá tartozó képet?`)) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    
    if (error) {
        alert("Hiba: " + error.message);
    } else {
      if (slug) {
        const { data: files } = await supabase.storage.from("products").list(slug);
        if (files && files.length > 0) {
          const filesToRemove = files.map(f => `${slug}/${f.name}`);
          await supabase.storage.from("products").remove(filesToRemove);
        }
      }
      
      setProducts(products.filter(p => p.id !== id));
      if (currentProducts.length === 1 && currentPage > 1) {
        updateQueryParam("page", (currentPage - 1).toString());
      }
    }
  };

  // --- VÉGLEGES MENTÉS ÉS FELTÖLTÉS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFiles.cover && !newProduct.cover_image) return alert("A fő kép kötelező!");
    
    setIsSaving(true);
    
    const slug = newProduct.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/\s+/g, "-");
    
    try {
      let finalImages = { 
        cover: newProduct.cover_image, 
        hover: newProduct.hover_image, 
        texture: newProduct.texture_image,
        texture2: newProduct.texture_image_2,
        texture3: newProduct.texture_image_3
      };

      const fileTypes = ['cover', 'hover', 'texture', 'texture2', 'texture3'] as const;

      for (const type of fileTypes) {
        const file = tempFiles[type];
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${type}-${Date.now()}.${fileExt}`;
          const filePath = `${slug}/${fileName}`; 

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("products").getPublicUrl(filePath);
          
          if (type === 'texture2') finalImages.texture2 = urlData.publicUrl;
          else if (type === 'texture3') finalImages.texture3 = urlData.publicUrl;
          else finalImages[type] = urlData.publicUrl;
        }
      }

      const isThreePiece = newProduct.orientation === "three-piece";

      const finalProduct = {
        name: newProduct.name,
        slug,
        cover_image: finalImages.cover,
        hover_image: finalImages.hover,
        texture_image: finalImages.texture || finalImages.cover,
        texture_image_2: isThreePiece ? finalImages.texture2 : null,
        texture_image_3: isThreePiece ? finalImages.texture3 : null,
        orientation: newProduct.orientation,
        parts_count: isThreePiece ? 3 : 1
      };

      const { data: pData, error: pError } = await supabase.from("products").insert([finalProduct]).select().single();

      if (pError) throw pError;

      if (pData && newProduct.category_ids.length > 0) {
        const categoryRelations = newProduct.category_ids.map((categoryId) => ({
          product_id: pData.id,
          category_id: categoryId
        }));

        const { error: categoryError } = await supabase
          .from("product_categories")
          .insert(categoryRelations);

        if (categoryError) throw categoryError;
      }

      if (pData) {
        const vToInsert = variants.filter(v => v.size_name).map(v => ({
          product_id: pData.id,
          size_name: v.size_name,
          price: parseInt(v.price) || 0
        }));
        if (vToInsert.length > 0) await supabase.from("product_variants").insert(vToInsert);
      }

      setNewProduct({ 
        name: "", 
        category_ids: [], 
        cover_image: "", 
        hover_image: "", 
        texture_image: "", 
        texture_image_2: "",
        texture_image_3: "",
        orientation: "portrait" 
      });      
      setTempFiles({ cover: null, hover: null, texture: null, texture2: null, texture3: null });
      setPreviews({ cover: "", hover: "", texture: "", texture2: "", texture3: "" });
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
            
            <div className="grid grid-cols-2 gap-2 border-2 border-gray-100 p-3 rounded-xl max-h-[140px] overflow-y-auto">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.category_ids.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewProduct({
                          ...newProduct,
                          category_ids: [...newProduct.category_ids, c.id]
                        });
                      } else {
                        setNewProduct({
                          ...newProduct,
                          category_ids: newProduct.category_ids.filter((id) => id !== c.id)
                        });
                      }
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>

            <select className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-black bg-gray-50" value={newProduct.orientation} onChange={e => setNewProduct({...newProduct, orientation: e.target.value})}>
              <option value="portrait">📐 Álló</option>
              <option value="landscape">📏 FEKVŐ</option>
              <option value="square">🔲 NÉGYZET</option>
              <option value="panorama">🎞️ PANORÁMA</option>
              <option value="three-piece">🖼️🖼️🖼️ HÁROMRÉSZES</option>
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
                    {previews.texture ? <Image src={previews.texture} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-blue-400 text-center px-1">3D KÉP 1</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'texture')} />
                </div>
             </div>

             {newProduct.orientation === "three-piece" && (
               <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200">
                  <div className="relative aspect-square bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-100 transition-colors">
                      {previews.texture2 ? <Image src={previews.texture2} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-blue-400 text-center px-1">3D KÉP 2</span>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'texture2')} />
                  </div>
                  <div className="relative aspect-square bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-100 transition-colors">
                      {previews.texture3 ? <Image src={previews.texture3} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-blue-400 text-center px-1">3D KÉP 3</span>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, 'texture3')} />
                  </div>
               </div>
             )}

             <button disabled={isSaving} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
              {isSaving ? "Feltöltés folyamatban..." : "Termék rögzítése"}
             </button>
          </div>
        </form>
      )}

      {/* --- SZŰRŐSÁV --- */}
      <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Szűrés:</span>
          
          {/* Kategória szűrő */}
          <select 
            value={selectedCategoryFilter} 
            onChange={(e) => updateQueryParam("category", e.target.value)}
            className="bg-gray-50 border-2 border-gray-100 px-4 py-2 rounded-xl text-xs font-bold outline-none focus:border-black cursor-pointer"
          >
            <option value="all">Minden kategória</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Tájolás szűrő */}
          <select 
            value={selectedOrientationFilter} 
            onChange={(e) => updateQueryParam("orientation", e.target.value)}
            className="bg-gray-50 border-2 border-gray-100 px-4 py-2 rounded-xl text-xs font-bold outline-none focus:border-black cursor-pointer"
          >
            <option value="all">Minden tájolás</option>
            <option value="portrait">📐 Álló</option>
            <option value="landscape">📏 Fekvő</option>
            <option value="square">🔲 Négyzet</option>
            <option value="panorama">🎞️ Panoráma</option>
            <option value="three-piece">🖼️ Háromrészes</option>
          </select>
        </div>

        <div className="text-xs font-bold text-gray-400">
          Összesen: <span className="text-black font-black">{filteredProducts.length}</span> termék
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.5em] animate-pulse">Adatok betöltése...</div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 font-bold text-gray-400 text-sm uppercase">Nincs találat a megadott szűrők alapján.</div>
          ) : (
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
                      {p.orientation === 'three-piece' && <span>🖼️ HÁROMRÉSZES</span>}
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
          )}

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