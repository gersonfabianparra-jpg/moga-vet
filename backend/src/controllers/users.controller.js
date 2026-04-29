import User from "../models/User.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);
const isRootUser = (u) => u?.rut === "__root__" || u?.username === "root";
const safe = ({ password, ...u }) => ({ ...u, isRoot: isRootUser(u) });

export const getAll = async (req, res, next) => {
  try {
    const users = await User.findAll(tid(req));
    res.json(users.map(safe));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { role: requestedRole, ...rest } = req.body;
    const isAdmin = req.user?.role === "admin";
    const role = isAdmin && ["admin", "vet", "client"].includes(requestedRole) ? requestedRole : "client";
    const user = await User.create({ ...rest, role, tenantId: req.user.tenantId });
    res.status(201).json(safe(user));
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "Usuario no encontrado." });
    const targetIsRoot = isRootUser(target);
    if (targetIsRoot && req.user.id !== target.id) {
      return res.status(403).json({ message: "No se puede modificar el usuario root." });
    }
    // Prevent cross-tenant edits
    if (target.tenantId != null && target.tenantId !== req.user.tenantId && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "No autorizado." });
    }
    const allowed = ["name", "email", "phone", "rut", "password", "role", "avatar"];
    const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (targetIsRoot) delete fields.role;
    const updated = await User.update(id, fields);
    res.json(safe(updated));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "Usuario no encontrado." });
    if (isRootUser(target)) return res.status(403).json({ message: "No se puede eliminar el usuario root." });
    if (id === req.user.id) return res.status(403).json({ message: "No puedes eliminarte a ti mismo." });
    // Prevent cross-tenant deletes
    if (target.tenantId != null && target.tenantId !== req.user.tenantId && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "No autorizado." });
    }
    await User.remove(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
