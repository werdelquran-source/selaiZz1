import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as admin from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth("ADMIN"));
adminRouter.get("/overview", admin.overview);
adminRouter.get("/vendors", admin.listVendors);
adminRouter.patch("/vendors/:id/approve", admin.approveVendor);
adminRouter.get("/users", admin.listUsers);
adminRouter.get("/orders", admin.listOrders);
