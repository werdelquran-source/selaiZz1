import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");

async function main() {
  const email = process.env.ADMIN_EMAIL || "founder@selaizz.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe!123";
  const storeName = process.env.ADMIN_STORE || "سيلايز";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash, isVerified: true },
    create: { email, passwordHash, role: "ADMIN", isVerified: true, fullName: "مؤسس سيلايز" },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: admin.id },
    update: { isApproved: true },
    create: { userId: admin.id, storeName, storeSlug: slugify("selaizz"), isApproved: true },
  });

  const cats = await Promise.all(
    ["إلكترونيات", "أزياء", "منزل ومطبخ", "رياضة"].map((name) =>
      prisma.category.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
    )
  );

  const count = await prisma.product.count({ where: { vendorId: vendor.id } });
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { vendorId: vendor.id, categoryId: cats[0].id, name: "سماعات لاسلكية برو", slug: "pro-wireless-earbuds-" + Date.now(), description: "سماعات بلوتوث بجودة عالية وبطارية تدوم 30 ساعة.", price: 199.99, stock: 50, status: "ACTIVE", images: JSON.stringify(["/p1.jpg"]) },
        { vendorId: vendor.id, categoryId: cats[1].id, name: "تيشيرت قطني فاخر", slug: "premium-cotton-tee-" + Date.now(), description: "قطن 100% بقصّة عصرية.", price: 79.0, stock: 120, status: "ACTIVE", images: JSON.stringify(["/p2.jpg"]) },
        { vendorId: vendor.id, categoryId: cats[2].id, name: "طقم قدور جرانيت", slug: "granite-pot-set-" + Date.now(), description: "طقم 10 قطع مقاوم للالتصاق.", price: 349.0, stock: 15, status: "ACTIVE", images: JSON.stringify(["/p3.jpg"]) },
      ],
    });
  }

  console.log("✅ Seed done. Admin login:", email, "/", password);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
