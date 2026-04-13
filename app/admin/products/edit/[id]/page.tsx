"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    category_id: "" as string | number,
    description: "",
    cover_image: "",
    hover_image: "",
    orientation: "portrait",
  });

  const [variants, setVariants] = useState<any[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Kategóriák betöltése
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      // Termék adatok betöltése
      const { data: pData } = await supabase.from("products").select("*").eq("id", id).single();
      if (pData) {
        setProduct({
          name: pData.name || "",
          slug: pData.slug || "",
          category_id: pData.category_id || "",
          description: pData.description || "",
          cover_image: pData.cover_image || "",
          hover_image: pData.hover_image || "",
          orientation: pData.orientation || "portrait",
        });
      }

      // Variánsok betöltése
      const { data: vData } = await supabase.from("product_variants").select("*").eq("product_id", id);
      if (vData) {
        setVariants(vData.map(v => ({
          size_name: v.size_name,
          price: v.price.toString() // Stringként kezeljük az input miatt
        })));
      }
      setLoading(false);
    }
    if (id) loadData();
  }, [id, supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover', setUploadingFn: (b: boolean) => void) => {
    try {
      setUploadingFn(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `${Date.now()}-${type}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      const { error: uploadError } = await supabase.storage.from("products").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      
      setProduct(prev => ({ 
        ...prev, 
        [type === 'cover' ? 'cover_image' : 'hover_image']: data.publicUrl 
      }));

    } catch (error: any) {
      alert("Hiba: " + error.message);
    } finally {
      setUploadingFn(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 1. Termék frissítése (Javítva: category_id kényszerítése számmá)
    const { error: pError } = await supabase.from("products").update({
      name: product.name,
      slug: product.slug,
      category_id: parseInt(product.category_id.toString()), 
      description: product.description,
      cover_image: product.cover_image,
      hover_image: product.hover_image,
      orientation: product.orientation,
    }).eq("id", id);

    if (pError) {
      alert("Hiba a terméknél: " + pError.message);
      setSaving(false);
      return;
    }

    // 2. Variánsok frissítése (Törlés és Újra beszúrás)
    await supabase.from("product_variants").delete().eq("product_id", id);
    
    // JAVÍTÁS: Csak érvényes árakat engedünk át, és kényszerítjük az Integer típust
    const variantsToInsert = variants
      .filter(v => v.size_name.trim() !== "" && v.price !== "" && !isNaN(parseInt(v.price)))
      .map(v => ({
        product_id: id,
        size_name: v.size_name,
        price: parseInt(v.price.toString()), 
      }));

    if (variantsToInsert.length > 0) {
      const { error: vError } = await supabase.from("product_variants").insert(variantsToInsert);
      if (vError) {
        alert("Hiba a variánsoknál: " + vError.message);
      }
    }

    setSaving(false);
    router.push("/admin/products");
    router.refresh();
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-gray-300 animate-pulse tracking-widest">Adatok betöltése...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#f9f9f7] min-h-screen font-sans text-[#1a1a1a]">
      <div className="flex justify-between items-center bg-white p-6 rounded-[25px] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Szerkesztés: <span className="text-blue-600">{product.name}</span></h1>
        <button onClick={() => router.back()} className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Mégse</button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[40px] border shadow-xl space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* KÉPEK */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Termék képei</h2>
            <div className="space-y-4">
              {[
                { type: 'cover', label: 'Borítókép', url: product.cover_image },
                { type: 'hover', label: 'Hover kép', url: product.hover_image }
              ].map((img) => (
                <div key={img.type} className="group relative border-2 border-dashed border-gray-100 rounded-[30px] p-2 text-center bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                  
                  {img.url ? (
                    <Image 
                      src={img.url} 
                      fill 
                      className="object-cover rounded-[25px]" 
                      alt={img.label}
                      unoptimized 
                    />
                  ) : (
                    <div className="text-[10px] font-bold text-gray-300 uppercase">Nincs kép feltöltve</div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center rounded-[25px] backdrop-blur-sm">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, img.type as any, img.type === 'cover' ? setUploadingCover : setUploadingHover)} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Kép cseréje</span>
                  </div>

                  {(img.type === 'cover' ? uploadingCover : uploadingHover) && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center font-black text-[10px] animate-pulse rounded-[25px]">Feltöltés...</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ADATOK */}
          <div className="space-y-5">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Alapadatok</h2>
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Termék neve</label>
               <input placeholder="Név" required className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-bold outline-none focus:ring-2 ring-blue-100" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Kategória</label>
                <select required className="w-full h-14 bg-gray-50 border-none rounded-2xl px-4 text-[11px] font-black uppercase outline-none" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})}>
                  <option value="">Válassz...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">3D Tájolás</label>
                <select required className="w-full h-14 bg-gray-100 border-none rounded-2xl px-4 text-[11px] font-black uppercase outline-none focus:ring-2 ring-emerald-100" value={product.orientation} onChange={(e) => setProduct({...product, orientation: e.target.value})}>
                  <option value="portrait">📐 Álló</option>
                  <option value="landscape">📏 Fekvő</option>
                  <option value="square">🔲 Négyzet</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Leírás</label>
              <textarea placeholder="Leírás..." className="w-full p-5 bg-gray-50 border-none rounded-2xl h-32 outline-none focus:ring-2 ring-blue-100 text-sm font-medium" value={product.description} onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>
          </div>

          {/* VARIÁNSOK */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Méretek</h2>
              <button type="button" onClick={() => setVariants([...variants, {size_name: "", price: ""}])} className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">+ Új sor</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center group animate-in zoom-in-95">
                  <input placeholder="Méret" className="flex-1 h-12 bg-gray-50 rounded-xl px-4 text-xs font-bold border border-transparent focus:border-gray-200 outline-none" value={v.size_name} onChange={(e) => {
                    const updated = [...variants];
                    updated[i].size_name = e.target.value;
                    setVariants(updated);
                  }} />
                  <input type="text" placeholder="Ár" className="w-24 h-12 bg-gray-50 rounded-xl px-4 text-xs font-bold border border-transparent focus:border-gray-200 outline-none" value={v.price} onChange={(e) => {
                    const updated = [...variants];
                    updated[i].price = e.target.value;
                    setVariants(updated);
                  }} />
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-300 hover:text-red-500 transition-colors p-2 font-bold">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full h-16 bg-black text-white rounded-[20px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">
          {saving ? "Mentés folyamatban..." : "Változtatások rögzítése"}
        </button>
      </form>
    </div>
  );
}