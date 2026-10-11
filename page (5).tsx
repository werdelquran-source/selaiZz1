"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "0", categoryId: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/products/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" }); setLoading(true);
    try {
      await api.post("/products", { ...form, price: Number(form.price), stock: Number(form.stock), images: [] });
      router.push("/vendor/products");
    } catch (err: any) {
      setMsg({ type: "err", text: err.response?.data?.error || "فشل إضافة المنتج" });
    }
    setLoading(false);
  };

  const inputCls = "w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">➕ إضافة منتج جديد</h2>
      {msg.text && <p className={`rounded-lg p-3 mb-4 text-sm ${msg.type === "err" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{msg.text}</p>}
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6">
        <input required placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        <textarea placeholder="وصف المنتج" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" step="0.01" min="0.01" placeholder="السعر (ر.س)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
          <input required type="number" min="0" placeholder="الكمية بالمخزون" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
        </div>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
          <option value="">اختر التصنيف…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-3 font-bold hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "جارٍ الحفظ…" : "حفظ المنتج"}
        </button>
      </form>
    </div>
  );
}
