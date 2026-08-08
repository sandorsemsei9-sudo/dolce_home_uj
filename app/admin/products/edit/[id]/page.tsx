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
    description: "",
    cover_image: "",
    hover_image: "",
    texture_image: "",
    texture_image_2: "",
    texture_image_3: "",
    orientation: "portrait",
    parts_count: 1,
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);
  const [uploadingTexture, setUploadingTexture] = useState(false);
  const [uploadingTexture2, setUploadingTexture2] = useState(false);
  const [uploadingTexture3, setUploadingTexture3] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. Kategóriák betöltése
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) {
        setCategories(catData.map(c => ({ ...c, id: Number(c.id) })));
      }

      // 2. Termék adatok betöltése
      const { data: pData } = await supabase.from("products").select("*").eq("id", id).single();
      if (pData) {
        setProduct({
          name: pData.name || "",
          slug: pData.slug || "",
          description: pData.description || "",
          cover_image: pData.cover_image || "",
          hover_image: pData.hover_image || "",
          texture_image: pData.texture_image || "",
          texture_image_2: pData.texture_image_2 || "",
          texture_image_3: pData.texture_image_3 || "",
          orientation: pData.orientation || "portrait",
          parts_count: pData.parts_count || 1,
        });
      }

      // 3. Kapcsolt kategóriák betöltése duplikáció-szűréssel
      const { data: pcData } = await supabase.from("product_categories").select("category_id").eq("product_id", id);
      
      let initialSelected: number[] = [];
      if (pcData && pcData.length > 0) {
        initialSelected = Array.from(new Set(pcData.map(item => Number(item.category_id))));
      } else if (pData && pData.category_id) {
        initialSelected = [Number(pData.category_id)];
      }
      
      setSelectedCategories(initialSelected);

      // 4. Variánsok betöltése
      const { data: vData } = await supabase.from("product_variants").select("*").eq("product_id", id);
      if (vData) {
        setVariants(vData.map(v => ({
          size_name: v.size_name,
          price: v.price.toString()
        })));
      }
      
      setLoading(false);
    }
    if (id) loadData();
  }, [id, supabase]);

