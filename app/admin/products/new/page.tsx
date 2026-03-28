"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Külön állapot a két kép feltöltésének követésére
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    category_id: "",
    cover_image: "", 
    hover_image: "", // Új mező az állapotban
    description: "",
    is_active: true,
    variants: [{ size_name: "", price: "" }]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const { data: pData } = await supabase
      .from("products")
      .select("*, categories(name), product_variants(*)")
      .order("created_at", { ascending: false });
    
    const { data: cData } = await supabase.from("categories").select("*");

    if (pData) setProducts(pData);
    if (cData) setCategories(cData);
    setLoading(false);
  }

  // --- ÁLTALÁNOS KÉPFELTÖLTÉS ---
  // Típust (cover/hover) és a hozzá tartozó setUploading függvényt kapja meg
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'hover', setUploadingFn: (b: boolean) => void) => {
    try {
      setUploadingFn(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      // Egyedi filenév, hogy ne írja felül a régit
      const fileName = `${Date.now()}-${type}-${file.name}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      // Frissítjük a megfelelő mezőt az állapotban
      if (type === 'cover') {
        setNewProduct({ ...newProduct, cover_image: data.publicUrl });
      } else {
        setNewProduct({ ...newProduct, hover_image: data.publicUrl });
      }

      alert(`${type === 'cover' ? 'Borítókép' : 'Hover kép'} sikeresen feltöltve!`);

    } catch (error: any) {
      alert("Hiba: " + error.message);
    } finally {
      setUploadingFn(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/\s+/g, "-");
    setNewProduct({ ...newProduct, name, slug });
  };

  const addVariantRow = () => {
    setNewProduct({ ...newProduct, variants: [...newProduct.variants, { size_name: "", price: "" }] });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    setNewProduct({ ...newProduct, variants: newProduct.variants.filter((_, i) => i !== index) });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // Most már mindkét kép kötelező
    if (!newProduct.category_id || !newProduct.cover_image || !newProduct.hover_image) {
      alert("Név, kategória, borítókép és hover kép megadása is kötelező!");
      return;
    }

    // 1. Termék mentése az új hover_image oszloppal
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([{
        name: newProduct.name,
        slug: newProduct.slug,
        category_id: parseInt(newProduct.category_id),
        cover_image: newProduct.cover_image,
        hover_image: newProduct.hover_image, // Mentjük az új képet
        description: newProduct.description,
        is_active: true
      }])
      .select()
      .single();

    if (productError) return alert("Termék hiba: " + productError.message);

    // 2. Variánsok mentése
    const variantsToInsert = newProduct.variants
      .filter(v => v.size_name && v.price)
      .map(v => ({
        product_id: productData.id,
        size_name: v.size_name,
        price: parseInt(v.price as string),
        is_active: true
      }));

    if (variantsToInsert.length > 0) {
      const { error: variantError } = await supabase.from("product_variants").insert(variantsToInsert);
      if (variantError) alert("Variáns hiba: " + variantError.message);
    }

    setShowAddForm(false);
    // Visszaállítjuk az üres állapotot (hover_image-dzsel együtt)
    setNewProduct({ name: "", slug: "", category_id: "", cover_image: "", hover_image: "", description: "", is_active: true, variants: [{ size_name: "", price: "" }] });
    fetchInitialData();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Biztosan törlöd ezt a terméket?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchInitialData();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-[#f7f7f5] min-h-screen text-[#1f1f1f]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Termékek és Méretek</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-black text-white px-6 py-2 rounded-full font-bold transition hover:bg-gray-800">
          {showAddForm ? "Bezárás" : "+ Új termék hozzáadása"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[30px] border shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* BAL OLDAL: Alapadatok és Képek */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase text-gray-400">Alapadatok</h2>
              
              <input 
                placeholder="Termék neve (pl. Türkiz Álom)" required 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100" 
                value={newProduct.name}
                onChange={handleNameChange} 
              />
              
              <div className="text-[10px] text-gray-400 px-2 italic">URL: /termekek/{newProduct.slug || "az-on-termeke"}</div>

              <select required className="w-full p-3 border rounded-xl outline-none" value={newProduct.category_id} onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}>
                <option value="">Válassz kategóriát...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <textarea placeholder="Leírás..." className="w-full p-3 border rounded-xl h-24 outline-none" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
              
              {/* KÉT KÉP FELTÖLTŐ MEZŐ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed p-4 rounded-xl text-center space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 block">Borítókép</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover', setUploadingCover)} disabled={uploadingCover} className="text-[10px] w-full" />
                  {uploadingCover && <p className="text-[10px] animate-pulse">...</p>}
                  {newProduct.cover_image && <div className="relative w-16 h-16 mx-auto border rounded-lg overflow-hidden"><Image src={newProduct.cover_image} fill className="object-cover" alt="" /></div>}
                </div>
                
                <div className="border-2 border-dashed p-4 rounded-xl text-center space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 block">Hover kép (másik szög)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'hover', setUploadingHover)} disabled={uploadingHover} className="text-[10px] w-full" />
                  {uploadingHover && <p className="text-[10px] animate-pulse">...</p>}
                  {newProduct.hover_image && <div className="relative w-16 h-16 mx-auto border rounded-lg overflow-hidden"><Image src={newProduct.hover_image} fill className="object-cover" alt="" /></div>}
                </div>
              </div>
            </div>

            {/* JOBB OLDAL: Variánsok */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase text-gray-400">Elérhető méretek</h2>
                <button type="button" onClick={addVariantRow} className="text-xs font-bold text-orange-600 hover:underline">+ Új méret</button>
              </div>
              
              <div className="space-y-3">
                {newProduct.variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 items-center animate-in zoom-in-95 duration-200">
                    <input placeholder="pl: 40x60 cm" className="flex-1 p-2 border rounded-lg text-sm" value={variant.size_name} onChange={(e) => updateVariant(index, "size_name", e.target.value)} />
                    <input type="number" placeholder="Ár" className="w-24 p-2 border rounded-lg text-sm" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} />
                    {newProduct.variants.length > 1 && <button type="button" onClick={() => removeVariant(index)} className="text-red-400 p-2 text-xl">&times;</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={uploadingCover || uploadingHover} className="w-full bg-[#e3936e] text-white p-4 rounded-2xl font-bold hover:bg-[#d07f5b] transition shadow-lg disabled:opacity-50">
            {uploadingCover || uploadingHover ? "Képek mentése..." : "Termék rögzítése"}
          </button>
        </form>
      )}

      {/* TÁBLÁZAT */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b">
            <tr>
              <th className="p-5">Képek</th>
              <th className="p-5">Termék</th>
              <th className="p-5">Méretek / Árak</th>
              <th className="p-5 text-right">Művelet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <div className="flex gap-1">
                    <div className="relative w-10 h-10 rounded border bg-gray-100 overflow-hidden"><Image src={p.cover_image || "/placeholder.jpg"} fill className="object-cover" alt="" /></div>
                    <div className="relative w-10 h-10 rounded border bg-gray-100 overflow-hidden"><Image src={p.hover_image || "/placeholder.jpg"} fill className="object-cover" alt="" /></div>
                  </div>
                </td>
                <td className="p-4">
                    <span className="font-semibold">{p.name}</span>
                    <p className="text-xs text-gray-500">{p.categories?.name}</p>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.product_variants?.map((v: any) => (
                      <span key={v.id} className="text-[10px] border border-gray-200 px-2 py-0.5 rounded-full bg-white">{v.size_name}: {v.price} Ft</span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                   <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase">Törlés</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}