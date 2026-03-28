"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminNewsletter() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSubs();
  }, []);

  async function fetchSubs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subs")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (data) setSubs(data);
    setLoading(false);
  }

  // Funkció a feliratkozó törléséhez (ha kérik)
  async function deleteSub(id: number) {
    if (!confirm("Biztosan törölni szeretnéd ezt a feliratkozót?")) return;
    
    const { error } = await supabase
      .from("newsletter_subs")
      .delete()
      .eq("id", id);

    if (!error) fetchSubs();
  }

  return (
    <div className="p-8 bg-white rounded-[30px] shadow-sm border border-[#e7d8ca]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1720]">Hírlevél feliratkozók</h1>
          <p className="text-sm text-[#8a7b72] mt-1">Összesen {subs.length} feliratkozó</p>
        </div>
        <button 
          onClick={fetchSubs}
          className="px-4 py-2 bg-[#f8f1ea] text-[#3b2b24] rounded-full text-sm font-medium hover:bg-[#ede0d4] transition"
        >
          Frissítés
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f3e7dc]">
              <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-[#d1845c]">E-mail cím</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-[#d1845c]">Dátum</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-[#d1845c] text-right">Művelet</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-10 text-center text-[#8a7b72]">Betöltés...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={3} className="py-10 text-center text-[#8a7b72]">Még nincs feliratkozó.</td></tr>
            ) : (
              subs.map((sub) => (
                <tr key={sub.id} className="border-b border-[#f3e7dc] hover:bg-[#faf7f4] transition">
                  <td className="py-4 px-4 text-sm font-medium text-[#1f1720]">{sub.email}</td>
                  <td className="py-4 px-4 text-sm text-[#6f625c]">
                    {new Date(sub.subscribed_at).toLocaleDateString("hu-HU")} {new Date(sub.subscribed_at).toLocaleTimeString("hu-HU", { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => deleteSub(sub.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter transition"
                    >
                      Törlés
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}