import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as vendor from "../controllers/vendor.controller.js";

export const vendorRouter = Router();

vendorRouter.use(requireAuth("VENDOR", "ADMIN"));
vendorRouter.get("/analytics", vendor.analytics);
vendorRouter.get("/orders", vendor.myOrders);
vendorRouter.patch("/orders/status", vendor.updateOrderStatus);
vendorRouter.patch("/profile", vendor.updateProfile);
