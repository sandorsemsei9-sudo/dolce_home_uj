"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("id", { ascending: true });
    if (data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    // Készítünk egy slug-ot (pl. "Absztrakt Képek" -> "absztrakt-kepek")
    const generatedSlug = newName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    const { error } = await supabase.from("categories").insert([
      { 
        name: newName, 
        slug: generatedSlug // Ha lefuttattad az SQL-t, ez így már jó lesz!
      }
    ]);

    if (error) {
      console.error("Hiba történt:", error.message);
      alert("Hiba: " + error.message); // Így rögtön látod a képernyőn, ha baj van
    } else {
      setNewName("");
      fetchCategories();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vigyázz! Ha törlöd a kategóriát, a hozzá tartozó termékeknél hiba lehet, ha nincsenek átállítva. Biztosan törlöd?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Kategóriák kezelése</h1>

      {/* ÚJ KATEGÓRIA HOZZÁADÁSA */}
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Új kategória neve (pl. Festmények)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400"
        >
          Hozzáadás
        </button>
      </form>

      {/* KATEGÓRIÁK LISTÁJA */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        {categories.map((cat) => (
          <div key={cat.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition">
            <div>
              <p className="font-bold text-gray-900">{cat.name}</p>
              <p className="text-xs text-gray-400">Slug: {cat.slug}</p>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition"
            >
              Törlés
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="p-8 text-center text-gray-400">Még nincsenek kategóriák.</p>}
      </div>
    </div>
  );
}