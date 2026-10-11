import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { vendorRouter } from "./routes/vendor.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL?.split(",") || true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.set("trust proxy", 1);
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "selaizz-api" }));
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`⚡ SelaiZz API running on http://localhost:${port}`));
