"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { setSession } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", mfaCode: "" });
  const [mfaPending, setMfaPending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await api.post("/auth/login", form);
      if (r.data.mfaPending) { setMfaPending(true); setLoading(false); return; }
      setSession(r.data);
      router.push(r.data.role === "ADMIN" ? "/admin" : r.data.role === "VENDOR" ? "/vendor/dashboard" : "/");
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل تسجيل الدخول");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-slate-900 to-indigo-900 p-4" dir="rtl">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-1">⚡ سيلايز</h1>
        <p className="text-center text-gray-500 mb-6">تسجيل الدخول إلى حسابك</p>
        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}
        <input type="email" required placeholder="البريد الإلكتروني" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input type="password" required placeholder="كلمة المرور" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
        {mfaPending && (
          <input type="text" maxLength={6} required placeholder="رمز التحقق الثنائي (6 أرقام)" value={form.mfaCode}
            onChange={(e) => setForm({ ...form, mfaCode: e.target.value })}
            className="w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
        )}
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-3 font-bold hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          ليس لديك حساب؟ <Link href="/register" className="text-indigo-600 font-bold">إنشاء حساب</Link>
        </p>
      </form>
    </div>
  );
}
