"use client";
import { useEffect, useState } from "react";
import StorefrontHeader from "@/components/StorefrontHeader";
import api from "@/lib/axios";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/products?limit=100").then((r) => setProducts(r.data.items)).catch(() => {});
    api.get("/products/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const filtered = search
    ? products.filter((p) => p.name.includes(search))
    : products;

  return (
    <div>
      <StorefrontHeader />
      <section className="bg-gradient-to-l from-slate-900 to-indigo-900 text-white text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">تسوّق من آلاف المنتجات في منصة واحدة</h1>
        <p className="text-lg text-slate-300 mb-8">سيلايز — وجهتك الأولى للتسوق الإلكتروني الآمن وسريع التوصيل</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منتج…"
          className="w-full max-w-md px-5 py-3 rounded-full text-gray-900 text-right"
        />
      </section>

      <main id="products" className="max-w-6xl mx-auto px-4 py-10">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <span key={c.id} className="bg-white border rounded-full px-4 py-1 text-sm text-gray-600">
                {c.name} ({c._count?.products ?? 0})
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col">
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-slate-200 rounded-xl mb-4 flex items-center justify-center text-4xl">🛍️</div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 flex-1">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-extrabold text-indigo-700">{Number(p.price)} {p.currency}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{p.stock > 0 ? "متوفر" : "نفد"}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">البائع: {p.vendor?.storeName}</p>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-500 py-10">لا توجد منتجات مطابقة.</p>}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm">
        ⚡ سيلايز SelaiZz © 2026 — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
