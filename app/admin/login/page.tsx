"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Helytelen email vagy jelszó!");
        setLoading(false);
        return;
      }

      // Ha sikeres a belépés, teljes oldalfrissítéssel navigálunk.
      // Ez biztosítja, hogy a Middleware és a Server Componentek 
      // azonnal érzékeljék az új munkamenetet (session).
      if (data?.session) {
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Váratlan hiba történt a bejelentkezés során.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Dolce <span className="text-[#de8c63]">Home</span>
          </h1>
          <p className="text-gray-400 font-medium mt-2 text-sm md:text-base">
            Adminisztrátori belépés
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-4">
              Email cím
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 md:p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#de8c63] outline-none mt-1 text-sm font-medium"
              placeholder="admin@dolcehome.hu"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-4">
              Jelszó
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 md:p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#de8c63] outline-none mt-1 text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black py-3 md:py-4 rounded-2xl hover:bg-[#de8c63] transition-all shadow-lg active:scale-95 disabled:bg-gray-300 text-sm uppercase tracking-widest mt-4"
          >
            {loading ? "Folyamatban..." : "Bejelentkezés"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-[10px] font-bold text-gray-400 hover:text-black transition uppercase tracking-widest"
          >
            ← Vissza a főoldalra
          </button>
        </div>
      </div>
    </div>
  );
}