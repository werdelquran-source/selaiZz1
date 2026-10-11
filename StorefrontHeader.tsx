"use client";
import Link from "next/link";

export default function StorefrontHeader() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-extrabold">⚡ سيلايز <span className="text-amber-400">SelaiZz</span></Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/#products" className="hover:text-amber-400">المنتجات</Link>
          <Link href="/register" className="hover:text-amber-400">سجّل كبائع</Link>
          <Link href="/login" className="bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full font-bold hover:bg-amber-300">دخول</Link>
        </nav>
      </div>
    </header>
  );
}
