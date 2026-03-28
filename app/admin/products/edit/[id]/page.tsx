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

  // Állapot a termék adatokhoz
  const [product, setProduct] = useState({
    name: "",
    slug: "",
    category_id: "" as string | number,
    description: "",
    cover_image: "",
    hover_image: "",
  });

  const [variants, setVariants] = useState<any[]>([]);

  // Képfeltöltés állapotok
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // 1. Kategóriák
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      // 2. Termék adatok
      const { data: pData } = await supabase.from("products").select("*").eq("id", id).single();
      if (pData) {
        setProduct({
          name: pData.name || "",
          slug: pData.slug || "",
          category_id: pData.category_id || "",
          description: pData.description || "",
          cover_image: pData.cover_image || "",
          hover_image: pData.hover_image || "",
        });
      }

      // 3. Variánsok
      const { data: vData } = await supabase.from("product_variants").select("*").eq("product_id", id);
      if (vData) {
        setVariants(vData.map(v => ({
          size_name: v.size_name,
          price: v.price
        })));
      }
      setLoading(false);
    }
    loadData();
  }, [id, supabase]);

  // --- KÉPFELTÖLTÉS KEZELÉSE ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover', setUploadingFn: (b: boolean) => void) => {
    try {
      setUploadingFn(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      const fileName = `${Date.now()}-${type}-${file.name}`;
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/\s+/g, "-");
    setProduct({ ...product, name, slug });
  };

  const addVariant = () => setVariants([...variants, { size_name: "", price: "" }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 1. Termék frissítése
    const { error: pError } = await supabase.from("products").update({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      description: product.description,
      cover_image: product.cover_image,
      hover_image: product.hover_image,
    }).eq("id", id);

    if (pError) {
      alert("Hiba a termék mentésekor: " + pError.message);
      setSaving(false);
      return;
    }

    // 2. Variánsok szinkronizálása (Törlés és újra beszúrás)
    await supabase.from("product_variants").delete().eq("product_id", id);
    const variantsToInsert = variants
      .filter(v => v.size_name && v.price)
      .map(v => ({
        product_id: id,
        size_name: v.size_name,
        price: parseInt(v.price as string),
      }));

    if (variantsToInsert.length > 0) {
      await supabase.from("product_variants").insert(variantsToInsert);
    }

    setSaving(false);
    router.push("/admin/products");
    router.refresh();
  };

  if (loading) return <div className="p-20 text-center font-bold animate-pulse">Adatok betöltése...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#f7f7f5] min-h-screen text-[#1f1f1f]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Termék <span className="text-[#e3936e]">Szerkesztése</span>
        </h1>
        <button onClick={() => router.back()} className="text-sm font-bold text-gray-400 hover:text-black transition">
          Mégse / Vissza
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[40px] border shadow-sm space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* BAL OSZLOP: ALAPADATOK */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Alapadatok</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold ml-2">Termék neve</label>
              <input 
                required className="w-full p-4 border rounded-2xl outline-none focus:ring-2 ring-orange-100 font-semibold text-lg" 
                value={product.name} onChange={handleNameChange} 
              />
              <div className="text-[10px] text-gray-400 px-2 italic">URL: /termekek/{product.slug}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold ml-2">Kategória</label>
              <select 
                required className="w-full p-4 border rounded-2xl outline-none bg-gray-50 font-medium" 
                value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})}
              >
                <option value="">Válassz kategóriát...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold ml-2">Leírás</label>
              <textarea 
                className="w-full p-4 border rounded-2xl h-32 outline-none resize-none font-medium" 
                value={product.description} onChange={(e) => setProduct({...product, description: e.target.value})} 
              />
            </div>

            {/* KÉPEK SZERKESZTÉSE */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 text-center block">Borítókép</label>
                <div className="relative aspect-square border-2 border-dashed rounded-3xl overflow-hidden group">
                  <Image src={product.cover_image || "/placeholder.jpg"} fill className="object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover', setUploadingCover)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="text-white text-[10px] font-bold text-center leading-tight">Kattints a cseréhez</span>
                  </div>
                </div>
                {uploadingCover && <p className="text-[10px] text-center animate-pulse text-orange-600 font-bold">Töltés...</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 text-center block">Hover kép</label>
                <div className="relative aspect-square border-2 border-dashed rounded-3xl overflow-hidden group">
                  <Image src={product.hover_image || "/placeholder.jpg"} fill className="object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'hover', setUploadingHover)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="text-white text-[10px] font-bold text-center leading-tight">Kattints a cseréhez</span>
                  </div>
                </div>
                {uploadingHover && <p className="text-[10px] text-center animate-pulse text-orange-600 font-bold">Töltés...</p>}
              </div>
            </div>
          </div>

          {/* JOBB OSZLOP: VARIÁNSOK */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Méretek és Árak</h2>
              <button type="button" onClick={addVariant} className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition">+ Új méret</button>
            </div>
            
            <div className="space-y-3 bg-gray-50/50 p-6 rounded-3xl border border-dashed">
              {variants.map((v, index) => (
                <div key={index} className="flex gap-2 items-center group">
                  <input 
                    placeholder="pl: 40x60 cm" className="flex-1 p-3 border rounded-xl text-sm font-bold outline-none focus:bg-white transition" 
                    value={v.size_name} onChange={(e) => updateVariant(index, "size_name", e.target.value)} 
                  />
                  <input 
                    type="number" placeholder="Ár" className="w-28 p-3 border rounded-xl text-sm font-black text-blue-600 outline-none focus:bg-white transition" 
                    value={v.price} onChange={(e) => updateVariant(index, "price", e.target.value)} 
                  />
                  <button type="button" onClick={() => removeVariant(index)} className="text-gray-300 hover:text-red-500 p-2 transition">
                    &times;
                  </button>
                </div>
              ))}
              {variants.length === 0 && <p className="text-center text-xs text-gray-400 italic py-4">Nincs megadva méret.</p>}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving || uploadingCover || uploadingHover} 
          className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition shadow-xl disabled:opacity-50 active:scale-95"
        >
          {saving ? "Mentés folyamatban..." : "Változtatások Mentése"}
        </button>
      </form>
    </div>
  );
}