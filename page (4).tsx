"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const STATUS_AR: Record<string, string> = { PENDING: "قيد الانتظار", PAID: "مدفوع", SHIPPED: "تم الشحن", DELIVERED: "تم التوصيل", CANCELLED: "ملغي" };

export default function VendorOrders() {
  const [items, setItems] = useState<any[]>([]);

  const load = () => api.get("/vendor/orders").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const setStatus = async (orderId: string, status: string) => {
    await api.patch("/vendor/orders/status", { orderId, status });
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🧾 طلبات متجري</h2>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-gray-600">
            <tr><th className="text-right p-3">المنتج</th><th className="text-right p-3">الكمية</th><th className="text-right p-3">العميل</th><th className="text-right p-3">الحالة</th><th className="text-right p-3">تحديث</th></tr>
          </thead>
          <tbody className="divide-y">
            {items.map((i) => (
              <tr key={i.id}>
                <td className="p-3 font-bold">{i.product?.name}</td>
                <td className="p-3">{i.qty} × {Number(i.price)}</td>
                <td className="p-3">{i.order?.customer?.fullName || i.order?.customer?.email}</td>
                <td className="p-3">{STATUS_AR[i.order?.status] || i.order?.status}</td>
                <td className="p-3">
                  <select defaultValue="" onChange={(e) => e.target.value && setStatus(i.orderId, e.target.value)} className="border rounded-lg px-2 py-1 text-xs">
                    <option value="" disabled>تغيير…</option>
                    {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-8 text-center text-gray-500">لا توجد طلبات بعد.</p>}
      </div>
    </div>
  );
}
