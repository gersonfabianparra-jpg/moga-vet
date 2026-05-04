import jwt            from "jsonwebtoken";
import User           from "../models/User.js";
import Tenant         from "../models/Tenant.js";
import ClinicSettings from "../models/ClinicSettings.js";

const isRootUser = (user) => user?.role === "superadmin" || user?.rut === "__root__" || user?.username === "root";

const sign = (user) => {
  const role = isRootUser(user) ? "superadmin" : user.role;
  return jwt.sign({ id: user.id, role, tenantId: user.tenantId ?? null, isRoot: isRootUser(user) }, process.env.JWT_SECRET, { expiresIn: "8h" });
};

const safeUser = ({ password, ...rest }) => ({
  ...rest,
  role: isRootUser(rest) ? "superadmin" : rest.role,
  isRoot: isRootUser(rest),
});

export const loginStaff = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await User.findByEmail(email);
    if (!user) user = await User.findByUsername(email);
    if (!user || user.password !== password || user.role === "client") {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const loginClient = async (req, res, next) => {
  try {
    const { query } = req.body;
    const user = await User.findByRutOrEmail(query?.trim());
    if (!user || user.role !== "client") {
      return res.status(404).json({ message: "Sin resultados para ese RUT o correo." });
    }
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
};

export const impersonate = async (req, res, next) => {
  try {
    if (!req.user.isRoot) {
      return res.status(403).json({ message: "Solo superadmin puede administrar clínicas." });
    }
    const tenantId = Number(req.params.tenantId);
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Clínica no encontrada." });

    // Preferir el nombre configurado en clinic_settings
    let clinicName = tenant.name;
    try {
      const cfg = await ClinicSettings.find(tenantId);
      if (cfg?.clinicName) clinicName = cfg.clinicName;
    } catch {}

    const token = jwt.sign(
      { id: req.user.id, role: "admin", tenantId, isRoot: false, impersonatedBy: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: req.user.id,
        name: clinicName,
        email: req.user.email,
        role: "admin",
        tenantId,
        impersonating: true,
        impersonatingClinic: clinicName,
      },
    });
  } catch (err) {
    next(err);
  }
};
