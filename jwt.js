import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db.js";

export function signAccessToken(user, extra = {}) {
  return jwt.sign(
    { sub: user.id, role: user.role, ...extra },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function newRefreshToken(user) {
  const raw = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, tokenHash };
}

export async function issueTokens(user, extra = {}) {
  const access = signAccessToken(user, extra);
  const { raw, tokenHash } = newRefreshToken(user);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return { access, refresh: raw };
}

export async function rotateRefreshToken(raw) {
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!stored || stored.expiresAt < new Date()) return null;
  // Rotation: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const user = stored.user;
  const access = signAccessToken(user);
  const fresh = newRefreshToken(user);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: fresh.tokenHash, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  return { access, refresh: fresh.raw, role: user.role };
}

export function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
