import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { productSchema, stockSchema, updateProductSchema } from "../validators/schemas.js";
import * as products from "../controllers/product.controller.js";

export const productRouter = Router();

// Public
productRouter.get("/", products.listProducts);
productRouter.get("/categories", products.listCategories);
productRouter.get("/:slug", products.getProduct);

// Vendor-only management
productRouter.post("/", requireAuth("VENDOR", "ADMIN"), validate(productSchema), products.createProduct);
productRouter.get("/vendor/mine", requireAuth("VENDOR", "ADMIN"), products.myProducts);
productRouter.patch("/:id", requireAuth("VENDOR", "ADMIN"), validate(updateProductSchema), products.updateProduct);
productRouter.patch("/:id/stock", requireAuth("VENDOR", "ADMIN"), validate(stockSchema), products.updateStock);
productRouter.delete("/:id", requireAuth("VENDOR", "ADMIN"), products.deleteProduct);
