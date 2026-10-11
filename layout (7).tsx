import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سيلايز | SelaiZz — منصة التجارة الإلكترونية",
  description: "منصة سيلايز للتجارة الإلكترونية متعددة البائعين",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
