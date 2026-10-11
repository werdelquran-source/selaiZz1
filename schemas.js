import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2).max(100).optional(),
  storeName: z.string().min(2).max(100).optional(),
  accountType: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaCode: z.string().length(6).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  currency: z.string().length(3).default("SAR"),
  categoryId: z.string().optional(),
  images: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

export const updateProductSchema = productSchema.partial();

export const stockSchema = z.object({ stock: z.coerce.number().int().min(0) });

export const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.coerce.number().int().positive() })).min(1),
});
