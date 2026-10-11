"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const NAV = [
  { href: "/vendor/dashboard", label: "📊 لوحة التحكم" },
  { href: "/vendor/products", label: "📦 منتجاتي" },
  { href: "/vendor/products/new", label: "➕ منتج جديد" },
  { href: "/vendor/orders", label: "🧾 الطلبات" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col shrink-0">
        <h1 className="text-2xl font-extrabold mb-8 px-2">⚡ سيلايز</h1>
        <nav className="space-y-1 flex-1">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href}
              className={`block px-3 py-2.5 rounded-lg transition ${pathname === i.href ? "bg-indigo-600 font-bold" : "hover:bg-slate-700"}`}>
              {i.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { clearSession(); router.push("/login"); }}
          className="mt-4 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-red-600 transition text-right">
          🚪 تسجيل الخروج
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
