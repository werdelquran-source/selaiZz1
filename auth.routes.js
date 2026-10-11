import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validators/schemas.js";
import * as auth from "../controllers/auth.controller.js";

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

authRouter.post("/register", authLimiter, validate(registerSchema), auth.register);
authRouter.post("/login", authLimiter, validate(loginSchema), auth.login);
authRouter.post("/refresh", authLimiter, auth.refresh);
authRouter.post("/logout", auth.logout);
authRouter.get("/me", requireAuth(), auth.me);
authRouter.post("/mfa/setup", requireAuth(), auth.mfaSetup);
authRouter.post("/mfa/enable", requireAuth(), auth.mfaEnable);