const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'cover' | 'hover' | 'texture' | 'texture2' | 'texture3', 
    setUploadingFn: (b: boolean) => void
  ) => {
    try {
      setUploadingFn(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      // Használjuk a termék slug-ját mappaként, vagy fallback-ként az id-t, ha még üres a slug
      const folderName = product.slug.trim() !== "" ? product.slug : id;
      const fileName = `${folderName}/${Date.now()}-${type}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      const { error: uploadError } = await supabase.storage.from("products").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      
      let field = 'cover_image';
      if (type === 'hover') field = 'hover_image';
      else if (type === 'texture') field = 'texture_image';
      else if (type === 'texture2') field = 'texture_image_2';
      else if (type === 'texture3') field = 'texture_image_3';

      setProduct(prev => ({ ...prev, [field]: data.publicUrl }));

    } catch (error: any) {
      alert("Hiba: " + error.message);
    } finally {
      setUploadingFn(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const primaryCategoryId = selectedCategories.length > 0 ? selectedCategories[0] : null;
    const isThreePiece = product.orientation === "three-piece";

    // 1. Termék alapadatok mentése
    const { error: pError } = await supabase.from("products").update({
      name: product.name,
      slug: product.slug,
      category_id: primaryCategoryId, 
      description: product.description,
      cover_image: product.cover_image,
      hover_image: product.hover_image,
      texture_image: product.texture_image || product.cover_image,
      texture_image_2: isThreePiece ? product.texture_image_2 : null,
      texture_image_3: isThreePiece ? product.texture_image_3 : null,
      orientation: product.orientation,
      parts_count: isThreePiece ? 3 : 1,
    }).eq("id", id);

    if (pError) {
      alert("Hiba a terméknél: " + pError.message);
      setSaving(false);
      return;
    }

    // 2. Kategóriák frissítése UPSERT-tel
    if (selectedCategories.length > 0) {
      const uniqueCategoryIds = Array.from(new Set(selectedCategories.map(Number)));

      const categoriesToInsert = uniqueCategoryIds.map(catId => ({
        product_id: Number(id),
        category_id: catId,
      }));

      const { error: catRelError } = await supabase
        .from("product_categories")
        .upsert(categoriesToInsert, { onConflict: 'product_id, category_id' });

      if (catRelError) {
        alert("Hiba a kategóriák mentésekor: " + catRelError.message);
      }
    }

    // 3. Variánsok frissítése
    await supabase.from("product_variants").delete().eq("product_id", id);
    
    const variantsToInsert = variants
      .filter(v => v.size_name.trim() !== "" && v.price !== "" && !isNaN(parseInt(v.price)))
      .map(v => ({
        product_id: Number(id),
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
          
          {/* MÉDIA SZEKCIÓ */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Termék médiatár</h2>
            <div className="space-y-4">
              {[
                { type: 'cover', label: 'Borító (Webshop)', url: product.cover_image, status: uploadingCover, setter: setUploadingCover },
                { type: 'hover', label: 'Másodlagos kép', url: product.hover_image, status: uploadingHover, setter: setUploadingHover },
                { type: 'texture', label: '3D Textúra (Alap / 1)', url: product.texture_image, status: uploadingTexture, setter: setUploadingTexture }
              ].map((img) => (
                <div key={img.type} className={`group relative border-2 border-dashed rounded-[30px] p-2 text-center aspect-square flex items-center justify-center overflow-hidden transition-all ${img.type.startsWith('texture') ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                  
                  {img.url ? (
                    <Image 
                      src={img.url} 
                      fill 
                      className="object-cover rounded-[25px]" 
                      alt={img.label}
                      unoptimized 
                    />
                  ) : (
                    <div className="text-[10px] font-bold text-gray-300 uppercase">{img.label} helye</div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center rounded-[25px] backdrop-blur-sm">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, img.type as any, img.setter)} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{img.label} cseréje</span>
                  </div>

                  {img.status && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center font-black text-[10px] animate-pulse rounded-[25px]">Feltöltés...</div>
                  )}
                </div>
              ))}

              {/* Ha háromrészes a termék, megjelennek a további 3D képek is */}
              {product.orientation === "three-piece" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-gray-200">
                  {[
                    { type: 'texture2', label: '3D Kép 2', url: product.texture_image_2, status: uploadingTexture2, setter: setUploadingTexture2 },
                    { type: 'texture3', label: '3D Kép 3', url: product.texture_image_3, status: uploadingTexture3, setter: setUploadingTexture3 }
                  ].map((img) => (
                    <div key={img.type} className="group relative border-2 border-dashed border-blue-100 rounded-[25px] p-2 text-center aspect-square flex items-center justify-center overflow-hidden bg-blue-50/30 transition-all">
                      {img.url ? (
                        <Image src={img.url} fill className="object-cover rounded-[20px]" alt={img.label} unoptimized />
                      ) : (
                        <div className="text-[9px] font-bold text-blue-300 uppercase">{img.label} helye</div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center rounded-[20px] backdrop-blur-sm">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, img.type as any, img.setter)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Csere</span>
                      </div>
                      {img.status && <div className="absolute inset-0 bg-white/90 flex items-center justify-center font-black text-[9px] animate-pulse rounded-[20px]">Feltöltés...</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ADATOK */}
          <div className="space-y-5 text-left">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Alapadatok</h2>
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Termék neve</label>
               <input placeholder="Név" required className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-bold outline-none focus:ring-2 ring-blue-100" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Kategóriák</label>
                <div className="max-h-36 overflow-y-auto bg-gray-50 p-3 rounded-2xl space-y-2 border border-gray-100">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(Number(c.id))}
                        onChange={(e) => {
                          const catIdNum = Number(c.id);
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, catIdNum]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== catIdNum));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-100"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">3D Tájolás</label>
                <select required className="w-full h-14 bg-gray-100 border-none rounded-2xl px-4 text-[11px] font-black uppercase outline-none focus:ring-2 ring-emerald-100" value={product.orientation} onChange={(e) => setProduct({...product, orientation: e.target.value})}>
                  <option value="portrait">📐 Álló</option>
                  <option value="landscape">📏 Fekvő</option>
                  <option value="square">🔲 Négyzet</option>
                  <option value="panorama">🎞️ Panoráma</option>
                  <option value="three-piece">🖼️ Háromrészes</option>
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
            <div className="flex justify-between items-center text-left">
              <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Méretek & Árak</h2>
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