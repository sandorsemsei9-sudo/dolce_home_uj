"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Join: lekérjük a kategória NEVÉT is a products táblához
    const { data: pData } = await supabase
      .from("products")
      .select("*, categories(name), product_variants(price)")
      .order("id", { ascending: false });
      
    const { data: cData } = await supabase.from("categories").select("*");
    
    if (pData) setProducts(pData);
    if (cData) setCategories(cData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Biztosan törlöd ezt a terméket és az összes méretét?")) return;

    // Előbb a variánsokat töröljük (ha nincs Cascade Delete beállítva)
    await supabase.from("product_variants").delete().eq("product_id", id);
    // Utána a terméket
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Hiba a törlés során: " + error.message);
    } else {
      fetchData(); // Lista frissítése
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "all" || p.category_id?.toString() === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Termékek</h1>
          <p className="text-gray-500">{products.length} termék az adatbázisban</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-md"
        >
          + Új termék
        </Link>
      </div>

      {/* SZŰRŐK */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <input 
            placeholder="Keresés név alapján..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full border-none shadow-sm p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-black"
          />
          <span className="absolute left-4 top-4 text-gray-400">🔍</span>
        </div>
        <select 
          value={selectedCat} 
          onChange={e => setSelectedCat(e.target.value)}
          className="border-none shadow-sm p-4 rounded-2xl bg-white w-full md:w-64 outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">Minden kategória</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* TERMÉK LISTA */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Betöltés...</p>
        ) : filteredProducts.map(p => (
          <div key={p.id} className="flex items-center gap-6 border border-transparent p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all group">
            {/* Kép */}
            <div className="w-20 h-20 flex-shrink-0">
              <img 
                src={p.cover_image || "/placeholder.png"} 
                className="w-full h-full object-cover rounded-xl border" 
                alt={p.name}
              />
            </div>

            {/* Szöveges adatok */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">{p.name}</h2>
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                  {p.categories?.name || "Nincs kategória"}
                </span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-1">{p.description || "Nincs leírás."}</p>
            </div>

            {/* AKCIÓK (Szerkesztés és Törlés) */}
            <div className="flex gap-3">
              <Link 
                href={`/admin/products/edit/${p.id}`} 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Szerkesztés
              </Link>
              <button 
                onClick={() => handleDelete(p.id)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
              >
                Törlés
              </button>
            </div>
          </div>
        ))}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400">Nincs a szűrésnek megfelelő termék.</p>
          </div>
        )}
      </div>
    </div>
  );
}