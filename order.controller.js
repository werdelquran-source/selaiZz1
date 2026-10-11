import { prisma } from "../config/db.js";

// Simple checkout: creates order + items, decrements stock atomically
export async function checkout(req, res) {
  const { items } = req.body;
  const customerId = req.user.sub;

  const order = await prisma.$transaction(async (tx) => {
    let total = 0;
    const lines = [];
    for (const line of items) {
      const product = await tx.product.findUnique({ where: { id: line.productId } });
      if (!product || product.status !== "ACTIVE") throw Object.assign(new Error("Product unavailable"), { status: 400 });
      if (product.stock < line.qty) throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 400 });
      total += Number(product.price) * line.qty;
      lines.push({ product, qty: line.qty });
    }
    const created = await tx.order.create({
      data: { customerId, total, status: "PAID" },
    });
    for (const { product, qty } of lines) {
      await tx.orderItem.create({
        data: { orderId: created.id, productId: product.id, qty, price: product.price },
      });
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: qty } } });
    }
    return created;
  });

  res.status(201).json(order);
}

export async function myOrders(req, res) {
  res.json(await prisma.order.findMany({
    where: { customerId: req.user.sub },
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
    orderBy: { createdAt: "desc" },
  }));
}
