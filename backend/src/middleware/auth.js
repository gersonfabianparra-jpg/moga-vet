import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Se requiere rol admin" });
    }
    next();
  });
}

export function requireStaff(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role === "client") {
      return res.status(403).json({ message: "Acceso solo para personal de la clínica" });
    }
    next();
  });
}
