import Tenant        from "../models/Tenant.js";
import User          from "../models/User.js";
import ClinicSettings from "../models/ClinicSettings.js";
import jwt           from "jsonwebtoken";
import supabase      from "../config/supabase.js";

export const getAll = async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll();

    // Enriquecer con el nombre real desde clinic_settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("tenantId, clinicName, logoBase64");

    const settingsMap = {};
    (settings || []).forEach((s) => { settingsMap[String(s.tenantId)] = s; });

    const enriched = tenants.map((t) => {
      const cfg = settingsMap[String(t.id)];
      return {
        ...t,
        displayName: cfg?.clinicName || t.name,
        hasLogo: !!cfg?.logoBase64,
      };
    });

    res.json(enriched);
  } catch (err) { next(err); }
};

export const register = async (req, res, next) => {
  try {
    const { clinicName, ownerName, email, password, phone, city, plan } = req.body;

    if (!clinicName || !email || !password) {
      return res.status(400).json({ message: "clinicName, email y password son obligatorios." });
    }

    // Verificar email duplicado
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese correo." });
    }

    // Crear tenant
    const tenant = await Tenant.create({
      name:       clinicName,
      adminEmail: email,
      phone:      phone || null,
      city:       city  || null,
      plan:       plan  || "Starter",
      status:     "active",
      createdAt:  new Date().toISOString().slice(0, 10),
    });

    // Crear usuario admin para el tenant
    const adminUser = await User.create({
      name:     ownerName || clinicName,
      email,
      password,
      role:     "admin",
      tenantId: tenant.id,
      phone:    phone || null,
      avatar:   (ownerName || clinicName).slice(0, 2).toUpperCase(),
    });

    const token = jwt.sign(
      { id: adminUser.id, role: adminUser.role, tenantId: tenant.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { password: _, ...safeUser } = adminUser;
    res.status(201).json({ token, user: safeUser, tenant });
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const allowed = ["name","adminEmail","city","plan","status"];
    const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const tenant = await Tenant.update(+req.params.id, fields);
    res.json(tenant);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    if (!req.user?.isRoot) return res.status(403).json({ message: "Solo superadmin." });
    const { name, adminEmail, city, plan, status } = req.body;
    if (!name || !adminEmail) return res.status(400).json({ message: "Nombre y email son obligatorios." });
    const tenant = await Tenant.create({
      name, adminEmail,
      city: city || null,
      plan: plan || "Starter",
      status: status || "active",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json(tenant);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    if (!req.user?.isRoot) return res.status(403).json({ message: "Solo superadmin." });
    await Tenant.delete(+req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
