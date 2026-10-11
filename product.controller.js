import { prisma } from "../config/db.js";

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");

async function getVendor(req) {
  return prisma.vendor.findUnique({ where: { userId: req.user.sub } });
}

export async function createProduct(req, res) {
  const vendor = await getVendor(req);
  if (!vendor) return res.status(403).json({ error: "Vendor profile not found" });
  if (!vendor.isApproved) return res.status(403).json({ error: "Vendor not approved yet" });

  const { name, description, price, stock, currency, categoryId, images, status } = req.body;
  const product = await prisma.product.create({
    data: {
      vendorId: vendor.id, name, description, price, stock, currency, categoryId, images,
      status: status || "ACTIVE",
      slug: slugify(name) + "-" + Date.now().toString(36),
    },
  });
  res.status(201).json(product);
}

export async function myProducts(req, res) {
  const vendor = await getVendor(req);
  if (!vendor) return res.json([]);
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}

export async function updateProduct(req, res) {
  const vendor = await getVendor(req);
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.vendorId !== vendor?.id)
    return res.status(404).json({ error: "Product not found" });
  const product = await prisma.product.update({ where: { id: existing.id }, data: req.body });
  res.json(product);
}

export async function updateStock(req, res) {
  const vendor = await getVendor(req);
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.vendorId !== vendor?.id)
    return res.status(404).json({ error: "Product not found" });
  const product = await prisma.product.update({ where: { id: existing.id }, data: { stock: req.body.stock } });
  res.json(product);
}

export async function deleteProduct(req, res) {
  const vendor = await getVendor(req);
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.vendorId !== vendor?.id)
    return res.status(404).json({ error: "Product not found" });
  await prisma.product.update({ where: { id: existing.id }, data: { status: "ARCHIVED" } });
  res.json({ ok: true });
}

// Public storefront
export async function listProducts(req, res) {
  const { search, categoryId, page = 1, limit = 12 } = req.query;
  const where = {
    status: "ACTIVE",
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { name: { contains: String(search), mode: "insensitive" } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, include: { vendor: { select: { storeName: true, storeSlug: true } }, category: true },
      skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function getProduct(req, res) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { vendor: { select: { storeName: true, storeSlug: true } }, category: true },
  });
  if (!product || product.status !== "ACTIVE") return res.status(404).json({ error: "Not found" });
  res.json(product);
}

export async function listCategories(_req, res) {
  res.json(await prisma.category.findMany({ include: { _count: { select: { products: true } } } }));
}
