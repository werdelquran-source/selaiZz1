"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);

  const load = () => api.get("/products/vendor/mine").then((r) => setProducts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const archive = async (id: string) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📦 منتجاتي</h2>
        <a href="/vendor/products/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">➕ منتج جديد</a>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-gray-600">
            <tr>
              <th className="text-right p-3">المنتج</th><th className="text-right p-3">السعر</th>
              <th className="text-right p-3">المخزون</th><th className="text-right p-3">الحالة</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-bold">{p.name}<p className="text-xs text-gray-400 font-normal">{p.category?.name}</p></td>
                <td className="p-3">{Number(p.price)} {p.currency}</td>
                <td className="p-3">
                  <span className={p.stock < 5 ? "text-red-600 font-bold" : ""}>{p.stock}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : p.status === "DRAFT" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"}`}>
                    {p.status === "ACTIVE" ? "نشط" : p.status === "DRAFT" ? "مسودة" : "مؤرشف"}
                  </span>
                </td>
                <td className="p-3">
                  {p.status !== "ARCHIVED" && (
                    <button onClick={() => archive(p.id)} className="text-red-500 hover:underline text-xs">أرشفة</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-gray-500">لا توجد منتجات بعد.</p>}
      </div>
    </div>
  );
}
