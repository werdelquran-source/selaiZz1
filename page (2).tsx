"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { clearSession } from "@/lib/auth";

export default function AdminPanel() {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "vendors" | "users">("overview");

  const load = () => {
    api.get("/admin/overview").then((r) => setOverview(r.data)).catch(() => {});
    api.get("/admin/vendors").then((r) => setVendors(r.data)).catch(() => {});
    api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string, approved: boolean) => {
    await api.patch(`/admin/vendors/${id}/approve`, { approved });
    load();
  };

  const logout = () => { clearSession(); router.push("/login"); };

  const TABS = [
    { id: "overview", label: "📊 نظرة عامة" },
    { id: "vendors", label: "🏪 البائعون" },
    { id: "users", label: "👥 المستخدمون" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">⚡ سيلايز — لوحة المؤسس</h1>
        <button onClick={logout} className="text-sm bg-slate-700 hover:bg-red-600 px-4 py-2 rounded-lg transition">تسجيل الخروج</button>
      </header>
      <nav className="bg-white border-b flex gap-1 px-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition ${tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="p-6 max-w-6xl mx-auto">
        {tab === "overview" && overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { l: "المستخدمون", v: overview.users },
              { l: "البائعون", v: overview.vendors },
              { l: "بانتظار الموافقة", v: overview.pendingVendors },
              { l: "المنتجات", v: overview.products },
              { l: "الطلبات", v: overview.orders },
              { l: "الإيرادات", v: `${overview.revenue} ر.س` },
            ].map((c) => (
              <div key={c.l} className="bg-white rounded-2xl shadow p-5">
                <p className="text-gray-500 text-xs">{c.l}</p>
                <p className="text-2xl font-extrabold mt-1 text-indigo-700">{c.v}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "vendors" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-gray-600">
                <tr><th className="text-right p-3">المتجر</th><th className="text-right p-3">البريد</th><th className="text-right p-3">المنتجات</th><th className="text-right p-3">الحالة</th><th className="p-3"></th></tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="p-3 font-bold">{v.storeName}</td>
                    <td className="p-3 text-gray-500">{v.user?.email}</td>
                    <td className="p-3">{v._count?.products}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${v.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {v.isApproved ? "معتمد ✅" : "قيد المراجعة"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => approve(v.id, !v.isApproved)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${v.isApproved ? "bg-gray-400 hover:bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}>
                        {v.isApproved ? "إلغاء الاعتماد" : "اعتماد ✅"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-gray-600">
                <tr><th className="text-right p-3">البريد</th><th className="text-right p-3">الاسم</th><th className="text-right p-3">الدور</th><th className="text-right p-3">تاريخ الانضمام</th></tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.fullName || "—"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "VENDOR" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                        {u.role === "ADMIN" ? "مؤسس" : u.role === "VENDOR" ? "بائع" : "عميل"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("ar")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
