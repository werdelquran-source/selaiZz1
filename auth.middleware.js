import jwt from "jsonwebtoken";

export function requireAuth(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.mfaPending) return res.status(403).json({ error: "MFA required" });
      if (roles.length && !roles.includes(payload.role))
        return res.status(403).json({ error: "Forbidden" });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* anonymous */ }
  }
  next();
}
