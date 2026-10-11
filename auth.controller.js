import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { prisma } from "../config/db.js";
import { issueTokens, rotateRefreshToken, sha256, signAccessToken } from "../utils/jwt.js";

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");

export async function register(req, res) {
  const { email, password, fullName, storeName, accountType } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email, passwordHash, fullName, role: accountType, isVerified: true },
    });
    if (accountType === "VENDOR") {
      const base = slugify(storeName || email.split("@")[0]);
      await tx.vendor.create({
        data: { userId: u.id, storeName: storeName || email.split("@")[0], storeSlug: base + "-" + u.id.slice(-4) },
      });
    }
    return u;
  });

  const tokens = await issueTokens(user);
  res.status(201).json({ ...tokens, role: user.role, email: user.email });
}

export async function login(req, res) {
  const { email, password, mfaCode } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: "Invalid credentials" });

  if (user.mfaEnabled) {
    if (!mfaCode) {
      const temp = signAccessToken(user, { mfaPending: true });
      return res.json({ mfaPending: true, tempToken: temp });
    }
    if (!authenticator.check(mfaCode, user.mfaSecret))
      return res.status(401).json({ error: "Invalid MFA code" });
  }

  const tokens = await issueTokens(user);
  res.json({ ...tokens, role: user.role, email: user.email, fullName: user.fullName });
}

export async function refresh(req, res) {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ error: "Refresh token required" });
  const rotated = await rotateRefreshToken(refresh);
  if (!rotated) return res.status(401).json({ error: "Invalid refresh token" });
  res.json(rotated);
}

export async function logout(req, res) {
  const { refresh } = req.body;
  if (refresh) await prisma.refreshToken.deleteMany({ where: { tokenHash: sha256(refresh) } });
  res.json({ ok: true });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    include: { vendor: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({
    id: user.id, email: user.email, role: user.role, fullName: user.fullName,
    mfaEnabled: user.mfaEnabled, vendor: user.vendor,
  });
}

export async function mfaSetup(req, res) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(req.user.email, "SelaiZz", secret);
  await prisma.user.update({ where: { id: req.user.sub }, data: { mfaSecret: secret } });
  res.json({ secret, otpauth });
}

export async function mfaEnable(req, res) {
  const { code } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user?.mfaSecret || !authenticator.check(code, user.mfaSecret))
    return res.status(400).json({ error: "Invalid code" });
  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true } });
  res.json({ ok: true });
}
