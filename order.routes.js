import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { checkoutSchema } from "../validators/schemas.js";
import * as orders from "../controllers/order.controller.js";

export const orderRouter = Router();

orderRouter.use(requireAuth("CUSTOMER", "VENDOR", "ADMIN"));
orderRouter.post("/checkout", validate(checkoutSchema), orders.checkout);
orderRouter.get("/mine", orders.myOrders);
