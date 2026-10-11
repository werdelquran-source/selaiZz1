import { prisma } from "../config/db.js";

export async function overview(_req, res) {
  const [users, vendors, products, orders, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
  ]);
  const pendingVendors = await prisma.vendor.count({ where: { isApproved: false } });
  res.json({
    users, vendors, products, orders,
    pendingVendors,
    revenue: Number(revenueAgg._sum.total || 0).toFixed(2),
  });
}

export async function listVendors(_req, res) {
  res.json(await prisma.vendor.findMany({
    include: { user: { select: { email: true, createdAt: true } }, _count: { select: { products: true } } },
    orderBy: { id: "desc" },
  }));
}

export async function approveVendor(req, res) {
  const vendor = await prisma.vendor.update({
    where: { id: req.params.id },
    data: { isApproved: req.body.approved },
  });
  res.json(vendor);
}

export async function listUsers(_req, res) {
  res.json(await prisma.user.findMany({
    select: { id: true, email: true, role: true, isVerified: true, createdAt: true, fullName: true },
    orderBy: { createdAt: "desc" },
  }));
}

export async function listOrders(_req, res) {
  res.json(await prisma.order.findMany({
    include: { customer: { select: { email: true } }, items: { include: { product: { select: { name: true, vendorId: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  }));
}
