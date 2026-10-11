"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { setSession } from "@/lib/auth";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", storeName: "", accountType: "CUSTOMER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await api.post("/auth/register", form);
      setSession(r.data);
      router.push(r.data.role === "VENDOR" ? "/vendor/dashboard" : "/");
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل إنشاء الحساب");
    }
    setLoading(false);
  };

  const inputCls = "w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-slate-900 to-indigo-900 p-4" dir="rtl">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-1">⚡ سيلايز</h1>
        <p className="text-center text-gray-500 mb-6">أنشئ حسابك الجديد</p>
        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[{ v: "CUSTOMER", t: "🛒 عميل" }, { v: "VENDOR", t: "🏪 بائع" }].map((o) => (
            <button type="button" key={o.v} onClick={() => setForm({ ...form, accountType: o.v })}
              className={`border-2 rounded-xl py-3 font-bold transition ${form.accountType === o.v ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500"}`}>
              {o.t}
            </button>
          ))}
        </div>

        <input placeholder="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
        {form.accountType === "VENDOR" && (
          <input required placeholder="اسم المتجر" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={inputCls} />
        )}
        <input type="email" required placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        <input type="password" required minLength={8} placeholder="كلمة المرور (8 أحرف فأكثر)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-3 font-bold hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          لديك حساب بالفعل؟ <Link href="/login" className="text-indigo-600 font-bold">تسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
}
