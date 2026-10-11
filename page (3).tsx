"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function VendorDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/vendor/analytics").then((r) => setData(r.data)).catch((e) => setError(e.response?.data?.error || "تعذر التحميل"));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">جاري التحميل…</p>;

  const cards = [
    { label: "إجمالي المنتجات", value: data.totalProducts, color: "text-indigo-600" },
    { label: "منتجات نشطة", value: data.activeProducts, color: "text-green-600" },
    { label: "الطلبات", value: data.totalOrderItems, color: "text-amber-600" },
    { label: "الإيرادات", value: `${data.revenue} ${data.currency}`, color: "text-emerald-600" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">مرحباً 👋 {data.storeName}</h2>
      {!data.isApproved && (
        <p className="bg-amber-50 border border-amber-300 text-amber-700 rounded-lg p-4 mb-6">
          ⏳ حسابك قيد المراجعة من إدارة المنصة. لن تتمكن من إضافة منتجات حتى الموافقة.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">{c.label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-bold text-lg mb-4">⚠️ مخزون منخفض (أقل من 5)</h3>
        {data.lowStock.length === 0 ? <p className="text-gray-500 text-sm">لا توجد منتجات منخفضة المخزون 🎉</p> : (
          <ul className="divide-y">
            {data.lowStock.map((p: any) => (
              <li key={p.id} className="py-2 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-red-600 font-bold">متبقي: {p.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
