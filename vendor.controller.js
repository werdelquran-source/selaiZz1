import { prisma } from "../config/db.js";

export async function analytics(req, res) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.sub },
    include: { products: true },
  });
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  const items = await prisma.orderItem.findMany({
    where: { product: { vendorId: vendor.id } },
    include: { order: true },
  });

  const revenue = items
    .filter((i) => i.order.status !== "CANCELLED")
    .reduce((s, i) => s + Number(i.price) * i.qty, 0);

  const byStatus = items.reduce((acc, i) => {
    acc[i.order.status] = (acc[i.order.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalProducts: vendor.products.length,
    activeProducts: vendor.products.filter((p) => p.status === "ACTIVE").length,
    lowStock: vendor.products.filter((p) => p.status === "ACTIVE" && p.stock < 5),
    totalOrderItems: items.length,
    ordersByStatus: byStatus,
    revenue: revenue.toFixed(2),
    currency: "SAR",
    isApproved: vendor.isApproved,
    storeName: vendor.storeName,
  });
}

export async function myOrders(req, res) {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.sub } });
  if (!vendor) return res.json([]);
  const items = await prisma.orderItem.findMany({
    where: { product: { vendorId: vendor.id } },
    include: { order: { include: { customer: { select: { email: true, fullName: true } } } }, product: { select: { name: true, id: true } } },
    orderBy: { id: "desc" },
  });
  res.json(items);
}

export async function updateOrderStatus(req, res) {
  const { orderId, status } = req.body;
  if (!["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.sub } });
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { vendorId: true } } } } },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const owns = order.items.some((i) => i.product.vendorId === vendor?.id);
  if (!owns && req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });
  res.json(updated);
}

export async function updateProfile(req, res) {
  const { storeName, logoUrl } = req.body;
  const vendor = await prisma.vendor.update({
    where: { userId: req.user.sub },
    data: { storeName, logoUrl },
  });
  res.json(vendor);
}
