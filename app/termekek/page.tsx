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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Biztosan törölni akarod a "${name}" terméket?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Hiba: " + error.message);
    else setProducts(products.filter(p => p.id !== id));
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

    // Validáció: Név, Kategória és legalább egy Fő kép kötelező
    if (!newProduct.name || !newProduct.category_id || !newProduct.cover_image) {
      alert("Hiba: A név, kategória és a fő kép megadása kötelező!");
      return;
    }

    setIsSaving(true);
    
    try {
      const slug = newProduct.name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w ]+/g, "")
        .replace(/\s+/g, "-");
      
      // Tisztított objektum küldése az adatbázisnak
      const finalProduct = {
        name: newProduct.name,
        category_id: newProduct.category_id,
        cover_image: newProduct.cover_image,
        hover_image: newProduct.hover_image || null,
        texture_image: newProduct.texture_image || newProduct.cover_image, // Ha nincs 3D, a főképet használja
        orientation: newProduct.orientation,
        slug: slug,
        is_active: true // Nagyon fontos: e nélkül nem jelenik meg a főoldalon!
      };

      // 1. Termék mentése
      const { data: pData, error: pError } = await supabase
        .from("products")
        .insert([finalProduct])
        .select()
        .single();

      if (pError) throw new Error(`Adatbázis hiba: ${pError.message}`);

      // 2. Variánsok mentése
      if (pData) {
        const vToInsert = variants
          .filter(v => v.size_name && v.price)
          .map(v => ({
            product_id: pData.id,
            size_name: v.size_name,
            price: parseInt(v.price.toString()) || 0
          }));

        if (vToInsert.length > 0) {
          const { error: vError } = await supabase.from("product_variants").insert(vToInsert);
          if (vError) alert("A termék mentve, de a méreteket nem sikerült rögzíteni!");
        }
      }

      // Siker esetén reset
      alert("Termék sikeresen rögzítve!");
      setNewProduct({ name: "", category_id: "", cover_image: "", hover_image: "", texture_image: "", orientation: "portrait" });
      setVariants([{ size_name: "", price: "" }]);
      setIsAdding(false);
      fetchProducts();

    } catch (error: any) {
      console.error(error);
      alert(error.message);
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
              <option value="landscape">📏 Fekvő</option>
              <option value="square">🔲 Négyzet</option>
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
             <p className="text-[10px] font-black uppercase text-gray-400 italic">3. Média (Borító, Hover, 3D)</p>
             <div className="grid grid-cols-3 gap-2">
                <div className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors">
                    {newProduct.cover_image ? <Image src={newProduct.cover_image} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-gray-400">FŐ KÉP</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'cover')} />
                </div>
                <div className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors">
                    {newProduct.hover_image ? <Image src={newProduct.hover_image} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-gray-400">HOVER</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'hover')} />
                </div>
                <div className="relative aspect-square bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-100 transition-colors">
                    {newProduct.texture_image ? <Image src={newProduct.texture_image} fill className="object-cover" alt="" /> : <span className="text-[7px] font-black text-blue-400 text-center px-1">3D ALAP KÉP</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'texture')} />
                </div>
             </div>
             <button disabled={isSaving} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
              {isSaving ? "Folyamatban..." : "Termék rögzítése"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.5em] animate-pulse">Adatok betöltése...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border-2 border-gray-50 rounded-2xl p-2 hover:border-black transition-all group flex flex-col relative">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gray-100">
                <Image src={p.cover_image || "/placeholder.jpg"} fill className="object-cover transition-transform group-hover:scale-105 duration-500" alt="" />
                
                {p.texture_image && (
                  <div className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-lg font-bold">
                    3D
                  </div>
                )}

                <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[7px] font-black uppercase">
                  {p.orientation === 'portrait' ? '📐 ÁLLÓ' : p.orientation === 'landscape' ? '📏 FEKVŐ' : '🔲 NÉGYZET'}
                </div>

                <button 
                  onClick={() => handleDelete(p.id, p.name)}
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
    </div>
  );
}