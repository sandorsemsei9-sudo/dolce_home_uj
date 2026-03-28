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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Helytelen email vagy jelszó!");
      setLoading(false);
    } else {
      router.push("/admin"); // Sikeres belépés után a dashboardra dob
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Dolce <span className="text-blue-600">Home</span>
          </h1>
          <p className="text-gray-400 font-medium mt-2">Adminisztrátori belépés</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-4">Email cím</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="admin@dolcehome.hu"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-4">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:bg-gray-300"
          >
            {loading ? "Belépés..." : "Bejelentkezés"}
          </button>
        </form>
      </div>
    </div>
  );
}