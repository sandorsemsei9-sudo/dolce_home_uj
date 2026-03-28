"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const generateCouponCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DH-${result}`;
};

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("newsletter_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 10500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("newsletter_seen", "true");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const newCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    try {
      // 1. Feliratkozó mentése
      const { error: subError } = await supabase
        .from("newsletter_subs")
        .insert([{ email }]);

      if (subError) {
        if (subError.code === "23505") throw new Error("Ez az e-mail cím már feliratkozott!");
        throw subError;
      }

      // 2. Egyedi kupon mentése (MINDEN kötelező mezővel)
      const { error: couponError } = await supabase
        .from("coupons")
        .insert([{ 
          code: newCode, 
          discount_value: 10, 
          discount_type: 'percentage',
          expires_at: expiresAt.toISOString(),
          is_one_time: true 
        }]);

      if (couponError) throw couponError;

      setGeneratedCode(newCode);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Hiba történt.");
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 text-center">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#e7d8ca] bg-gradient-to-br from-[#f8f1ea] to-[#f3e7dc] px-8 py-8 shadow-2xl">
        <button onClick={handleClose} className="absolute right-4 top-4 text-2xl text-[#3b2b24]">×</button>

        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#d1845c]">
          {status === "success" ? "Gratulálunk!" : "Kedvezmény első rendelésre"}
        </p>
        <h2 className="text-3xl font-semibold text-[#1f1720]">
          {status === "success" ? "Íme a saját kódod!" : "Iratkozz fel és kapj -10%-ot"}
        </h2>

        {status === "success" ? (
          <div className="mt-8 flex flex-col items-center">
            <button onClick={copyToClipboard} className="group flex flex-col items-center">
              <div className="rounded-xl border-2 border-dashed border-[#de8c63] bg-white px-10 py-5 text-3xl font-bold tracking-widest text-[#de8c63] transition group-hover:scale-105">
                {generatedCode}
              </div>
              <p className="mt-3 text-sm font-medium text-[#d1845c]">
                {copied ? "Másolva! ✓" : "Kattints a kódra a másoláshoz"}
              </p>
            </button>
            <p className="mt-4 text-xs text-[#6f625c]">Vigyázz! A kód 24 óra múlva lejár.</p>
            <button onClick={handleClose} className="mt-6 h-12 w-full rounded-full bg-[#de8c63] font-bold text-white transition hover:bg-[#cc7b53]">
              Vissza a vásárláshoz
            </button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-[#6f625c]">Küldünk egy egyedi kupont, amit 24 órán belül használhatsz fel.</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail címed"
                className="h-14 flex-1 rounded-xl border border-[#dcc9b9] bg-white px-5 outline-none focus:border-[#d1845c]"
              />
              <button type="submit" disabled={status === "loading"} className="h-14 rounded-xl bg-[#de8c63] px-8 font-bold text-white transition hover:bg-[#cc7b53] disabled:opacity-50">
                {status === "loading" ? "..." : "Kérem a kódot"}
              </button>
            </form>
          </>
        )}
        {status === "error" && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
}